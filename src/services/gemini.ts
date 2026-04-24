import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  koreanText: string;
  englishText: string;
  pronunciation: string;
}

export async function fetchBibleVerse(query: string): Promise<BibleVerse | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the Bible verse: "${query}". 
      Return the Korean translation, a standard English translation (NIV), and the Korean pronunciation (transliteration) of the English verse text to help someone read it.
      
      Example:
      Input: "마태복음 1:1"
      Output: 
      Book: 마태복음
      Chapter: 1
      Verse: 1
      Korean: 아브라함과 다윗의 자손 예수 그리스도의 계보라
      English: This is the genealogy of Jesus the Messiah the son of David, the son of Abraham:
      Pronunciation: 디스 이즈 더 지니알러지 오브 지저스 더 머사이어 더 선 오브 데이비드, 더 선 오브 에이브러햄`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            book: { type: Type.STRING },
            chapter: { type: Type.NUMBER },
            verse: { type: Type.NUMBER },
            koreanText: { type: Type.STRING },
            englishText: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
          },
          required: ["book", "chapter", "verse", "koreanText", "englishText", "pronunciation"]
        }
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text.trim()) as BibleVerse;
  } catch (error) {
    console.error("Error fetching Bible verse:", error);
    return null;
  }
}
