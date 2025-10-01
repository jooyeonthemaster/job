'use client';

import { useState } from 'react';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function TestStoragePage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const addStatus = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : '📋';
    setStatus(prev => [...prev, `${prefix} ${message}`]);
  };

  const clearStatus = () => setStatus([]);

  const checkAuth = () => {
    clearStatus();
    addStatus('인증 상태 확인 중...', 'info');
    
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        addStatus(`인증됨: ${user.email} (${user.uid})`, 'success');
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        addStatus('인증되지 않음 - 로그인이 필요합니다', 'error');
      }
    });
  };

  const testStorageConfig = async () => {
    clearStatus();
    addStatus('Storage 설정 테스트 시작...', 'info');
    
    try {
      // Check storage bucket config
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      addStatus(`Storage Bucket: ${bucketName}`, 'info');
      
      if (!bucketName) {
        addStatus('Storage Bucket이 설정되지 않았습니다', 'error');
        return;
      }

      // Test creating a reference
      const testRef = ref(storage, 'test/connection.txt');
      addStatus('Storage 참조 생성 성공', 'success');
      
      // Test root listing (may fail due to permissions)
      try {
        const rootRef = ref(storage);
        const result = await listAll(rootRef);
        addStatus(`루트 디렉토리 접근 가능 - ${result.prefixes.length}개 폴더`, 'success');
      } catch (error) {
        addStatus(`루트 디렉토리 접근 제한 (정상): ${(error as Error).message}`, 'info');
      }

      addStatus('Storage 기본 설정 정상', 'success');
    } catch (error) {
      addStatus(`Storage 설정 오류: ${(error as Error).message}`, 'error');
    }
  };

  const testListFiles = async () => {
    if (!userId) {
      addStatus('로그인이 필요합니다', 'error');
      return;
    }

    clearStatus();
    addStatus('파일 목록 조회 테스트...', 'info');
    
    try {
      const userRef = ref(storage, `profileImages/${userId}/`);
      const result = await listAll(userRef);
      
      addStatus(`조회 성공: ${result.items.length}개 파일 발견`, 'success');
      
      if (result.items.length > 0) {
        for (const item of result.items) {
          const url = await getDownloadURL(item);
          addStatus(`파일: ${item.name} - URL 획득 성공`, 'success');
        }
      }
    } catch (error: any) {
      addStatus(`목록 조회 실패: ${error.message}`, 'error');
      if (error.code === 'storage/cors-blocked') {
        addStatus('CORS 오류 - CORS 설정이 필요합니다', 'error');
      }
    }
  };

  const testUploadFile = async () => {
    if (!userId) {
      addStatus('로그인이 필요합니다', 'error');
      return;
    }

    clearStatus();
    addStatus('파일 업로드 테스트...', 'info');
    
    try {
      // Create a test file
      const testData = new Blob(['Hello, Firebase Storage!'], { type: 'text/plain' });
      const fileName = `test-${Date.now()}.txt`;
      const fileRef = ref(storage, `profileImages/${userId}/${fileName}`);
      
      const snapshot = await uploadBytes(fileRef, testData);
      addStatus(`업로드 성공: ${fileName}`, 'success');
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      addStatus(`다운로드 URL 획득 성공`, 'success');
    } catch (error: any) {
      addStatus(`업로드 실패: ${error.message}`, 'error');
      if (error.code === 'storage/unauthorized') {
        addStatus('권한 오류 - Storage Rules 확인 필요', 'error');
      } else if (error.code === 'storage/cors-blocked') {
        addStatus('CORS 오류 - CORS 설정이 필요합니다', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Firebase Storage 테스트</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">테스트 도구</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={checkAuth}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              인증 상태 확인
            </button>
            <button
              onClick={testStorageConfig}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Storage 설정 테스트
            </button>
            <button
              onClick={testListFiles}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition disabled:opacity-50"
              disabled={!isAuthenticated}
            >
              파일 목록 조회
            </button>
            <button
              onClick={testUploadFile}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:opacity-50"
              disabled={!isAuthenticated}
            >
              파일 업로드
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">테스트 결과</h2>
            <button
              onClick={clearStatus}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>
          
          {status.length === 0 ? (
            <p className="text-gray-500">테스트를 실행하려면 위의 버튼을 클릭하세요</p>
          ) : (
            <div className="space-y-2 font-mono text-sm">
              {status.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded ${
                    message.startsWith('✅') ? 'bg-green-50 text-green-800' :
                    message.startsWith('❌') ? 'bg-red-50 text-red-800' :
                    'bg-blue-50 text-blue-800'
                  }`}
                >
                  {message}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">💡 문제 해결 순서</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
            <li>인증 상태 확인 → 로그인되어 있는지 확인</li>
            <li>Storage 설정 테스트 → 기본 설정 확인</li>
            <li>파일 목록 조회 → CORS 설정 확인</li>
            <li>파일 업로드 → Storage Rules 확인</li>
          </ol>
        </div>
      </div>
    </div>
  );
}