'use client';

import { useState, useRef, DragEvent } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ImageType = 'profile' | 'logo' | 'banner';

interface CustomCloudinaryUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onUploadError?: (error: string) => void;
  type?: ImageType;
  currentImageUrl?: string;
  label?: string;
  className?: string;
  userId?: string;
}

export default function CustomCloudinaryUpload({
  onUploadSuccess,
  onUploadError,
  type = 'profile',
  currentImageUrl,
  label,
  className = '',
  userId,
}: CustomCloudinaryUploadProps) {
  const [preview, setPreview] = useState<string>(currentImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 타입별 설정
  const getConfigByType = () => {
    switch (type) {
      case 'profile':
        return {
          folder: `jobmatch/profiles${userId ? `/${userId}` : ''}`,
          maxSize: 5 * 1024 * 1024, // 5MB
          aspectRatio: '1:1',
          maxWidth: 800,
          maxHeight: 800,
          title: '프로필 사진',
          description: '얼굴이 잘 보이는 정면 사진을 권장합니다',
        };
      case 'logo':
        return {
          folder: `jobmatch/logos${userId ? `/${userId}` : ''}`,
          maxSize: 5 * 1024 * 1024,
          aspectRatio: '1:1',
          maxWidth: 500,
          maxHeight: 500,
          title: '회사 로고',
          description: '투명 배경의 PNG 파일을 권장합니다',
        };
      case 'banner':
        return {
          folder: `jobmatch/banners${userId ? `/${userId}` : ''}`,
          maxSize: 10 * 1024 * 1024, // 10MB
          aspectRatio: '3:1',
          maxWidth: 1600,
          maxHeight: 600,
          title: '배너 이미지',
          description: '가로가 긴 이미지를 권장합니다 (1600x533)',
        };
      default:
        return {
          folder: 'jobmatch/general',
          maxSize: 5 * 1024 * 1024,
          aspectRatio: '16:9',
          maxWidth: 1200,
          maxHeight: 800,
          title: '이미지',
          description: '이미지를 업로드하세요',
        };
    }
  };

  const config = getConfigByType();

  // 파일 검증
  const validateFile = (file: File): string | null => {
    if (file.size > config.maxSize) {
      return `파일 크기는 ${config.maxSize / 1024 / 1024}MB 이하여야 합니다.`;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return '지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP만 가능)';
    }

    return null;
  };

  // Cloudinary 업로드
  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'jobmatch_unsigned');
    formData.append('folder', config.folder);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error) {
      throw error;
    }
  };

  // 파일 업로드 처리
  const handleFileUpload = async (file: File) => {
    // 검증
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onUploadError?.(validationError);
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // 미리보기 생성
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Cloudinary 업로드
      const result = await uploadToCloudinary(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 성공
      setPreview(result.url);
      onUploadSuccess(result.url, result.publicId);
      
      // 미리보기 URL 정리
      URL.revokeObjectURL(previewUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || '업로드 중 오류가 발생했습니다.';
      setError(errorMessage);
      setPreview('');
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 이미지 제거
  const handleRemove = () => {
    setPreview('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 클릭하여 파일 선택
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}

      <AnimatePresence mode="wait">
        {preview && !isUploading ? (
          // 미리보기 표시
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <div className={`relative w-full ${
              type === 'profile' ? 'aspect-square max-w-xs mx-auto' :
              type === 'logo' ? 'aspect-square max-w-sm mx-auto' :
              'aspect-[3/1] max-w-2xl mx-auto'
            } overflow-hidden rounded-xl border-2 border-primary-200`}>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              
              {/* 오버레이 */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={handleClick}
                  type="button"
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  변경
                </button>
                <button
                  onClick={handleRemove}
                  type="button"
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  삭제
                </button>
              </div>
            </div>

            {/* 성공 표시 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-2 text-green-600"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">업로드 완료!</span>
            </motion.div>
          </motion.div>
        ) : (
          // 업로드 영역
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : isUploading
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-4">
                {isUploading ? (
                  // 업로드 중
                  <>
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary-200 rounded-full" />
                      <div 
                        className="absolute inset-0 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 font-semibold mb-1">
                        업로드 중...
                      </p>
                      <p className="text-sm text-gray-600">
                        {uploadProgress}%
                      </p>
                    </div>
                    {/* 프로그레스 바 */}
                    <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </>
                ) : (
                  // 업로드 대기
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                      {type === 'profile' ? (
                        <Camera className="w-8 h-8 text-primary-600" />
                      ) : type === 'logo' ? (
                        <ImageIcon className="w-8 h-8 text-primary-600" />
                      ) : (
                        <Upload className="w-8 h-8 text-primary-600" />
                      )}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-gray-900 font-semibold mb-1">
                        {isDragging ? '여기에 놓으세요' : config.title + ' 업로드'}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        클릭하거나 이미지를 드래그하세요
                      </p>
                      
                      {/* 업로드 버튼 */}
                      <button
                        type="button"
                        className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg font-medium"
                      >
                        파일 선택
                      </button>
                    </div>

                    {/* 안내 정보 */}
                    <div className="text-center space-y-1">
                      <p className="text-xs text-gray-500">
                        JPG, PNG, WEBP (최대 {config.maxSize / 1024 / 1024}MB)
                      </p>
                      <p className="text-xs text-primary-600 font-medium">
                        💡 {config.description}
                      </p>
                      {type !== 'profile' && (
                        <p className="text-xs text-gray-500">
                          📐 권장 비율: {config.aspectRatio}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">업로드 실패</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* 업로드 팁 */}
            {!isUploading && !error && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      이미지 업로드 팁
                    </h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {type === 'profile' && (
                        <>
                          <li>• 얼굴이 명확하게 보이는 정면 사진이 좋습니다</li>
                          <li>• 밝은 배경에서 촬영한 사진을 권장합니다</li>
                          <li>• 정사각형 비율로 자동 조정됩니다</li>
                        </>
                      )}
                      {type === 'logo' && (
                        <>
                          <li>• 투명 배경(PNG)이 가장 깔끔합니다</li>
                          <li>• 로고가 중앙에 위치하도록 여백을 두세요</li>
                          <li>• 정사각형 비율로 조정됩니다</li>
                        </>
                      )}
                      {type === 'banner' && (
                        <>
                          <li>• 가로가 긴 이미지를 사용하세요 (3:1 비율)</li>
                          <li>• 1600x533 크기를 권장합니다</li>
                          <li>• 중요한 내용은 가운데에 배치하세요</li>
                        </>
                      )}
                      <li>• 이미지는 자동으로 최적화됩니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
