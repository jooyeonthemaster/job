'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ImageType = 'profile' | 'logo' | 'banner';

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onUploadError?: (error: string) => void;
  type?: ImageType;
  currentImageUrl?: string;
  label?: string;
  className?: string;
  userId?: string;
}

export default function CloudinaryUpload({
  onUploadSuccess,
  onUploadError,
  type = 'profile',
  currentImageUrl,
  label,
  className = '',
  userId,
}: CloudinaryUploadProps) {
  const [preview, setPreview] = useState<string>(currentImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');

  // 타입별 설정
  const getConfigByType = () => {
    switch (type) {
      case 'profile':
        return {
          folder: `jobmatch/profiles${userId ? `/${userId}` : ''}`,
          cropping: true,
          croppingAspectRatio: 1,
          maxImageWidth: 800,
          maxImageHeight: 800,
          croppingShowDimensions: true,
          showSkipCropButton: false,
          defaultSource: 'local',
        };
      case 'logo':
        return {
          folder: `jobmatch/logos${userId ? `/${userId}` : ''}`,
          cropping: true,
          croppingAspectRatio: 1,
          maxImageWidth: 500,
          maxImageHeight: 500,
          croppingShowDimensions: false,
          showSkipCropButton: false,
        };
      case 'banner':
        return {
          folder: `jobmatch/banners${userId ? `/${userId}` : ''}`,
          cropping: true,
          croppingAspectRatio: 3,
          maxImageWidth: 1600,
          maxImageHeight: 600,
          croppingShowDimensions: false,
          showSkipCropButton: true,
        };
      default:
        return {
          folder: 'jobmatch/general',
          cropping: false,
        };
    }
  };

  const config = getConfigByType();

  const handleRemove = () => {
    setPreview('');
    setError('');
  };

  // 프리뷰 컴포넌트
  const PreviewImage = () => {
    if (!preview) return null;

    const aspectRatioClass = 
      type === 'profile' ? 'aspect-square' :
      type === 'logo' ? 'aspect-square' :
      'aspect-[3/1]';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative group"
      >
        <div className={`${aspectRatioClass} w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-gray-200`}>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* 삭제 버튼 */}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 성공 표시 */}
        <div className="absolute bottom-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4" />
          업로드 완료
        </div>
      </motion.div>
    );
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}

      <AnimatePresence mode="wait">
        {preview ? (
          <PreviewImage key="preview" />
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CldUploadWidget
              uploadPreset="jobmatch_unsigned"
              options={{
                multiple: false,
                maxFiles: 1,
                maxFileSize: 5000000, // 5MB
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                sources: ['local', 'camera', 'url'],
                ...config,
              }}
              onQueuesEnd={(result: any, { widget }) => {
                setIsUploading(false);
                setUploadProgress(0);
              }}
              onSuccess={(result: any) => {
                if (result.event === 'success') {
                  const url = result.info.secure_url;
                  const publicId = result.info.public_id;
                  
                  setPreview(url);
                  setError('');
                  setIsUploading(false);
                  onUploadSuccess(url, publicId);
                }
              }}
              onError={(error: any) => {
                console.error('Upload error:', error);
                setError('업로드 중 오류가 발생했습니다.');
                setIsUploading(false);
                onUploadError?.(error.message || '업로드 실패');
              }}
              onOpen={() => {
                setIsUploading(true);
                setError('');
              }}
              onAbort={() => {
                setIsUploading(false);
              }}
            >
              {({ open }) => (
                <div className="space-y-4">
                  <button
                    onClick={() => open()}
                    type="button"
                    className="w-full relative"
                    disabled={isUploading}
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer group">
                      <div className="flex flex-col items-center gap-4">
                        {isUploading ? (
                          <>
                            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-600 font-medium">
                              업로드 중...
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                              {type === 'profile' ? (
                                <Camera className="w-8 h-8 text-primary-600" />
                              ) : (
                                <Upload className="w-8 h-8 text-primary-600" />
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-gray-900 font-medium mb-1">
                                클릭하여 {type === 'profile' ? '프로필 사진' : type === 'logo' ? '로고' : '배너 이미지'} 업로드
                              </p>
                              <p className="text-sm text-gray-500">
                                JPG, PNG, WEBP (최대 5MB)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* 에러 메시지 */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </motion.div>
                  )}

                  {/* 업로드 팁 */}
                  {!isUploading && !error && (
                    <div className="text-xs text-gray-500 text-center space-y-1">
                      {type === 'profile' && (
                        <>
                          <p>💡 얼굴이 잘 보이는 정면 사진을 권장합니다</p>
                          <p>📐 정사각형 비율로 자동 크롭됩니다</p>
                        </>
                      )}
                      {type === 'logo' && (
                        <>
                          <p>💡 투명 배경의 PNG 파일을 권장합니다</p>
                          <p>📐 정사각형 비율로 조정됩니다</p>
                        </>
                      )}
                      {type === 'banner' && (
                        <>
                          <p>💡 가로가 긴 이미지를 권장합니다</p>
                          <p>📐 3:1 비율로 자동 크롭됩니다 (1600x533 권장)</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CldUploadWidget>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
