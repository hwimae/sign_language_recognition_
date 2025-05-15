import type { Lesson } from '../types';

export interface SignLanguageInstance {
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

export interface SignLanguageItem {
  gloss: string;
  instances: SignLanguageInstance[];
}

export const convertSignLanguageDataToLessons = (signData: SignLanguageItem[]): Lesson[] => {
  return signData.map((item, index) => {
    const videoSrc = item.instances.length > 0 ? item.instances[0].url : '';
    
    return {
      id: `lesson-${index}`,
      title: item.gloss.charAt(0).toUpperCase() + item.gloss.slice(1), 
      description: `Learn how to sign "${item.gloss}" in sign language`,
      videoSrc,
      content: `This lesson teaches you how to sign "${item.gloss}" in sign language.`,
      variations: item.instances.map(instance => ({
        source: instance.source,
        url: instance.url,
        signerId: instance.signer_id
      })),
      completed: false,
      locked: index !== 0
    };
  });
};


export const loadSignLanguageData = async (): Promise<SignLanguageItem[]> => {
  try {
    const response = await fetch('/data/sign-language-data.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load sign language data:', error);
    return [];
  }
};