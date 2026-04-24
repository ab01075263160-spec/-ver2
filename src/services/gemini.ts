import { GoogleGenAI, Type } from "@google/genai";

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  koreanText: string;
  englishText: string;
  pronunciation: string;
}

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. Settings > Secrets에서 키를 등록해주세요.");
    }
    genAI = new GoogleGenAI({ apiKey }) as any;
  }
  return genAI;
}

export async function fetchBibleVerse(query: string): Promise<BibleVerse | null> {
  try {
    const ai = getGenAI() as any;
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `Search for the Bible verse: "${query}". 
          Return the Korean translation, a standard English translation (NIV), and the Korean pronunciation (transliteration) of the English verse text to help someone read it.
          
          Example:
          Input: "마태복음 1:1"
          Output: 
          Book: 마태복음
          Chapter: 1
          Verse: 1
          Korean: 아브라함과 다윗의 자손 예수 그리스도의 계보라
          English: This is the genealogy of Jesus the Messiah the son of David, the son of Abraham:
          Pronunciation: 디스 이즈 더 지니알러지 오브 지저스 더 머사이어 더 선 오브 데이비드, 더 선 오브 에이브러햄`
        }]
      }],
      generationConfig: {
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

    const text = response.response.text();
    if (!text) return null;
    return JSON.parse(text.trim()) as BibleVerse;
  } catch (error) {
    console.error("Error fetching Bible verse:", error);
    if (error instanceof Error) {
      throw error; // Rethrow to show specific error message in UI
    }
    return null;
  }
}
