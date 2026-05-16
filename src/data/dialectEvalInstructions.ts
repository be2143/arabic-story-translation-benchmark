/** User-facing evaluation instructions derived from eval_prompt_do.txt and eval_prompt_sc_ss_df.txt */

export interface InstructionSubsection {
  label: string;
  text: string;
}

export interface InstructionSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: InstructionSubsection[];
}

export interface DimensionInstructions {
  title: string;
  summary: string;
  anchors?: string;
  sections: InstructionSection[];
  questions: string[];
  rationale?: string;
}

export const SCORE_ANCHORS =
  "5 = fully meets criterion · 4 = minor issues (1–2 small problems) · 3 = moderate · 2 = major · 1 = does not meet";

export const DF_SCORE_ANCHORS =
  "5 = dialect consistent · 4 = minor issues · 3 = mixed / some non-regional phrases · 2 = major · 1 = wrong dialect";

export const DO_INSTRUCTIONS = {
  title: "Descriptive orientation (DO)",
  summary:
    "Count each sentence in the Arabic story (not the title). Classify each as Descriptive (D) or Coaching (C), then enter the totals.",
  sections: [
    {
      heading: "Sentence boundaries",
      bullets: [
        "Primary rule: text ending in ., !, ?, or …",
        "Fallback: if text has no closing punctuation, treat each line break as a sentence boundary.",
      ],
    },
    {
      heading: "Counting rules",
      bullets: [
        "Do not count the story title.",
        "Do not count list items or fragments — a sentence must express a complete idea.",
        "Count repeated sentences each time they appear.",
        "Partial sentences (e.g. ending with …) are Descriptive (D), not Coaching (C).",
      ],
    },
    {
      heading: "Coaching (C)",
      paragraphs: [
        "Classify as C if the sentence describes or suggests a response. Three sub-types — any one qualifies:",
      ],
      subsections: [
        {
          label: "Child",
          text: "Describes or suggests a response for the child (e.g. “I will try to put my hand up when I want to speak to my teacher in class.”)",
        },
        {
          label: "Caregiver / teacher",
          text: "Describes or suggests a response for the caregiver or teacher (e.g. “Mrs X can help me to use the soap when I am washing my hands.”)",
        },
        {
          label: "Attributed to child",
          text: "Developed by or attributed to the child (e.g. “I can draw in my special drawing book when I am feeling sad.”)",
        },
      ],
    },
    {
      heading: "Descriptive (D)",
      paragraphs: [
        "Carol Gray’s describing types plus partial sentences. All four count toward the descriptive total.",
      ],
      subsections: [
        {
          label: "Descriptive",
          text: "Facts about the situation, clear and objective (e.g. “Adults and children wash to keep clean and smell fresh.”)",
        },
        {
          label: "Perspective",
          text: "Thoughts, feelings, or beliefs of people (e.g. “When I try my best my mum feels very proud of me.”)",
        },
        {
          label: "Affirmative",
          text: "Positive phrases that reinforce a key point (e.g. “This is okay.” / “This is very important.”)",
        },
        {
          label: "Partial",
          text: "Deliberate missing words to invite input — not coaching (e.g. “When I feel sad I can…” / “Dad will be…”)",
        },
      ],
    },
    {
      heading: "When unsure",
      bullets: [
        "Mixed D and C: classify as C if it directs the child toward an action or strategy; otherwise D.",
        "If genuinely uncertain, classify as D.",
      ],
    },
    {
      heading: "Pass / fail",
      bullets: [
        "If coaching_count > 0: pass when descriptive_count ÷ coaching_count ≥ 2.",
        "If coaching_count = 0 and descriptive_count ≥ 1: pass.",
        "Otherwise: fail.",
      ],
    },
  ],
};

export const SC_INSTRUCTIONS: DimensionInstructions = {
  title: "Structural clarity (SC)",
  summary:
    "Rate each question 1–5. Segment the story into introduction, main body, and conclusion before scoring.",
  anchors: SCORE_ANCHORS,
  sections: [
    {
      heading: "Step 1 — Segment the story",
      bullets: [
        "Introduction: introduces the topic in a positive way.",
        "Main body: explains the situation in detail.",
        "Conclusion: summarises the message and ends positively.",
        "If sections are unclear, infer the best split. If a section is missing, score accordingly.",
      ],
    },
  ],
  questions: [
    "Q1: Does the story have a clear structure — introduction, main body, and conclusion?",
    "Q2: Does the introduction clearly establish the context and purpose?",
    "Q3: Does the main body logically develop the situation?",
    "Q4: Does the conclusion reinforce the main message?",
    "Q5: Are all sections (introduction, body, conclusion) well connected?",
  ],
  rationale:
    "Rationale: 2–4 sentences. Mention the strongest issue(s) and include 1–2 short quote fragments as evidence.",
};

export const SS_INSTRUCTIONS: DimensionInstructions = {
  title: "Situational safety (SS)",
  summary: "Rate each question 1–5 using the same anchors as SC.",
  anchors: SCORE_ANCHORS,
  sections: [],
  questions: [
    "Q1: Does the story consistently use first-person OR third-person (no “you”)?",
    "Q2: Does the story maintain a positive, patient tone? Avoid: bad / naughty, should / shouldn’t, can’t / won’t.",
    "Q3: Does the story normalise the situation and offer reassurance without judgment?",
    "Q4: Does the story describe realistic situations only — no fantasy, idioms, or figurative language?",
    "Q5: Does the story use clear, simple language for young children with ASD? Is tense used consistently?",
  ],
  rationale:
    "Rationale: 2–4 sentences. Mention any harmful or authoritarian wording and include 1–2 short quote fragments.",
};

export const DF_INSTRUCTIONS: DimensionInstructions = {
  title: "Dialect fluency (DF)",
  summary: "Rate for the story’s target dialect using the anchors below.",
  anchors: DF_SCORE_ANCHORS,
  sections: [
    {
      heading: "Notes",
      bullets: [
        "For MSA: evaluate standard-register consistency and appropriateness only.",
        "Include short quote fragments in consistency_note and regional_note as evidence.",
      ],
    },
  ],
  questions: [
    "Q1: Is the dialect used consistently (no mixed dialects)?",
    "Q2: Is vocabulary and phrasing regionally appropriate for the target dialect?",
  ],
};

export const CONFIDENCE_LABEL =
  "Confidence (optional): 3 = confident · 2 = moderately confident · 1 = uncertain. Add a note if 1 or 2.";
