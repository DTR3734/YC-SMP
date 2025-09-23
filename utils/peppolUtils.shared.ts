// utils/peppolUtils.shared.ts

/**
 * This file contains shared PEPPOL utility functions and constants
 * that can be safely used by both the server-side and client-side code.
 */

const DOCUMENT_TYPE_MAP: Record<string, string> = {
    'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2': 'Invoice',
    'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2': 'Credit Note',
    'urn:oasis:names:specification:ubl:schema:xsd:Order-2': 'Order',
    'urn:oasis:names:specification:ubl:schema:xsd:OrderResponse-2': 'Order Response',
    'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2': 'Despatch Advice (ASN)',
};

const PROCESS_ID_MAP: Record<string, string> = {
    'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0': 'PEPPOL Billing Process',
    'urn:fdc:peppol.eu:poacc:trns:order:3': 'PEPPOL Ordering Process',
    'urn:fdc:peppol.eu:poacc:trns:despatch_advice:3': 'PEPPOL Despatch Process',
};

/**
 * Gets a human-readable title for a PEPPOL document identifier.
 * @param identifier The full document identifier string.
 * @returns A shorter, human-readable name or a fallback.
 */
export const getDocumentTitle = (identifier: string): string => {
    const key = Object.keys(DOCUMENT_TYPE_MAP).find(k => identifier.startsWith(k));
    return key ? DOCUMENT_TYPE_MAP[key] : identifier.split('::')[0];
};

/**
 * Gets a human-readable title for a PEPPOL process identifier.
 * @param identifier The full process identifier string.
 * @returns A human-readable name or the original identifier as a fallback.
 */
export const getProcessTitle = (identifier: string): string => {
    return PROCESS_ID_MAP[identifier] || identifier;
};
