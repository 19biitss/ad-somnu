import { GoogleGenAI, Chat } from "@google/genai";
import { TRANSLATIONS } from "../constants";
import { Language } from "../types";

const REJECTION_MSGS_KEY = 'hipnosReject'; // Base key for rejection messages

const getRejectionMessages = (lang: Language) => {
  const t = TRANSLATIONS[lang];
  return [t.hipnosReject1, t.hipnosReject2, t.hipnosReject3].join(' || ');
};

export const createHipnosChat = (ai: GoogleGenAI, lang: Language): Chat => {
  const t = TRANSLATIONS[lang];
  const rejectionMessages = getRejectionMessages(lang);
  
  const systemInstruction = `
    You are Hipnos, an AI assistant dedicated EXCLUSIVELY to helping users with sleep, insomnia, and sleep hygiene.
    
    Current Language: ${lang}
    
    Rules:
    1. Answer ONLY questions related to sleep, insomnia, dreams (scientifically), resting habits, and relaxation techniques.
    2. If a user asks about anything else (politics, coding, general knowledge, math, etc.), you MUST refuse to answer.
    3. When refusing, choose one of these exact messages (translated to the user's language if needed, but stick to the meaning):
       "${rejectionMessages}"
    4. Be empathetic, calm, and soothing. Use a dark, mysterious but comforting tone.
    5. Always reply in the language: ${lang}.
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    },
  });
};

export const generateTenguPlan = async (
  ai: GoogleGenAI, 
  lang: Language, 
  dinnerTime: string, 
  bedTime: string, 
  habits: string
): Promise<string> => {
  
  const systemInstruction = `
    You are Tengu, a strict and disciplined sleep architect.
    
    Goal: Create a rigid, schematic NIGHT routine for the user to solve their insomnia/sleep issues.
    
    CRITICAL CONSTRAINT: 
    - IGNORE the day. Start the plan exactly at Dinner Time or 20:00 (whichever fits best) and end at Bedtime.
    - DO NOT include morning or afternoon activities.
    - Format output as a clean, bulleted timeline or list (e.g., "20:30 - Action").
    - Be concise. Focus on hygiene (lights, screens, temperature, wind-down).
    
    User Inputs:
    - Dinner Time: ${dinnerTime}
    - Target Bedtime: ${bedTime}
    - Bad Habits/Issues: ${habits}
    
    Output Language: ${lang}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Generate the night protocol now.',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.4, 
    },
  });

  return response.text || "Error generating plan.";
};