"use client";

import React from "react";
import { Progress } from "./ui/Progress"; 
import { Button } from "./ui/Button"; 

interface LessonTitleProps {
  title: string;
  description?: string;
  progress: number;
  onNext: () => void;
  onPrevious: () => void;
  hasNextLesson: boolean;
  hasPreviousLesson: boolean;
  lessonCompleted?: boolean;
}

const LessonTitle: React.FC<LessonTitleProps> = ({
  title,
  description,
  progress,
  onNext,
  onPrevious,
  hasNextLesson,
  hasPreviousLesson,
  lessonCompleted = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-gray-600">{description}</p>}
        <div className="w-full max-w-md mt-2">
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-gray-500 mt-1">
            Tiến độ: {Math.round(progress)}%
            {lessonCompleted && <span className="ml-2 text-green-600 font-medium">Đã hoàn thành!</span>}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!hasPreviousLesson}
        >
          Quay lại
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!lessonCompleted && !hasNextLesson}
          variant={lessonCompleted ? "default" : "outline"}
          className={lessonCompleted ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {lessonCompleted ? "Bài tiếp theo" : "Tiếp tục"}
        </Button>
      </div>
    </div>
  );
};

export default LessonTitle;