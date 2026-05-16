import raw from "./dialect_stories.generated.json";

export const DIALECT_EVAL_STORY_COUNT = 6;

interface BaseStory {
  base_story_id: string;
  source_id: string;
  title: string;
  category: string;
  situation: string;
  story_content: string;
}

interface DialectCase {
  case_id: string;
  base_story_id: string;
  target_dialect: string;
  story_text: string;
}

interface DialectStoriesFile {
  base_stories: BaseStory[];
  dialects: string[];
  conditions: string[];
  cases: DialectCase[];
}

const data = raw as DialectStoriesFile;

const baseById = new Map(data.base_stories.map((b) => [b.base_story_id, b]));

export interface DialectEvalCase {
  case_id: string;
  base_story_id: string;
  target_dialect: string;
  story_text: string;
  english_title: string;
  english_content: string;
  english_category: string;
  english_situation: string;
  index: number;
}

export const dialectEvalCases: DialectEvalCase[] = data.cases
  .slice(0, 6)
  .map((c, index) => {
    const base = baseById.get(c.base_story_id);
    return {
      case_id: c.case_id,
      base_story_id: c.base_story_id,
      target_dialect: c.target_dialect,
      story_text: c.story_text,
      english_title: base?.title ?? c.base_story_id,
      english_content: base?.story_content ?? "",
      english_category: base?.category ?? "",
      english_situation: base?.situation ?? "",
      index,
    };
  });
