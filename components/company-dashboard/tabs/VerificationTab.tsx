'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle, ShieldCheck, Eye, ChevronRight, Download } from 'lucide-react';
import { VerificationStatus } from '@/types/company-dashboard.types';

interface VerificationTabProps {
  companyId: string;
}

export function VerificationTab({ companyId }: VerificationTabProps) {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('not_submitted');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 기존 인증 정보 불러오기
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await fetch(`/api/company/verification?company_id=${companyId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setVerificationStatus(result.data.status as VerificationStatus);
          if (result.data.rejection_reason) {
            setRejectionReason(result.data.rejection_reason);
          }
          if (result.data.document_url) {
            setDocumentUrl(result.data.document_url);
            setDocumentName(result.data.document_name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch verification status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerificationStatus();
  }, [companyId]);

  // 파일 선택 핸들러
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('파일 크기는 2MB 이하여야 합니다.');
      return;
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      alert('JPG, PNG, PDF, TIFF 파일만 업로드 가능합니다.');
      return;
    }

    setDocumentFile(file);

    // 미리보기 생성
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreview(null);
    }
  };

  // 파일 업로드 및 인증 신청
  const handleSubmitVerification = async () => {
    if (!documentFile) {
      alert('사업자등록증명원을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('company_id', companyId);

      // 진행률 업데이트
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + 10;
        });
      }, 300);

      // 실제 API 호출
      const response = await fetch('/api/company/verification', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '업로드 실패');
      }

      setUploadProgress(100);
      setVerificationStatus('pending');
      setDocumentUrl(result.data.document_url);
      setDocumentName(result.data.document_name);
      alert('인증 서류가 제출되었습니다. 관리자 검토 후 승인 처리됩니다.');

    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 다시 올리기
  const handleReupload = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">기업 인증</h1>
        <p className="text-gray-600">사업자등록증명원을 제출하여 기업 인증을 받으세요</p>
      </div>

      {/* 인증 상태별 배너 */}
      {verificationStatus === 'approved' && (
        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-lg shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">인증 완료</h3>
                <p className="text-gray-700 text-lg mb-4">
                  기업 인증이 승인되었습니다. 모든 서비스를 이용하실 수 있습니다.
                </p>
                {documentUrl && documentName && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-md p-4 border border-white">
                    <p className="text-sm text-gray-600 mb-2">제출된 서류</p>
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      {documentName}
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-200 rounded-lg shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  검토 중
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white animate-pulse">
                    대기중
                  </span>
                </h3>
                <p className="text-gray-700 text-lg mb-4">
                  제출하신 서류를 관리자가 검토 중입니다. 영업일 기준 1-2일 내에 결과를 안내드립니다.
                </p>
                {documentUrl && documentName && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-md p-4 border border-white">
                    <p className="text-sm text-gray-600 mb-2">제출된 서류</p>
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-yellow-700 hover:text-yellow-800 font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      {documentName}
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )}
                <div className="mt-4">
                  <button
                    onClick={handleReupload}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-all border border-gray-200 font-medium text-sm"
                  >
                    파일 다시 올리기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'rejected' && (
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border-2 border-red-200 rounded-lg shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">인증 반려</h3>
                <p className="text-gray-700 text-lg mb-4">
                  제출하신 서류가 반려되었습니다.
                </p>
                {rejectionReason && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-md p-4 mb-4 border border-white">
                    <p className="text-sm font-semibold text-red-900 mb-2">반려 사유:</p>
                    <p className="text-sm text-red-700">{rejectionReason}</p>
                  </div>
                )}
                <p className="text-gray-600 mb-4">서류를 확인하시고 다시 제출해주세요.</p>
                <button
                  onClick={handleReupload}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  <Upload className="w-5 h-5" />
                  파일 다시 제출하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 인증 안내 */}
      <div className="bg-white rounded-md p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-primary-600" />
          기업 인증이 필요한 이유
        </h2>
        <div className="bg-blue-50 rounded-md p-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <p className="text-gray-700 flex-1">
              기업정보 도용 및 허위 정보로 인한 피해 예방을 위해 <strong>「직업안정법 시행령 제 28조」</strong>에 따라 기업을 검증하여야 합니다.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <p className="text-gray-700 flex-1">
              직업소개사업자는 구인공고를 게재하는 자를 검증하여야 하는 바 유/무료 직업소개사업자 및 파견 사업자는 공고 게재 사전에 구인을 진행하는 기업으로부터 사업자등록증 등 서류를 수취하여 검증하여야 합니다.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <p className="text-gray-700 flex-1">
              <strong className="text-blue-900">공고등록, 이력서 열람을 이용하기 위해서는 반드시 필수로 기업인증을 받으셔야 합니다.</strong>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
            <p className="text-gray-700 flex-1">
              기업인증을 위해 신청일 기준 <strong className="text-blue-900">90일 이내의 사업자등록증명원</strong>을 필수로 제출 해야합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 서류 제출 영역 */}
      {(verificationStatus === 'not_submitted' || verificationStatus === 'rejected' || !documentFile) && (
        <div className="bg-white rounded-md p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary-600" />
            기업 인증 서류 제출하기
          </h2>

          {/* 파일 업로드 영역 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-6 hover:border-primary-400 hover:bg-primary-50/30 transition-all">
            {!documentFile ? (
              <>
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">사업자등록증명원을 넣어주세요</h3>
                <p className="text-gray-500 mb-6">
                  2MB 이하의 파일 (JPG, PNG, PDF, TIFF)만 등록 가능합니다.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.tiff"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="document-file"
                />
                <label
                  htmlFor="document-file"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-md hover:from-primary-700 hover:to-primary-800 cursor-pointer transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
                >
                  <Upload className="w-5 h-5" />
                  파일 선택
                </label>
              </>
            ) : isUploading ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-xl font-semibold text-gray-900 mb-2">{documentFile.name}</p>
                <div className="max-w-md mx-auto mb-4">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">검토중... {uploadProgress}%</p>
                </div>
              </>
            ) : (
              <>
                <FileText className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-900 mb-4">{documentFile.name}</p>
                {documentPreview && (
                  <div className="mb-6 flex justify-center">
                    <img
                      src={documentPreview}
                      alt="Document preview"
                      className="max-w-lg max-h-96 rounded-md border-2 border-gray-200 shadow-md"
                    />
                  </div>
                )}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleSubmitVerification}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-md hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    인증 신청하기
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleReupload}
                    className="inline-flex items-center gap-2 px-6 py-4 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-all border-2 border-gray-200 font-medium text-lg"
                  >
                    파일 다시 선택
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 제출 서류 안내 */}
          <div className="bg-gray-50 rounded-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">제출 서류</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <span className="font-medium text-gray-900">일반기업, 개인사업자, 비영리 단체:</span>{' '}
                  <span className="text-primary-600 font-semibold">사업자등록 증명원</span>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <span className="font-medium text-gray-900">헤드헌터, 파견:</span>{' '}
                  <span className="text-primary-600 font-semibold">사업자등록 증명원</span>
                  {' + '}
                  <span className="text-primary-600 font-semibold">직업소개 사업증</span>
                  {' or '}
                  <span className="text-primary-600 font-semibold">파견 허가증</span>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <p className="text-gray-500">2MB 이하의 파일 (JPG, PNG, PDF, TIFF)만 등록 가능합니다.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href="https://www.gov.kr/mw/AA020InfoCappView.do?HighCtgCD=&CappBizCD=12100000016"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                사업자등록증명원 발급받기
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                발급 및 다운 방법 안내
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
