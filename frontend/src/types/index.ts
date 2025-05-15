export interface SignInstance {
  bbox: number[];
  fps: number;
  frame_end: number;
  frame_start: number;
  instance_id: number;
  signer_id: number;
  source: string;
  split: string;
  url: string;
  variation_id: number;
  video_id: string;
}

export interface SignData {
  gloss: string;
  instances: SignInstance[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  content?: string;
  variations?: {
    source: string;
    url: string;
    signerId: number;
  }[];
   completed: boolean;
  locked: boolean;
  duration?: number;
  signData?: SignData; 
}

export interface LessonItem {
  id: string;
  title: string;
  completed: boolean;
  locked: boolean;
  videoSrc: string;
  duration: number;
}

export interface LessonGroup {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  lessons: number;
  completed: number;
  lessonGroups: LessonGroup[];
  lessonList: {
    title: string;
    completed: boolean;
    locked: boolean;
    id: string;
    videoSrc: string;
    duration: number;
    signData?: SignData; 
  }[];
}

export interface Level {
  level: number;
  title: string;       
  description?: string; 
  unlocked: boolean;
  chapters: Chapter[];
}

export interface Props {
  chapters: Chapter[];
  onSelect: (chapterIndex: number) => void;
}