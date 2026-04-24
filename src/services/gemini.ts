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
    const response = await fetch("/api/bible", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "말씀을 가져오는 중 오류가 발생했습니다.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Bible verse:", error);
    if (error instanceof Error) throw error;
    return null;
  }
}
