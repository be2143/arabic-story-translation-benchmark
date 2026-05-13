export interface SocialStoryRule {
  rule: string;
  meaning: string;
  correct: string;
  incorrect: string;
}

export const STORY_RULES: readonly SocialStoryRule[] = [
  {
    rule: "Do not use “you”",
    meaning:
      "Social Stories are written from a first or third-person perspective to help the reader imagine themselves in the situation. Therefore always use first or third person (“I”, “he/she”), never use “you”.",
    correct: "I will try to wait.",
    incorrect: "You must wait.",
  },
  {
    rule: "Positive tone",
    meaning:
      "Social Stories should be written in a positive and patient tone. Avoid harsh commands or blaming language. This means the story should avoid using words such as \"must\", \"should\", \"don't\", or \"forbidden\".",
    correct: "Sometimes I feel upset. That is okay.",
    incorrect: "Don't be bad.",
  },
  {
    rule: "Describe more than instruct",
    meaning:
      "Aim for at least two descriptive sentences for each coaching line. Descriptive sentences describe what is happening in the situation, while coaching sentences give instructions or advice.",
    correct:
      "The line moves slowly. Everyone waits. I will try to wait too. (Here: two descriptive sentences, then one coaching line.)",
    incorrect:
      "I will wait. I will be quiet. I will stand still. (Here: three short coaching-style lines with little description of the situation.)",
  },
  {
    rule: "Literal and accurate",
    meaning:
      "The story must use simple, clear words that an autistic child can easily understand. Do not use vague phrases, idioms (e.g., \"it's raining cats and dogs\"), or abstract emotion words the child may not know yet.",
    correct:
      '"The noise is too loud. I might feel hot in my face. I can cover my ears."',
    incorrect:
      '"I am overwhelmed by the noise." (A child may not understand the word "overwhelmed".)',
  },
] as const;

export const TRANSLATION_CHECKLIST: readonly string[] = [
  "No “you” anywhere in the translated text.",
  "Short sentences that are easy to read aloud. Avoid long sentences and complex grammar. One English sentence should be translated into one Arabic sentence.",
  "Keep the original story's reassuring and positive tone. Avoid negative or warning words.",
  "You may make cultural adjustments for your dialect region; however, the story should still be literal and accurate.",
];
