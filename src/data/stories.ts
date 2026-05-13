import raw from "./gold_standard_stories.json";

interface GoldStoryRow {
  story_id: number;
  story_title: string;
  story_category: string;
  situation_target_behavior: string;
  story_content: string;
}

export interface Story {
  id: number;
  /** Original id from `gold_standard_stories.json`. */
  source_story_id: number;
  title: string;
  content: string;
  category: string;
  situation_target_behavior: string;
}

export const stories: Story[] = (raw as GoldStoryRow[]).map((row, index) => ({
  // Use a stable sequential id (1..N) for UI + submissions.
  id: index + 1,
  source_story_id: row.story_id,
  title: row.story_title,
  content: row.story_content,
  category: row.story_category,
  situation_target_behavior: row.situation_target_behavior,
}));
