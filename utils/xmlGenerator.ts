import type { PeppolServiceGroup } from '../types';

/**
 * Generates an SMP ServiceGroup XML string for a participant.
 * This is a simplified representation.
 * @param participantId The PEPPOL participant ID.
 * @param serviceGroup The service group data.
 * @returns A formatted XML string.
 */
export const generateServiceGroupXml = (participantId: string, serviceGroup: PeppolServiceGroup): string => {
    const { documentIdentifier } = serviceGroup;
    const participantValue = participantId.split('::')[1];
    const participantScheme = participantId.split('::')[0];

    return `<?xml version="1.0" encoding="UTF-8"?>
<ServiceGroup xmlns="http://busdox.org/servicegroup/1.0">
    <ParticipantIdentifier scheme="${participantScheme}">${participantValue}</ParticipantIdentifier>
    <ServiceMetadataReferenceCollection>
        <ServiceMetadataReference href="https://smp.example.com/${participantScheme}::${participantValue}/services/${encodeURIComponent(documentIdentifier.value)}"/>
    </ServiceMetadataReferenceCollection>
</ServiceGroup>`;
};

/**
 * Generates an SMP SignedServiceMetadata XML string.
 * This is a simplified representation.
 * @param serviceGroup The service group data.
 * @returns A formatted XML string.
 */
export const generateSignedServiceMetadataXml = (serviceGroup: PeppolServiceGroup): string => {
     const { documentIdentifier, processes } = serviceGroup;
     
     const endpointsXml = processes.map(process =>
        process.serviceEndpointList.map(endpoint => `
            <sm:Endpoint>
                <smp:TransportProfile>${endpoint.transportProfile}</smp:TransportProfile>
                <wsa:EndpointReference>
                    <wsa:Address>${endpoint.endpointReference}</wsa:Address>
                </wsa:EndpointReference>
                <smp:RequireBusinessLevelSignature>${endpoint.requireBusinessLevelSignature}</smp:RequireBusinessLevelSignature>
                <smp:Certificate>${btoa(endpoint.certificateDetails)}</smp:Certificate>
            </sm:Endpoint>`
        ).join('')
     ).join('');

     const processXml = processes.map(process => `
        <sm:Process>
            <smp:ProcessIdentifier scheme="${process.processIdentifier.scheme}">${process.processIdentifier.value}</smp:ProcessIdentifier>
            <sm:ServiceEndpointList>${endpointsXml}</sm:ServiceEndpointList>
        </sm:Process>
     `).join('');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<SignedServiceMetadata xmlns="http://busdox.org/servicemetadata/1.0"
    xmlns:sm="http://busdox.org/servicemetadata/1.0"
    xmlns:smp="http://busdox.org/servicegroup/1.0"
    xmlns:wsa="http://www.w3.org/2005/08/addressing">
    <ServiceInformation>
        <smp:ParticipantIdentifier scheme="${documentIdentifier.scheme}">${documentIdentifier.value.split('::')[0]}</smp:ParticipantIdentifier>
        <smp:DocumentIdentifier scheme="busdox-docid-qns">${documentIdentifier.value}</smp:DocumentIdentifier>
        <sm:ProcessList>${processXml}</sm:ProcessList>
    </ServiceInformation>
</SignedServiceMetadata>`;
};
