import React, { useState } from 'react';
import type { Chapter } from '../types';
import { CheckCircle, Lock, ChevronLeft, ChevronRight } from 'react-feather';

interface Props {
  chapters: Chapter[];
  onSelect: (chapterIndex: number | null) => void;
  onLessonSelect: (lessonId: string) => void;
}

const ChapterList: React.FC<Props> = ({ chapters, onSelect, onLessonSelect }) => {
  const [openChapterIndex, setOpenChapterIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const LESSONS_PER_PAGE = 5;
  const MAX_LESSONS_PER_CHAPTER = 10;

  const toggleChapter = (index: number) => {
    if (openChapterIndex === index) {
      setOpenChapterIndex(null);
      onSelect(null); 
    } else {
      setOpenChapterIndex(index);
      setCurrentPage(1);
      onSelect(index); 
    }
  };

  const handleNextPage = () => {
    if (openChapterIndex === null) return;
    
    const chapter = chapters[openChapterIndex];
    const totalPages = Math.ceil(Math.min(chapter.lessonList.length, MAX_LESSONS_PER_CHAPTER) / LESSONS_PER_PAGE);
    
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getCurrentPageLessons = (chapter: Chapter) => {
    const visibleLessons = chapter.lessonList.slice(0, MAX_LESSONS_PER_CHAPTER);
    const startIdx = (currentPage - 1) * LESSONS_PER_PAGE;
    const endIdx = startIdx + LESSONS_PER_PAGE;
    return visibleLessons.slice(startIdx, endIdx);
  };

  const getChapterProgress = (chapter: Chapter) => {
    const completedLessons = chapter.lessonList.filter(lesson => lesson.completed).length;
    return (completedLessons / chapter.lessonList.length) * 100;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-teal-800">Chọn chương để học</h1>
      {chapters.map((chapter, chIndex) => (
        <div key={chIndex} className="mb-4">
          <button
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-teal-500"
            onClick={() => toggleChapter(chIndex)}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{chapter.title}</span>
                <span className="text-sm text-gray-500">
                  {chapter.completed}/{chapter.lessons} bài học hoàn thành
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full" 
                  style={{ width: `${getChapterProgress(chapter)}%` }}
                />
              </div>
            </div>
            <div className="text-teal-600 ml-4">
              {openChapterIndex === chIndex ? "▲" : "▼"}
            </div>
          </button>

          {openChapterIndex === chIndex && (
            <div className="bg-white mt-1 p-4 rounded-lg shadow-sm border border-gray-200">
              {getCurrentPageLessons(chapter).map((lesson, lIndex) => {
                const absoluteLessonIndex = (currentPage - 1) * LESSONS_PER_PAGE + lIndex;
                
                return (
                  <div
                    key={lIndex}
                    className={`p-3 mb-2 flex items-center justify-between rounded-md ${
                      lesson.locked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : lesson.completed
                        ? "bg-green-50 cursor-pointer hover:bg-green-100"
                        : "bg-white border border-gray-200 cursor-pointer hover:bg-teal-50"
                    }`}
                    onClick={() => !lesson.locked && onLessonSelect(lesson.id || "")}
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-xs mr-3">
                        {absoluteLessonIndex + 1}
                      </span>
                      <span>{lesson.title}</span>
                    </div>
                    {lesson.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : lesson.locked ? (
                      <Lock className="h-5 w-5" />
                    ) : null}
                  </div>
                );
              })}
              
              {chapter.lessonList.length > MAX_LESSONS_PER_CHAPTER && (
                <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Trang {currentPage} / {Math.ceil(Math.min(chapter.lessonList.length, MAX_LESSONS_PER_CHAPTER) / LESSONS_PER_PAGE)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-1 rounded ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-teal-600 hover:bg-teal-50'
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage >= Math.ceil(Math.min(chapter.lessonList.length, MAX_LESSONS_PER_CHAPTER) / LESSONS_PER_PAGE)}
                      className={`p-1 rounded ${
                        currentPage >= Math.ceil(Math.min(chapter.lessonList.length, MAX_LESSONS_PER_CHAPTER) / LESSONS_PER_PAGE)
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-teal-600 hover:bg-teal-50'
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChapterList;