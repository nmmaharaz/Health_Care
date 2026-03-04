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
            
            Patient Symptoms: ${userProblem}

Available Doctors (JSON):
${JSON.stringify(doctorsData, null, 2)}

CRITICAL INSTRUCTIONS:
1. Carefully analyze the symptoms: "${userProblem}"
2. Determine the MOST RELEVANT medical specialty for these specific symptoms
3. Match ALL doctors whose specialties array contains the relevant specialty
4. A doctor may have multiple specialties - check ALL of them in the "specialties" array
5. Return ALL doctors that have a matching specialty (e.g., if 2 doctors have Neurology, return both)
6. When returning results, include ALL specialties for each doctor, with the MOST RELEVANT specialty FIRST in the array
   Example: If doctor has ["Nephrology", "Neurology"] and symptoms are "headache", return "specialties": ["Neurology", "Nephrology"]
7. Prioritize by: Best specialty match > Highest rating > Most experience
8. Return up to 10 doctors maximum (return ALL matching doctors if less than 10)
9. Return ONLY a valid JSON array with these EXACT keys for each doctor:
   - id, name, specialties (array with MATCHED specialty first), experience, averageRating, 
     appointmentFee, qualification, designation, currentWorkingPlace, profilePhoto

Example format:
[
  {
    "id": "doctor-id-1",
    "name": "Dr. Name 1",
    "specialties": ["Neurology", "Nephrology"],
    "experience": 5,
    "averageRating": 4.5,
    "appointmentFee": 2000,
    "qualification": "MBBS, MD",
    "designation": "Consultant",
    "currentWorkingPlace": "Hospital",
    "profilePhoto": "url or null"
  },
  {
    "id": "doctor-id-2",
    "name": "Dr. Name 2",
    "specialties": ["Neurology"],
    "experience": 8,
    "averageRating": 4.8,
    "appointmentFee": 2500,
    "qualification": "MBBS, MD, DM",
    "designation": "Senior Consultant",
    "currentWorkingPlace": "Medical Center",
    "profilePhoto": "url or null"
  }
]

RESPOND WITH ONLY THE JSON ARRAY - NO EXPLANATIONS, NO MARKDOWN, NO EXTRA TEXT.
        `;

        const result = await model.generateContent(prompt);
        const cleanedJson = result.response.text()
            .replace(/```(?:json)?\s*/g, "") // remove ``` or ```json
            .replace(/```$/g, "") // remove ending ```
            .trim();

        const suggestedDoctors = JSON.parse(cleanedJson);

        // Validate that response is an array
        if (!Array.isArray(suggestedDoctors)) {
            console.error('AI response is not an array:', suggestedDoctors);
            return [];
        }

        return suggestedDoctors;
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        throw new Error(error.message || "AI failed to respond");
    }
};