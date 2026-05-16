export interface EvaluationQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

/** Fisher–Yates shuffle; returns new option order and updated correct-answer index. */
export function shuffleEvaluationQuizQuestions(
  questions: readonly EvaluationQuizQuestion[]
): EvaluationQuizQuestion[] {
  return questions.map((q) => {
    const order = q.options.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return {
      ...q,
      options: order.map((i) => q.options[i]),
      correctAnswer: order.indexOf(q.correctAnswer),
    };
  });
}

/** Assessment for the evaluation study — different questions from the translation-task quiz. */
export const evaluationQuizQuestions: EvaluationQuizQuestion[] = [
  {
    id: 1,
    question:
      "When you compare two Arabic translations of the same English social story, what should you prioritize first?",
    options: [
      "Which version keeps a calm, reassuring tone and matches the social story guidelines",
      "Which version uses the most rare vocabulary and idioms",
      "Which version is shorter, even if it drops important ideas",
      "Which version changes the story facts to sound more exciting",
    ],
    correctAnswer: 0,
    explanation:
      "Social stories should keep calm and reassuring tone; the translation should preserve the original story tone and structure",
  },
  {
    id: 2,
    question:
      "Two versions of translation for  the same sentence: one uses first-person (“I can try to wait”), the other uses second-person commands (“You must wait”). Which version follows the good social-story practice?",
    options: [
      "The first-person version",
      "The second-person version",
      "They are equally good if both are grammatically correct",
      "The one with more exclamation marks",
    ],
    correctAnswer: 0,
    explanation:
      "Social stories should never use “you” and include commands, instead it should use first-person wording. Ensure that the translation preserves the third person perspective and does not use judgemental and commanding language.",
  },
  {
    id: 3,
    question:
      "If Translation A preserves every main idea from the English story in order, and Translation B skips a paragraph but sounds fluent, which is generally better for this task?",
    options: [
      "Translation A — completeness and faithful structure matter",
      "Translation B — fluency alone is enough",
      "Always pick the longer translation",
      "Always pick the translation with more questions",
    ],
    correctAnswer: 0,
    explanation:
      "For evaluation, prefer translations that keep the original meaning and flow of ideas, not clever rewrites that drop content. Ensure that one English sentence is translated into one Arabic sentence.",
  },
  {
    id: 4,
    question:
      "Which pairing best describes what you will do after the quiz in this evaluation session?",
    options: [
      "Read one English social story and choose which of two Arabic translations you think is better",
      "Write a new English social story from scratch",
      "Translate the story into Arabic yourself in a text box",
      "Randomly choose one of the two translations",
    ],
    correctAnswer: 0,
    explanation:
      "This session asks you to judge between two existing Arabic versions of the same English story.",
  },
  {
    id: 5,
    question:
      "If two translations are similar in quality, what is a reasonable tie-breaker?",
    options: [
      "Prefer the one that is clearer and easier for a child reader to follow",
      "Prefer the one with more formal / classical-only words",
      "Prefer the one that adds new advice not in the English",
      "Flip a coin — there is no basis to choose",
    ],
    correctAnswer: 0,
    explanation:
      "Clarity and child-friendly pacing align with social-story goals when both options are otherwise close.",
  },
];
