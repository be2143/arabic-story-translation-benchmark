export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
}

export const educationQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the purpose of a social story?",
    options: [
      "To help autistic children understand a specific social situation or daily activity",
      "To help autistic children memorize long vocabulary lists",
      "To test reading speed and spelling accuracy",
      "To record misbehavior for school reports",
    ],
    correctAnswer: 0,
    explanation:
      "A social story helps autistic children understand a specific social situation or daily activity in a clear, supportive way.",
  },
  {
    id: 2,
    question:
      "Which option best matches the rule about descriptive vs coaching sentences (at least two descriptive sentences for each coaching line)?",
    options: [
      "The line moves slowly. Everyone waits. I will try to wait too. (Two descriptive sentences, then one coaching line.)",
      "I will wait. I will be quiet. I will stand still. (Mostly short coaching-style lines with little description.)",
      "Only one sentence: “Wait in line.”",
      "A long joke about waiting that uses idioms",
    ],
    correctAnswer: 0,
    explanation:
      "A social story should be more descriptive than instructional: include at least two descriptive sentences for each coaching line.",
  },
  {
    id: 3,
    question: "Which sentence is a GOOD example of a social story?",
    options: [
      "It is boring, but I have to wait.",
      "I should wait for my turn.",
      "It may be boring to wait. It's alright. I can watch TV while I wait.",
      "You must wait quietly or you will be in trouble.",
    ],
    correctAnswer: 2,
    explanation:
      "Good social stories use short, patient, positive wording and avoid harsh “you” commands.",
  },
  {
    id: 4,
    question: "Which sentence is a BAD example of a social story?",
    options: [
      "I will tell my mom. She will help me.",
      "I can wait a bit. It's okay.",
      "It may be noisy, but you must not shout.",
      "Sometimes I feel worried. That is okay.",
    ],
    correctAnswer: 2,
    explanation:
      "The module says not to use “you” and to avoid commanding language; “you must not shout” breaks both ideas.",
  },
  {
    id: 5,
    question: "When translating the stories, what should you do?",
    options: [
      "Use second person (you) instead of first person (I)",
      "Keep the original story structure and tone",
      "Combine two short English sentences into one very long Arabic sentence",
      "Change the facts of the story to match my opinion",
    ],
    correctAnswer: 1,
    explanation:
      "The checklist asks you to keep the original reassuring tone and clear structure; one English sentence maps to one Arabic sentence when possible.",
  },
];
