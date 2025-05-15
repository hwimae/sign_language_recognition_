import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChapterList from './ChapterList';
import LessonLayout from './LessonLayout';
import type { Chapter, Lesson } from '../types';

interface Props {
  initialChapterIndex?: number;
  chapters: Chapter[];
  lessons: Lesson[];
}

const SignLanguageLearning: React.FC<Props> = ({ 
  initialChapterIndex = 0,
  chapters,
  lessons
}) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(initialChapterIndex);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  
  const [mutableChapters, setMutableChapters] = useState<Chapter[]>(
    JSON.parse(JSON.stringify(chapters))
  );
  
  const selectedLesson = selectedLessonId 
    ? lessons.find(lesson => lesson.id === selectedLessonId) 
    : null;
  
  const chapterLessons = selectedLessonId && selectedLesson
    ? [selectedLesson] 
    : mutableChapters[selectedChapterIndex || 0]?.lessonList.map(item => {
        return lessons.find(lesson => lesson.id === item.id);
      }).filter((lesson): lesson is Lesson => lesson !== undefined);

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  const handleLessonComplete = () => {
    if (selectedLessonId) {
      let currentChapterIndex = -1;
      let currentLessonIndex = -1;
      
      for (let i = 0; i < mutableChapters.length; i++) {
        const chapter = mutableChapters[i];
        const lessonIndex = chapter.lessonList.findIndex(lesson => lesson.id === selectedLessonId);
        
        if (lessonIndex !== -1) {
          currentChapterIndex = i;
          currentLessonIndex = lessonIndex;
          break;
        }
      }
      
      if (currentChapterIndex !== -1 && currentLessonIndex !== -1) {
        const currentChapter = mutableChapters[currentChapterIndex];
        
        if (currentLessonIndex + 1 < currentChapter.lessonList.length) {
          const nextLesson = currentChapter.lessonList[currentLessonIndex + 1];
          
          if (!nextLesson.locked) {
            setSelectedLessonId(nextLesson.id || null);
            return;
          }
        } 
        else if (currentChapterIndex + 1 < mutableChapters.length) {
          const nextChapter = mutableChapters[currentChapterIndex + 1];
          if (nextChapter.lessonList.length > 0) {
            const firstLesson = nextChapter.lessonList[0];
            if (!firstLesson.locked) {
              setSelectedChapterIndex(currentChapterIndex + 1);
              setSelectedLessonId(firstLesson.id || null);
              return;
            }
          }
        }
      }
    }
    setSelectedLessonId(null);
  };

  const handleLessonCompleted = (lessonId: string) => {
    if (!completedLessons.has(lessonId)) {
      const newCompletedLessons = new Set(completedLessons);
      newCompletedLessons.add(lessonId);
      setCompletedLessons(newCompletedLessons);
      
      const newChapters = JSON.parse(JSON.stringify(mutableChapters));
      let lessonCompleted = false;
      
      for (let chapterIndex = 0; chapterIndex < newChapters.length; chapterIndex++) {
        const chapter = newChapters[chapterIndex];
        
        for (let lessonIndex = 0; lessonIndex < chapter.lessonList.length; lessonIndex++) {
          const lesson = chapter.lessonList[lessonIndex];
          
          if (lesson.id === lessonId) {
            if (!lesson.completed) {
              lesson.completed = true;
              chapter.completed += 1;
              lessonCompleted = true;
            }
            if (lessonIndex + 1 < chapter.lessonList.length) {
              const nextLesson = chapter.lessonList[lessonIndex + 1];
              if (nextLesson.locked) {
                nextLesson.locked = false;
              }
            } 
            else if (chapterIndex + 1 < newChapters.length) {
              const nextChapter = newChapters[chapterIndex + 1];
              if (nextChapter.lessonList.length > 0) {
                const firstLesson = nextChapter.lessonList[0];
                if (firstLesson.locked) {
                  firstLesson.locked = false;
                }
              }
            }
            break;
          }
        }
        
        if (lessonCompleted) break;
      }
      
      if (lessonCompleted) {
        setMutableChapters(newChapters);
      }
    }
  };

  const handleChapterSelect = (index: number | null) => {
    setSelectedChapterIndex(index);
  };

  return (
    <>
      <Sidebar 
        currentLevel={currentLevel} 
        onSelect={setCurrentLevel} 
        unlockedLevels={[1, 2]} 
      />
      
      {selectedLessonId ? (
        <LessonLayout
          lessons={chapterLessons}
          onComplete={handleLessonComplete}
          onLessonCompleted={handleLessonCompleted}
        />
      ) : (
        <ChapterList
          chapters={mutableChapters}
          onSelect={handleChapterSelect}
          onLessonSelect={handleLessonSelect}
        />
      )}
    </>
  );
};

export default SignLanguageLearning;