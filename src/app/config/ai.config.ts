import { GoogleGenerativeAI } from "@google/generative-ai";
import { envVars } from "./env";

const genAI = new GoogleGenerativeAI(envVars.gemini_api as string);

export const suggestDoctor = async (doctorsData: any, userProblem: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `
            You are a medical assistant. 
            User Problem: "${userProblem}"
            Available Doctors: ${JSON.stringify(doctorsData)}
            
            Instruction: Recommend the best doctor and explain why.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        throw new Error(error.message || "AI failed to respond");
    }
};