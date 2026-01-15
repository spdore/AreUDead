import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateEmergencyMessage = async (
  userName: string, 
  contactName: string, 
  tone: 'serious' | 'caring' | 'technical'
): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Write a short, concise emergency email message.
      Sender Name: ${userName || 'The User'}
      Recipient Name: ${contactName || 'Emergency Contact'}
      Context: The sender has not checked into their safety app for 3 days. This is an automated trigger.
      Tone: ${tone}
      
      Requirements:
      - Do not include subject lines or placeholders like [Link].
      - Keep it under 50 words.
      - Make it clear this is a serious safety alert.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Emergency: I have not checked in for 3 days.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Emergency: I have not checked in for 3 days. Please verify my safety.";
  }
};