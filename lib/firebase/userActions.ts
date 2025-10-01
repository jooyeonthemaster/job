import { db } from './config';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * 사용자 프로필 업데이트
 * Cloudinary URL을 직접 저장 (Firebase Storage 사용 안 함)
 */
export const updateUserProfile = async (userId: string, data: any) => {
  const userDocRef = doc(db, 'users', userId);

  const finalData = { 
    ...data,
    updatedAt: new Date().toISOString(),
    userId: userId
  };

  try {
    // Firestore 문서가 존재하는지 확인 후 생성 또는 업데이트
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      await updateDoc(userDocRef, finalData);
    } else {
      await setDoc(userDocRef, finalData, { merge: true });
    }
    
    return { success: true, data: finalData };
  } catch (firestoreError) {
    console.error('Failed to update user profile in Firestore:', firestoreError);
    throw new Error('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
  }
};







