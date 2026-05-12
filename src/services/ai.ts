import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeResume(resumeText: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following resume text and provide:
      1. Key Skills (list)
      2. Recommended Job Roles
      3. Strengths
      4. Areas for Improvement
      
      Format the output as JSON.
      
      Resume Text:
      ${resumeText}`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
}

export async function getJobRecommendations(studentSkills: string[], jobListings: any[]) {
  try {
    const prompt = `Based on the student's skills: ${studentSkills.join(", ")}, recommend the best matching jobs from these listings:
    ${JSON.stringify(jobListings)}
    
    Provide a list of recommended job IDs and a brief reason for each recommendation.
    Format as JSON: { recommendations: [{ jobId: string, reason: string }] }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return { recommendations: [] };
  }
}
