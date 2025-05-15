import React, { useState, useEffect } from 'react';
import type { SignLanguageItem } from '../utils/signLanguageData';
import type { Lesson, Chapter } from '../types';
import SignLanguageLearning from './SignLanguageLearning';

interface SignLanguageAppProps {
  jsonFilePath?: string; 
}

const SignLanguageApp: React.FC<SignLanguageAppProps> = ({ jsonFilePath = '/data/sign-language-data.json' }) => {
  const [jsonData, setJsonData] = useState<SignLanguageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJsonData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(jsonFilePath);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json() as SignLanguageItem[];
        setJsonData(data);
      } catch (err) {
        console.error('Error loading sign language data:', err);
        setError('Failed to load sign language data. Please check the console for details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadJsonData();
  }, [jsonFilePath]);

  const convertToLessons = (data: SignLanguageItem[]): Lesson[] => {
    return data.map((item, index) => {
      return {
        id: `lesson-${index}-${item.gloss}`,
        title: item.gloss, 
        description: `Learn how to sign "${item.gloss}" in sign language`,
        signData: item,
        content: `This lesson teaches you how to sign "${item.gloss}" in sign language.`,
        variations: item.instances.map(instance => ({
          source: instance.source || "Unknown source",
          url: instance.url,
          signerId: instance.signer_id
        })),
        completed: false,
        locked: index !== 0 
      };
    });
  };

  const createChapters = (lessons: Lesson[]): Chapter[] => {
    const lessonsPerChapter = Math.ceil(lessons.length / 5);
    
    const chapters: Chapter[] = [];
    
    for (let i = 0; i < 5; i++) {
      const startIndex = i * lessonsPerChapter;
      const endIndex = Math.min((i + 1) * lessonsPerChapter, lessons.length);
      
      if (startIndex >= lessons.length) break;
      
      const chapterLessons = lessons.slice(startIndex, endIndex);
      
      const formattedLessons = chapterLessons.map((lesson, idx) => ({
        id: lesson.id,
        title: lesson.title.charAt(0).toUpperCase() + lesson.title.slice(1),
        completed: false,
        locked: idx !== 0, 
        videoSrc: lesson.variations && lesson.variations.length > 0 ? lesson.variations[0].url : "",
        duration: 30,
        signData: lesson.signData 
      }));
      
      chapters.push({
        id: `chapter-${i + 1}`,
        title: `Chapter ${i + 1}`,
        description: `${formattedLessons.length} sign language lessons`,
        lessons: formattedLessons.length,
        completed: 0,
        lessonList: formattedLessons,
        lessonGroups: []
      });
    }
    
    return chapters;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading lesson data...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const lessons = convertToLessons(jsonData);
  const chapters = createChapters(lessons);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-teal-700 text-white p-4">
        <h1 className="text-xl font-bold">Sign Language Learning App</h1>
        <p className="text-sm">Learn {jsonData.length} signs from WLASL dataset</p>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        <SignLanguageLearning 
          initialChapterIndex={0} 
          chapters={chapters} 
          lessons={lessons}
        />
      </main>
      
      <footer className="bg-gray-100 p-2 text-center text-sm text-gray-600 border-t">
        {chapters.length} chapters | {lessons.length} lessons
      </footer>
    </div>
  );
};

export default SignLanguageApp;