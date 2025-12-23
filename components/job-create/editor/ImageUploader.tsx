'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
  onCancel?: () => void;
  maxSize?: number; // MB
  accept?: string;
}

export default function ImageUploader({
  onImageUpload,
  onCancel,
  maxSize = 2,
  accept = 'image/jpeg,image/png,image/jpg'
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = 'jobmatch_unsigned'; // 프로젝트 공통 unsigned preset

    if (!cloudName) {
      throw new Error('Cloudinary 설정이 올바르지 않습니다.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'jobmatch/job_postings'); // 채용공고 이미지 폴더

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error?.message || 'Cloudinary 업로드 실패'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('네트워크 오류가 발생했습니다.'));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(formData);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // 파일 크기 검증
    if (file.size > maxSize * 1024 * 1024) {
      setError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드 시작
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const url = await uploadToCloudinary(file);
      onImageUpload(url);
      setPreview(null);
      setProgress(0);
    } catch (err: any) {
      console.error('Image upload error:', err);
      setError(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setProgress(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onCancel?.();
  };

  return (
    <div className="bg-white rounded-md p-6 border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload-input"
      />

      {!preview ? (
        <label
          htmlFor="image-upload-input"
          className="flex flex-col items-center justify-center cursor-pointer py-8"
        >
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-base font-medium text-gray-900 mb-1">
            이미지를 업로드하세요
          </p>
          <p className="text-sm text-gray-500">
            JPG, PNG 파일 (최대 {maxSize}MB)
          </p>
          <button
            type="button"
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Upload className="w-4 h-4 inline mr-2" />
            파일 선택
          </button>
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-96 object-contain bg-gray-50"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-white font-medium">{progress}%</p>
                </div>
              </div>
            )}
          </div>

          {!uploading && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <X className="w-4 h-4 inline mr-2" />
                취소
              </button>
              <label
                htmlFor="image-upload-input"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-center cursor-pointer"
              >
                다른 이미지 선택
              </label>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
