import React, { useState, useEffect, useRef } from "react";
import LessonTitle from "./LessonTitle";
import SignLanguageDetector from "./SignLanguageDetector";
import { Button } from "./ui/Button";

interface VideoVariation {
  source: string;
  url: string;
  signerId: number;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  content?: string;
  variations?: VideoVariation[];
  signData?: {
    gloss: string;
    instances: {
      url: string;
      source: string;
      signer_id: number;
    }[];
  };
}

interface LessonLayoutProps {
  lessons: Lesson[];
  initialLessonIndex?: number;
  onComplete: () => void;
  onLessonCompleted?: (lessonId: string) => void; 
  onMoveToNextLesson?: (currentLessonId: string) => void; 
  currentLessonId?: string; 
}

const LessonLayout: React.FC<LessonLayoutProps> = ({
  lessons,
  initialLessonIndex = 0,
  onComplete,
  onLessonCompleted,
  onMoveToNextLesson,
  currentLessonId,
}) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(initialLessonIndex);
  const [progress, setProgress] = useState(0);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentLesson = lessons[currentLessonIndex];
  
  const variations = currentLesson?.variations || 
    (currentLesson?.signData?.instances?.map(instance => ({
      source: instance.source,
      url: instance.url,
      signerId: instance.signer_id,
    })) || []);

  useEffect(() => {
    setSelectedVariation(0);
    setLessonCompleted(false);
    setProgress(0);
  }, [currentLessonIndex]);

  useEffect(() => {
    if (progress >= 100 && !lessonCompleted && currentLesson) {
      setLessonCompleted(true);
      if (onLessonCompleted) {
        onLessonCompleted(currentLesson.id);
      }
    }
  }, [progress, lessonCompleted, currentLesson, onLessonCompleted]);

  const handleNext = () => {
    if (lessonCompleted) {
      if (currentLessonIndex < lessons.length - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1);
        setProgress(0);
        setCustomVideoUrl(null);
        setLessonCompleted(false);
      } else if (onMoveToNextLesson && currentLessonId) {
        onMoveToNextLesson(currentLessonId);
      } else {
        onComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setProgress(0);
      setCustomVideoUrl(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        setCustomVideoUrl(url);
      } else {
        alert("Vui lòng tải lên tệp video.");
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const selectVariation = (index: number) => {
    setSelectedVariation(index);
    setCustomVideoUrl(null);
    setProgress(0);
  };

  const getCurrentVideoUrl = () => {
    if (customVideoUrl) return customVideoUrl;
    if (variations.length > 0 && variations[selectedVariation]?.url) 
      return variations[selectedVariation].url;
    if (currentLesson.signData?.instances?.[0]?.url) 
      return currentLesson.signData.instances[0].url;
    return undefined;
  };

  const getLessonTitle = () => {
    return currentLesson.signData?.gloss || currentLesson.title;
  };

  if (!currentLesson) {
    return <div>No lesson found</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onComplete} 
          className="mb-4 text-teal-600 hover:text-teal-800 flex items-center"
        >
          ← Quay lại danh sách
        </button>

        <LessonTitle
          title={getLessonTitle()}
          description={currentLesson.description}
          progress={progress}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNextLesson={currentLessonIndex < lessons.length - 1}
          hasPreviousLesson={currentLessonIndex > 0}
          lessonCompleted={lessonCompleted}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Video instruction with upload option */}
          <div className="flex flex-col">
            <div className="bg-gray-100 rounded-lg overflow-hidden flex-grow">
              <div className="aspect-video relative">
                {getCurrentVideoUrl() ? (
                  <video
                    ref={videoRef}
                    src={getCurrentVideoUrl()}
                    controls
                    className="w-full h-full object-cover"
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        const videoProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                        setProgress(videoProgress);
                      }
                    }}
                    onEnded={() => {
                      setProgress(100);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <p>No video available</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-white border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {variations[selectedVariation]?.source ? `Nguồn: ${variations[selectedVariation].source}` : ''}
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="video/*"
                    className="hidden"
                  />
                  <Button 
                    onClick={triggerFileInput}
                    variant="outline"
                    className="text-sm"
                  >
                    Tải lên video
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Video variations */}
            {variations.length > 1 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Các video tham khảo khác:</h3>
                <div className="flex flex-wrap gap-2">
                  {variations.map((variation, index) => (
                    <Button
                      key={index}
                      variant={selectedVariation === index ? "default" : "outline"}
                      onClick={() => selectVariation(index)}
                      className="text-xs"
                    >
                      {variation.source || `Variation ${index + 1}`}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Camera for practice (automatically starts) */}
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video">
            <SignLanguageDetector />
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Hướng dẫn:</h3>
          <p className="text-gray-700">
            {currentLesson.content || `Bài này hướng dẫn từ "${getLessonTitle()}" trong ngôn ngữ ký hiệu.`}
          </p>
          {lessonCompleted && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-700">
              <p className="font-medium">Chúc mừng! Bạn đã hoàn thành bài học này.</p>
              {currentLessonIndex < lessons.length - 1 && (
                <p className="text-sm mt-1">
                  Bạn có thể tiếp tục qua bài học tiếp theo hoặc quay lại danh sách bài học.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonLayout;