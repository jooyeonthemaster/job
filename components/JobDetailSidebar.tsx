// 채용 공고 상세 페이지 사이드바 컴포넌트
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Building2, Share2, Mail, Phone } from 'lucide-react';

type CompanyInfo = {
  id: string;
  name: string;
  name_en: string;
  logo?: string;
  industry: string;
  location: string;
  description?: string;
};

type ManagerInfo = {
  name?: string;
  position?: string;
  email?: string;
  phone?: string;
};

type JobData = {
  id: string;
  company?: CompanyInfo;
  manager?: ManagerInfo;
};

type JobDetailSidebarProps = {
  job: JobData;
  onApplyClick: () => void;
  onCopyLink: () => void;
};

export default function JobDetailSidebar({
  job,
  onApplyClick,
  onCopyLink
}: JobDetailSidebarProps) {
  return (
    <div className="sticky top-8 space-y-4">
      {/* Apply Button */}
      <button
        onClick={onApplyClick}
        className="w-full bg-gradient-to-r from-primary-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
      >
        지원하기
      </button>

      {/* Action Buttons */}
      <button
        onClick={onCopyLink}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-primary-600 transition-all"
      >
        <Share2 className="w-4 h-4" />
        공유
      </button>

      {/* Company Info Card */}
      {job.company && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-50 to-cyan-50 px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-600" />
              회사 정보
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {/* 회사명 */}
            <div className="pb-3 border-b border-gray-100">
              <p className="text-lg font-bold text-gray-900">{job.company.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{job.company.name_en}</p>
            </div>

            {/* 그리드 정보 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">업종</p>
                <p className="text-sm font-medium text-gray-900">{job.company.industry}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">위치</p>
                <p className="text-sm font-medium text-gray-900">{job.company.location || '미정'}</p>
              </div>
            </div>

            {/* 회사 소개 */}
            {job.company.description && (
              <div className="bg-blue-50/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1.5">소개</p>
                <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{job.company.description}</p>
              </div>
            )}

            {/* 채용 담당자 정보 */}
            {(job.manager?.name || job.manager?.email || job.manager?.phone) && (
              <>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">채용 담당자</p>

                  {/* 담당자 이름 + 직책 */}
                  {job.manager?.name && (
                    <div className="bg-gradient-to-r from-primary-50 to-transparent rounded-lg p-3 mb-3">
                      <p className="text-sm font-bold text-gray-900">{job.manager.name}</p>
                      {job.manager?.position && (
                        <p className="text-xs text-gray-600 mt-0.5">{job.manager.position}</p>
                      )}
                    </div>
                  )}

                  {/* 연락처 그리드 */}
                  <div className="space-y-2">
                    {/* 이메일 */}
                    {job.manager?.email && (
                      <a
                        href={`mailto:${job.manager.email}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:shadow-md transition-shadow">
                          <Mail className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">이메일</p>
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {job.manager.email}
                          </p>
                        </div>
                      </a>
                    )}

                    {/* 전화번호 */}
                    {job.manager?.phone && (
                      <a
                        href={`tel:${job.manager.phone}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:shadow-md transition-shadow">
                          <Phone className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">전화번호</p>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            {job.manager.phone}
                          </p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 회사 페이지 보기 */}
            <Link
              href={`/companies/${job.company.id}`}
              className="block text-center py-3 px-4 bg-gradient-to-r from-primary-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              회사 페이지 보기 →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
