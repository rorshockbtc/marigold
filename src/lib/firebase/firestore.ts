import { db } from './client';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { ArticleState } from '../types';

export const publishStoryToFirestore = async (storyId: string, article: ArticleState): Promise<boolean> => {
  if (!db) {
    console.error("Firebase DB is not initialized.");
    return false;
  }
  
  try {
    const docRef = doc(collection(db, 'public_stories'), storyId);
    await setDoc(docRef, {
      ...article,
      publishedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error publishing story to Firestore:", error);
    return false;
  }
};

export const getPublishedStory = async (storyId: string): Promise<ArticleState | null> => {
  if (!db) {
    console.error("Firebase DB is not initialized.");
    return null;
  }

  try {
    const docRef = doc(db, 'public_stories', storyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ArticleState;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching published story from Firestore:", error);
    return null;
  }
};
