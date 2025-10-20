// 기업 정보 탭 컴포넌트

'use client';

import Link from 'next/link';
import { Building2, FileText, Users, Edit, Globe } from 'lucide-react';
import { Company } from '@/types/company-dashboard.types';
import { getCompanyStatusText, getCompanyStatusColor } from '@/utils/company-profile';

interface ProfileTabProps {
  company: Company;
}

export const ProfileTab = ({ company }: ProfileTabProps) => {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">기업 정보</h1>
          <p className="text-gray-600">공개 프로필에 표시되는 기업 정보를 관리하세요</p>
        </div>
        <Link
          href="/company-dashboard/edit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          수정하기
        </Link>
      </div>

      {/* 로고 & 기본 정보 카드 */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="flex items-start gap-6">
          {/* 로고 */}
          {company.logo ? (
            <div className="flex-shrink-0">
              <img
                src={company.logo}
                alt={`${company.name} 로고`}
                className="w-24 h-24 object-contain rounded-lg border border-gray-200"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* 기업명 & 한 줄 소개 */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {company.name}
              {company.name_en && <span className="text-gray-500 font-normal ml-2">({company.name_en})</span>}
            </h2>
            {company.summary && (
              <p className="text-gray-600 mb-3">{company.summary}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCompanyStatusColor(company.status)}`}>
                {getCompanyStatusText(company.status)}
              </span>
              {company.profile_completed && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  프로필 완성
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 사업자 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          사업자 정보
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">사업자등록번호</label>
            <p className="text-gray-900 font-medium">{company.registration_number || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">대표자명</label>
            <p className="text-gray-900 font-medium">{company.ceo_name || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">개업일자</label>
            <p className="text-gray-900 font-medium">{company.established || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">사업자등록증</label>
            {company.registration_document ? (
              <a
                href={company.registration_document}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline font-medium inline-flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                문서 보기
              </a>
            ) : (
              <p className="text-gray-900 font-medium">-</p>
            )}
          </div>
        </div>
      </div>

      {/* 기업 기본 정보 (K-Work 기반) */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600" />
          기업 기본 정보
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">기업 형태</label>
            <p className="text-gray-900 font-medium">{company.company_type || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">기업 규모</label>
            <p className="text-gray-900 font-medium">{company.employee_count || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">업태 (업종)</label>
            <p className="text-gray-900 font-medium">{company.industry || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">대표번호</label>
            <p className="text-gray-900 font-medium">{company.company_phone || company.phone || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">홈페이지</label>
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline font-medium inline-flex items-center gap-1"
              >
                <Globe className="w-4 h-4" />
                바로가기
              </a>
            ) : (
              <p className="text-gray-900 font-medium">-</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-500">기업 주소</label>
            <p className="text-gray-900 font-medium">{company.address || '-'}</p>
            {company.location && company.location !== company.address && (
              <p className="text-sm text-gray-500 mt-1">({company.location})</p>
            )}
          </div>
          {company.company_image && (
            <div className="md:col-span-2">
              <label className="text-sm text-gray-500 mb-2 block">회사 전경 이미지</label>
              <img
                src={company.company_image}
                alt="회사 전경"
                className="w-full max-h-64 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* 담당자 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          담당자 정보
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">담당 부서</label>
            <p className="text-gray-900 font-medium">{company.manager_department || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">담당자명</label>
            <p className="text-gray-900 font-medium">{company.manager_name || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">직급/직책</label>
            <p className="text-gray-900 font-medium">{company.manager_position || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">담당자 연락처</label>
            <p className="text-gray-900 font-medium">{company.manager_phone || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

