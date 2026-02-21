/**
 * Open Trivia Database API — free, no auth required.
 * Fetches easy general knowledge questions for the Gentle Quiz activity.
 */

const BASE_URL = 'https://opentdb.com/api.php';

interface GentleQuizContent {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  allAnswers: string[];
}

function decodeHtml(html: string): string {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&eacute;/g, 'e')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function fetchGentleQuizContent(): Promise<GentleQuizContent[] | null> {
  try {
    // Easy difficulty, general knowledge or science & nature
    const categories = [9, 17, 22, 23]; // General, Science, Geography, History
    const category = categories[Math.floor(Math.random() * categories.length)];

    const res = await fetch(
      `${BASE_URL}?amount=5&difficulty=easy&type=multiple&category=${category}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;

    const data = await res.json();
    if (data.response_code !== 0 || !data.results?.length) return null;

    return data.results.map((q: { correct_answer: string; incorrect_answers: string[]; question: string }) => {
      const correctAnswer = decodeHtml(q.correct_answer);
      const incorrectAnswers = q.incorrect_answers.map(decodeHtml);
      const allAnswers = shuffleArray([correctAnswer, ...incorrectAnswers]);
      return {
        question: decodeHtml(q.question),
        correctAnswer,
        incorrectAnswers,
        allAnswers,
      };
    });
  } catch {
    return null;
  }
}
