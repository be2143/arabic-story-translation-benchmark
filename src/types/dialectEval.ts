export interface DescriptiveOrientationScores {
  descriptive_count: number;
  coaching_count: number;
  numeric_ratio: number | null;
  result: "pass" | "fail";
  notes: string;
}

export interface DimensionQuestionScores {
  Q1: number | null;
  Q2: number | null;
  Q3: number | null;
  Q4: number | null;
  Q5: number | null;
  rationale: string;
  confidence: 1 | 2 | 3 | null;
  confidence_note: string;
}

export interface DialectFluencyScores {
  Q1: number | null;
  Q2: number | null;
  consistency_note: string;
  regional_note: string;
  confidence: 1 | 2 | 3 | null;
  confidence_note: string;
}

export interface DialectEvalStoryScores {
  case_id: string;
  descriptive_orientation: DescriptiveOrientationScores;
  structural_clarity: DimensionQuestionScores;
  situational_safety: DimensionQuestionScores;
  dialect_fluency: DialectFluencyScores;
}

export function emptyDimensionScores(): DimensionQuestionScores {
  return {
    Q1: null,
    Q2: null,
    Q3: null,
    Q4: null,
    Q5: null,
    rationale: "",
    confidence: null,
    confidence_note: "",
  };
}

export function emptyDialectFluencyScores(): DialectFluencyScores {
  return {
    Q1: null,
    Q2: null,
    consistency_note: "",
    regional_note: "",
    confidence: null,
    confidence_note: "",
  };
}

export function emptyDescriptiveOrientation(): DescriptiveOrientationScores {
  return {
    descriptive_count: 0,
    coaching_count: 0,
    numeric_ratio: null,
    result: "fail",
    notes: "",
  };
}

export function emptyStoryScores(caseId: string): DialectEvalStoryScores {
  return {
    case_id: caseId,
    descriptive_orientation: emptyDescriptiveOrientation(),
    structural_clarity: emptyDimensionScores(),
    situational_safety: emptyDimensionScores(),
    dialect_fluency: emptyDialectFluencyScores(),
  };
}

export function computeDoResult(
  descriptive_count: number,
  coaching_count: number
): { numeric_ratio: number | null; result: "pass" | "fail" } {
  if (coaching_count > 0) {
    const numeric_ratio = descriptive_count / coaching_count;
    return {
      numeric_ratio,
      result: numeric_ratio >= 2 ? "pass" : "fail",
    };
  }
  if (descriptive_count >= 1) {
    return { numeric_ratio: null, result: "pass" };
  }
  return { numeric_ratio: null, result: "fail" };
}
