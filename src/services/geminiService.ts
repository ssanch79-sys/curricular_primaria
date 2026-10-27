import { GoogleGenAI, Type } from "@google/genai";
import { AiResponse, Session, CurriculumItem, Grade } from "../types";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function getCurriculumSuggestions(
  subjects: { id: string; name: string }[],
  grade: string,
  description: string,
  modelName: string = "gemini-3-flash-preview"
): Promise<AiResponse> {
  const subjectNames = subjects.map(s => s.name).join(", ");
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Com a expert en el currículum educatiu de Catalunya (Decret 175/2022), suggereix competències específiques, criteris d'avaluació i sabers bàsics per a una Situació d'Aprenentatge per al curs ${grade} de les àrees: ${subjectNames}. Descripció: ${description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          competencies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING },
                text: { type: Type.STRING },
                subjectId: { type: Type.STRING }
              },
              required: ["code", "text"]
            }
          },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING },
                text: { type: Type.STRING },
                subjectId: { type: Type.STRING }
              },
              required: ["code", "text"]
            }
          },
          sabers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING },
                text: { type: Type.STRING },
                subjectId: { type: Type.STRING }
              },
              required: ["code", "text"]
            }
          }
        },
        required: ["competencies", "criteria", "sabers"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as AiResponse;
}

export async function generateDetailedActivities(
  title: string,
  description: string,
  grade: string,
  subjectNames: string[],
  numSessions: number,
  modelName: string = "gemini-3-flash-preview"
): Promise<Session[]> {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Genera una seqüència didàctica detallada de ${numSessions} sessions per a la Situació d'Aprenentatge "${title}" (${grade}). Àrees: ${subjectNames.join(", ")}. Descripció: ${description}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            objective: { type: Type.STRING },
            methodology: { type: Type.STRING },
            steps: { type: Type.STRING },
            evaluation: { type: Type.STRING },
            dua: { type: Type.STRING }
          },
          required: ["title", "objective", "methodology", "steps", "evaluation", "dua"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]") as Session[];
}

export async function suggestEvaluationTools(
  title: string,
  grade: string,
  criteria: CurriculumItem[],
  modelName: string = "gemini-3-flash-preview"
): Promise<string[]> {
  const criteriaText = criteria.map(c => `${c.code}: ${c.text}`).join("\n");
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Suggereix 5 eines d'avaluació adequades per a la Situació d'Aprenentatge "${title}" per a ${grade}. Criteris a avaluar:\n${criteriaText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text || "[]") as string[];
}

export async function generateEvaluationToolContent(
  toolName: string,
  title: string,
  grade: string,
  criteria: CurriculumItem[],
  modelName: string = "gemini-3-flash-preview"
): Promise<string> {
  const criteriaText = criteria.map(c => `${c.code}: ${c.text}`).join("\n");
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Genera el contingut detallat (en format HTML net, sense estils inline, només tags estructurals com table, tr, td, th, h3, p, ul, li) per a l'eina d'avaluació "${toolName}" de la Situació d'Aprenentatge "${title}" (${grade}). Criteris a avaluar:\n${criteriaText}`,
  });

  return response.text || "";
}

export async function getTitleOptions(
  subjectNames: string[],
  grade: string,
  currentTitle: string,
  modelName: string = "gemini-3-flash-preview"
): Promise<{title: string, style: string}[]> {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Genera 5 títols creatius i motivadors per a Situacions d'Aprenentatge de primària (${grade}) per a les àrees: ${subjectNames.join(", ")}. Títol actual (opcional): ${currentTitle}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            style: { type: Type.STRING }
          },
          required: ["title", "style"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]") as {title: string, style: string}[];
}

export async function getDescriptionForTitle(
  title: string,
  subjectNames: string[],
  grade: string,
  modelName: string = "gemini-3-flash-preview"
): Promise<string> {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Escriu una descripció breu i engrescadora (màxim 300 caràcters) per a una Situació d'Aprenentatge titulada "${title}" per a ${grade} de les àrees: ${subjectNames.join(", ")}.`,
  });

  return response.text || "";
}

