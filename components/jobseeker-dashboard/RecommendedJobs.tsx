// 추천 채용공고 컴포넌트

import Link from 'next/link';
import { Target, Building, MapPin, DollarSign, Briefcase, Heart, Edit3 } from 'lucide-react';
import type { Job } from '@/types/jobseeker-dashboard.types';

type Props = {
  jobs: Job[];
};

export default function RecommendedJobs({ jobs }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" />
          추천 채용공고
          {jobs.length > 0 && (
            <span className="text-xs font-normal text-gray-500">
              (프로필 기반 매칭)
            </span>
          )}
        </h2>
        <Link href="/jobs" className="text-sm text-primary-600 hover:text-primary-700">
          더 보기 →
        </Link>
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 hover:bg-primary-50/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <Building className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company.name}</p>
                  </div>
                </div>
                <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  {Math.floor(job.salary.min / 10000)}~{Math.floor(job.salary.max / 10000)}만원
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {job.employmentType === 'FULL_TIME' ? '정규직' :
                   job.employmentType === 'CONTRACT' ? '계약직' :
                   job.employmentType === 'PART_TIME' ? '파트타임' : '인턴'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {job.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  지원하기 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">
            프로필에 맞는 추천 공고가 없습니다
          </p>
          <p className="text-sm text-gray-500 mb-4">
            프로필을 더 자세히 작성하면 맞춤 공고를 추천받을 수 있어요
          </p>
          <Link
            href="/profile/edit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            프로필 완성하기
          </Link>
        </div>
      )}
    </div>
  );
}
