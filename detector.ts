import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
}); 

const fallacyAnalysisSchema = {
    type: Type.OBJECT, 
    properties: {
        hasFallacies: {
            type: Type.BOOLEAN,
            description: "True if at least one logical fallacy was identified in the argument."
        }, 
        fallacies: {
            type: Type.ARRAY, 
            description: "List of formal or informal logical fallacies detected.",
            items: {
                type: Type.OBJECT, 
                properties: {
                    name: {
                        type: Type.STRING, 
                        description: "The standard name of the logical fallacy",
                    }, 
                    quote: {
                        type: Type.STRING, 
                        description: "The exact quote or clause committing this fallacy.", 
                    }, 
                    explanation: {
                        type: Type.STRING, 
                        description: "Concise explanation of why this represents the fallacy."
                    }
                },
                required: ["name", "quote", "explanation"],
            },
        },
        summary: {
            type: Type.STRING, 
            description: "A brief overall assessment of the logical soundness.",
        }
    }, 
    required: ['hasFallacies', 'fallacies', 'summary']
};

interface FallacyDetail {
  name: string;
  quote: string;
  explanation: string;
}

interface StructuredResult {
  hasFallacies: boolean;
  fallacies: FallacyDetail[];
  summary: string;
}

export async function detectFallacies(argumentText: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash', 
        contents: `Analyze the following argument for logical fallacies:\n\n"${argumentText}"`,
        config: {
        systemInstruction: `You are an expert logician. Analyze user-provided arguments solely for logical fallacies.
        - Be objective and neutral.
        - Do not judge the truth value of the conclusion, only the structural validity of the reasoning.
        - If no logical fallacies exist, set hasFallacies to false and leave fallacies empty.`,
        responseMimeType: 'application/json',
        responseSchema: fallacyAnalysisSchema,
        temperature: 0.1
        }
    }); 

    if (!response.text) {
        return "No output returned from Gemini API";
    }

    const parsed = JSON.parse(response.text) as StructuredResult; 

    if(!parsed.hasFallacies || parsed.fallacies.length === 0) {
        return `Analysis: **Sound Reasoning**\n**Summary**: ${parsed.summary}`
    }

    const fallacyList = parsed.fallacies 
        .map(
            (f, index) =>
                `**${index + 1}. ${f.name}**\n   **Quote:** "${f.quote}"\n   **Explanation:** ${f.explanation}`
        )
        .join('\n\n');

    return `Analysis: **Logical Fallacies Detected**\n**Summary:** ${parsed.summary}\n\n**Detected Fallacies:**\n${fallacyList}`
}


