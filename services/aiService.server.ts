import { GoogleGenAI, Type } from '@google/genai';
import type { PeppolServiceGroup } from '../types.server';
import { getDocumentTitle } from '../utils/peppolUtils.shared';
import { ApiError } from '../utils/errors.server';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        explanation: {
            type: Type.STRING,
            description: 'A concise, easy-to-understand explanation of the PEPPOL capability, aimed at a business or developer audience. Explain what the document is, what the process is for, and what the transport profile means.',
        },
        examplePayload: {
            type: Type.STRING,
            description: 'A valid, complete, and well-formatted example XML payload for this specific document type. It should include realistic but fictional data.',
        }
    },
    required: ['explanation', 'examplePayload'],
};

export const explainAndGenerateExample = async (serviceGroup: PeppolServiceGroup): Promise<{ explanation: string, examplePayload: string }> => {
    
    if (!process.env.API_KEY) {
        throw new ApiError('The Gemini API key is not configured on the server.');
    }
    
    const documentTitle = getDocumentTitle(serviceGroup.documentIdentifier.value);
    const processInfo = serviceGroup.processes[0]; // Assuming first process is representative
    const endpointInfo = processInfo.serviceEndpointList[0]; // Assuming first endpoint is representative

    const prompt = `
        You are an expert assistant for the PEPPOL e-delivery network.
        A user is looking at a specific capability for a PEPPOL participant. Please provide a clear explanation and a valid example XML payload.

        **PEPPOL Capability Details:**
        - **Document Type:** ${documentTitle} (${serviceGroup.documentIdentifier.value})
        - **Process ID:** ${processInfo.processIdentifier.value}
        - **Transport Profile:** ${endpointInfo.transportProfile}

        **Instructions:**
        1.  **Explanation:** In about 2-3 sentences, explain what this capability means in simple terms. Describe what kind of document can be exchanged, the business process it's part of, and the communication method (transport profile).
        2.  **Example Payload:** Generate a complete, valid, and well-formatted XML example for a '${documentTitle}' document that conforms to the PEPPOL standard. Use realistic but entirely fictional data for sender, receiver, and line items. The XML should be ready to be used for testing.
        
        Return the response in JSON format according to the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);

        if (!parsed.explanation || !parsed.examplePayload) {
            throw new Error('AI response is missing required fields.');
        }

        return parsed;

    } catch (error: any) {
        console.error("Gemini API call failed:", error);
        throw new ApiError(`Failed to get explanation from AI assistant. Reason: ${error.message}`);
    }
};