import type { Level, Chapter } from '../types';
import wlaslData from '../WLASL100_train.json';

const allSignData = wlaslData;

const allGlosses = allSignData.map(item => item.gloss);

const allChapters = createChaptersFromGlosses(allGlosses);

export const levels: Level[] = [
  {
    level: 1,
    title: "Level 1",
    unlocked: true,
    chapters: allChapters.slice(0, 5) 
  },
  {
    level: 2,
    title: "Level 2",
    unlocked: true,
    chapters: allChapters.slice(5, 10) 
  }
];

function createChaptersFromGlosses(glosses: string[]): Chapter[] {
  const MAX_LESSONS_PER_CHAPTER = 10;
  const numChapters = Math.ceil(glosses.length / MAX_LESSONS_PER_CHAPTER);
  
  const chapters: Chapter[] = [];
  
  for (let i = 0; i < numChapters; i++) {
    const startIdx = i * MAX_LESSONS_PER_CHAPTER;
    const endIdx = Math.min((i + 1) * MAX_LESSONS_PER_CHAPTER, glosses.length);
    
    if (startIdx >= glosses.length) break;
    
    const levelNum = i < 5 ? 1 : 2;
    const chapterInLevel = i < 5 ? i + 1 : i - 4;
    
    const chapterGlosses = glosses.slice(startIdx, endIdx);
    const chapterLessons = chapterGlosses.map((gloss, index) => {
      const signData = allSignData.find(item => item.gloss === gloss);
      
      if (!signData) {
        console.warn(`Sign data not found for gloss: ${gloss}`);
      }
      
      const videoSrc = signData && signData.instances.length > 0 
        ? signData.instances[0].url 
        : "";
      
      return {
        title: gloss.charAt(0).toUpperCase() + gloss.slice(1), 
        completed: false,
        locked: index !== 0, 
        id: `level-${levelNum}-chapter-${chapterInLevel}-lesson-${index+1}-${gloss}`,
        videoSrc: videoSrc,
        duration: 30,
        signData: signData, 
      };
    });
    
    chapters.push({
      id: `chapter-${i+1}`,
      title: `Chapter ${chapterInLevel}`,
      description: `${chapterLessons.length} sign language lessons`,
      lessons: chapterLessons.length,
      completed: 0,
      lessonGroups: [],
      lessonList: chapterLessons,
    });
  }
  
  return chapters;
}


export const completeLesson = (levelIndex: number, chapterIndex: number, lessonIndex: number): boolean => {
  if (levelIndex < 0 || levelIndex >= levels.length) return false;
  if (!levels[levelIndex].unlocked) return false;

  const level = levels[levelIndex];
  if (chapterIndex < 0 || chapterIndex >= level.chapters.length) return false;

  const chapter = level.chapters[chapterIndex];
  if (lessonIndex < 0 || lessonIndex >= chapter.lessonList.length) return false;

  const lesson = chapter.lessonList[lessonIndex];
  if (lesson.locked) return false;
  
  if (lesson.completed) return true;
  
  lesson.completed = true;
  chapter.completed += 1;

  if (lessonIndex + 1 < chapter.lessonList.length) {
    chapter.lessonList[lessonIndex + 1].locked = false;
  } 
  else if (chapterIndex + 1 < level.chapters.length) {
    const nextChapter = level.chapters[chapterIndex + 1];
    if (nextChapter.lessonList.length > 0) {
      nextChapter.lessonList[0].locked = false;
    }
  }
  else if (levelIndex + 1 < levels.length) {
    const nextLevel = levels[levelIndex + 1];
    nextLevel.unlocked = true;
    if (nextLevel.chapters.length > 0 && nextLevel.chapters[0].lessonList.length > 0) {
      nextLevel.chapters[0].lessonList[0].locked = false;
    }
  }

  return true;
};

export const getLessonById = (lessonId: string) => {
  for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
    const level = levels[levelIndex];
    for (let chapterIndex = 0; chapterIndex < level.chapters.length; chapterIndex++) {
      const chapter = level.chapters[chapterIndex];
      for (let lessonIndex = 0; lessonIndex < chapter.lessonList.length; lessonIndex++) {
        const lesson = chapter.lessonList[lessonIndex];
        if (lesson.id === lessonId) {
          return { lesson, levelIndex, chapterIndex, lessonIndex };
        }
      }
    }
  }
  return null;
};

export const getUnlockedLessons = (levelIndex: number, chapterIndex: number) => {
  if (levelIndex < 0 || levelIndex >= levels.length) return [];
  
  const level = levels[levelIndex];
  if (!level.unlocked || chapterIndex < 0 || chapterIndex >= level.chapters.length) return [];
  
  const chapter = level.chapters[chapterIndex];
  return chapter.lessonList
    .filter(lesson => !lesson.locked)
    .map(lesson => ({
      id: lesson.id || "",
      title: lesson.title,
      videoUrl: lesson.videoSrc || "",
      duration: lesson.duration || 30,
      signData: lesson.signData, 
    }));
};