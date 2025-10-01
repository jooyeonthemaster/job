'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getJobseekerProfile, updateJobseekerProfile } from '@/lib/firebase/jobseeker-service';
import { Upload, Check, AlertCircle, ArrowLeft, Save, Eye, Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PDFImageViewer from '@/components/PDFImageViewer';

export default function ResumeEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [currentResumeUrl, setCurrentResumeUrl] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const profile = await getJobseekerProfile(user.uid);
        if (profile?.resumeFileUrl) {
          setCurrentResumeUrl(profile.resumeFileUrl);
          setCurrentFileName(profile.resumeFileName || 'Resume.pdf');
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB 이하여야 합니다.');
        return;
      }

      // 파일 형식 검증
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('PDF 또는 Word 문서만 업로드 가능합니다.');
        return;
      }

      setResumeFile(file);
      setError('');
    }
  };

  const uploadResumeToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-resume', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '파일 업로드 실패');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError('');

    try {
      let resumeFileUrl = currentResumeUrl;

      // 새 파일이 있으면 업로드
      if (resumeFile) {
        resumeFileUrl = await uploadResumeToCloudinary(resumeFile);
      }

      // Firestore 업데이트
      await updateJobseekerProfile(user.uid, {
        resumeFileUrl,
        resumeFileName: resumeFile?.name || currentFileName,
        resumeUploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      alert('이력서가 성공적으로 업데이트되었습니다!');
      router.push('/jobseeker-dashboard');
    } catch (error: any) {
      console.error('Resume update error:', error);
      setError(error.message || '이력서 업데이트 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/jobseeker-dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">이력서 관리</h1>
          <p className="text-gray-600 mt-2">PDF 또는 Word 문서로 이력서를 업로드하세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          {/* 현재 이력서 */}
          {currentResumeUrl && !resumeFile && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                현재 이력서
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{currentFileName}</p>
                    <p className="text-sm text-gray-500">업로드됨</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentResumeUrl.endsWith('.pdf') && (
                    <button
                      onClick={() => setShowPreview(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      미리보기
                    </button>
                  )}
                  <a
                    href={currentResumeUrl}
                    download={currentFileName}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 파일 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {currentResumeUrl ? '새 이력서 업로드 (선택)' : '이력서 업로드'}
            </label>

            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              error ? 'border-red-300 bg-red-50' :
              resumeFile ? 'border-green-300 bg-green-50' :
              'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
            }`}>
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <Check className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{resumeFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-primary-600 mt-2">클릭하여 다른 파일 선택</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-1">
                      클릭하여 {currentResumeUrl ? '새 ' : ''}이력서 업로드
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF 또는 Word 문서 (최대 10MB)
                    </p>
                  </>
                )}
              </label>
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* 저장 버튼 */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || (!resumeFile && !currentResumeUrl)}
              className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>저장하기</span>
                </>
              )}
            </button>
            <Link
              href="/jobseeker-dashboard"
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
          </div>
        </motion.div>

        {/* PDF 미리보기 모달 */}
        {showPreview && currentResumeUrl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">이력서 미리보기</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <div className="overflow-auto max-h-[calc(90vh-80px)]">
                <PDFImageViewer
                  pdfUrl={currentResumeUrl}
                  fileName={currentFileName}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
