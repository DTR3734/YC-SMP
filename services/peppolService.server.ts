
import { getDb } from '../database/database';
import { ApiError } from '../utils/errors.server';
import xmlbuilder from 'xmlbuilder';
import { SignedXml } from 'xml-crypto';
import fs from 'fs';
import path from 'path';

// --- Configuration ---

// Fallback to a default if the environment variable is not set.
const SMP_BASE_URL = process.env.SMP_BASE_URL || 'https://localhost:3001';

// --- Type Definitions for Database Rows ---

interface ParticipantRow {
    id: string;
    participantId: string;
    name: string;
}

interface ServiceRow {
    doc_scheme: string;
    doc_value: string;
}

interface ProcessRow extends ServiceRow {
    process_scheme: string;
    process_value: string;
}

interface EndpointRow extends ProcessRow {
    transport_profile: string;
    endpoint_reference: string;
    require_business_level_signature: boolean;
    certificate_details: string; // Base64 encoded certificate
}

// --- Main Exported Functions ---

/**
 * Generates and returns the Service Group XML for a given participant.
 * This XML lists all the document types the participant is capable of receiving.
 *
 * @param participantId The PEPPOL participant identifier.
 * @returns A promise that resolves with the Service Group XML string.
 */
export const getServiceGroup = async (participantId: string): Promise<string> => {
    const db = getDb();
    const client = await db.connect();

    try {
        // First, verify the participant exists.
        const participantResult = await client.query(
            'SELECT id FROM managed_participants WHERE participantId = $1',
            [participantId]
        );
        if (participantResult.rows.length === 0) {
            throw new ApiError(`Participant ${participantId} not found.`, 404);
        }

        // Fetch all distinct document identifiers (services) for the participant.
        const servicesResult = await client.query<ServiceRow>(`
            SELECT DISTINCT sg.doc_scheme, sg.doc_value
            FROM peppol_service_groups sg
            JOIN managed_participants mp ON sg.lookup_id = mp.id
            WHERE mp.participantId = $1
        `, [participantId]);

        const services = servicesResult.rows;

        // Build the XML response using xmlbuilder.
        const root = xmlbuilder.create('ServiceGroup', {
            version: '1.0',
            encoding: 'UTF-8'
        }).att('xmlns', 'http://peppol.eu/schema/locator/2017/08/');

        const participantIdElem = root.ele('ParticipantIdentifier');
        const [scheme, value] = participantId.split('::');
        participantIdElem.att('scheme', scheme).text(value);

        const serviceList = root.ele('ServiceMetadataReferenceCollection');

        for (const service of services) {
            const docId = `${service.doc_scheme}::${service.doc_value}`;
            // The HRef must be an absolute URL pointing to the ServiceMetadata endpoint.
            const serviceMetadataUrl = `${SMP_BASE_URL}/${encodeURIComponent(participantId)}/services/${encodeURIComponent(docId)}`;
            
            serviceList.ele('ServiceMetadataReference').att('href', serviceMetadataUrl);
        }

        return root.end({ pretty: true });

    } finally {
        client.release();
    }
};

/**
 * Generates and returns the Signed Service Metadata XML for a specific document type
 * registered to a participant. This XML contains the endpoints and technical details
 * required to send a document of that type to the participant.
 *
 * @param participantId The PEPPOL participant identifier.
 * @param documentId The document identifier (e.g., 'busdox-docid-qns::urn:oasis:names:specification:...').
 * @returns A promise that resolves with the Signed Service Metadata XML string.
 */
export const getServiceMetadata = async (participantId: string, documentId: string): Promise<string> => {
    const db = getDb();
    const client = await db.connect();
    const [docScheme, docValue] = documentId.split('::');

    try {
        // Fetch all processes and their endpoints for the given participant and document type.
        const processResult = await client.query<EndpointRow>(`
            SELECT 
                p.process_scheme, p.process_value,
                e.transport_profile, e.endpoint_reference, e.require_business_level_signature, e.certificate_details
            FROM managed_participants mp
            JOIN peppol_service_groups sg ON mp.id = sg.lookup_id
            JOIN peppol_processes p ON sg.id = p.service_group_id
            JOIN peppol_endpoints e ON p.id = e.process_id
            WHERE mp.participantId = $1
            AND sg.doc_scheme = $2
            AND sg.doc_value = $3
        `, [participantId, docScheme, docValue]);

        const processes = processResult.rows;

        if (processes.length === 0) {
            throw new ApiError(`Service metadata for document ${documentId} not found for participant ${participantId}.`, 404);
        }

        // Group endpoints by process, as a service can have multiple processes.
        const processMap = new Map<string, any>();
        for (const row of processes) {
            const processKey = `${row.process_scheme}::${row.process_value}`;
            if (!processMap.has(processKey)) {
                processMap.set(processKey, {
                    processIdentifier: { scheme: row.process_scheme, value: row.process_value },
                    endpoints: []
                });
            }
            processMap.get(processKey).endpoints.push({
                transportProfile: row.transport_profile,
                endpointReference: row.endpoint_reference,
                requireBusinessLevelSignature: row.require_business_level_signature,
                certificate: row.certificate_details // This should be a base64 encoded string
            });
        }

        // Build the XML for the ServiceInformation element. This is what we will sign.
        const serviceInfo = xmlbuilder.create('ServiceInformation', { headless: true })
        
        const participantIdElem = serviceInfo.ele('ParticipantIdentifier');
        const [pScheme, pValue] = participantId.split('::');
        participantIdElem.att('scheme', pScheme).text(pValue);

        const docIdElem = serviceInfo.ele('DocumentIdentifier');
        docIdElem.att('scheme', docScheme).text(docValue);
        
        const processList = serviceInfo.ele('ProcessList');
        
        for (const [_, processData] of processMap.entries()) {
            const processElem = processList.ele('Process');
            const procIdElem = processElem.ele('ProcessIdentifier');
            procIdElem.att('scheme', processData.processIdentifier.scheme).text(processData.processIdentifier.value);

            const endpointList = processElem.ele('ServiceEndpointList');
            for (const endpoint of processData.endpoints) {
                const endpointElem = endpointList.ele('Endpoint');
                endpointElem.att('transportProfile', endpoint.transportProfile);
                endpointElem.ele('EndpointReference').ele('Address').text(endpoint.endpointReference);
                endpointElem.ele('RequireBusinessLevelSignature').text(endpoint.requireBusinessLevelSignature);
                endpointElem.ele('Certificate').text(endpoint.certificate);
            }
        }
        
        const serviceInfoXml = serviceInfo.end();

        // Create the digital signature
        const sig = new SignedXml();
        sig.addReference("//*[local-name()='ServiceInformation']");    
        sig.signingKey = fs.readFileSync(path.join(process.cwd(), 'key.pem'));
        sig.computeSignature(serviceInfoXml, { prefix: 'ds' });

        // Build the final SignedServiceMetadata XML
        const root = xmlbuilder.create('SignedServiceMetadata', {
            version: '1.0',
            encoding: 'UTF-8'
        });

        // Append the unsigned ServiceInformation element
        root.raw(serviceInfoXml);
        
        // Append the signature
        root.raw(sig.getSignatureXml());

        return root.end({ pretty: true });

    } finally {
        client.release();
    }
};
