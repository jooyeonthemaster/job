'use client';

import { Job } from '@/types';
import { Building2, MapPin, Clock, Users, DollarSign, Globe, Briefcase } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const formatSalary = (min: number, max: number) => {
    const format = (num: number) => {
      if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
      if (num >= 10000000) return `${(num / 10000).toFixed(0)}만`;
      return num.toLocaleString();
    };
    return `${format(min)} - ${format(max)}`;
  };

  const getExperienceLabel = (level: string) => {
    const labels: Record<string, string> = {
      ENTRY: '신입',
      JUNIOR: '주니어',
      MID: '미드레벨',
      SENIOR: '시니어',
      EXECUTIVE: '임원급'
    };
    return labels[level] || level;
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FULL_TIME: '정규직',
      PART_TIME: '파트타임',
      CONTRACT: '계약직',
      INTERNSHIP: '인턴십'
    };
    return labels[type] || type;
  };

  const daysUntilDeadline = Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilDeadline <= 7;

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full flex flex-col">
        <div className="p-6 flex-1">
          {/* Badges */}
          {isUrgent && (
            <div className="mb-3">
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                마감임박 D-{daysUntilDeadline}
              </span>
            </div>
          )}

          {/* Company Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{job.company.name}</p>
              <p className="text-xs text-gray-500">{job.company.nameEn}</p>
            </div>
          </div>

          {/* Job Title */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
            {job.title}
          </h3>
          <p className="text-sm text-gray-500 mb-3">{job.titleEn}</p>

          {/* Meta Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {getExperienceLabel(job.experienceLevel)} · {getEmploymentTypeLabel(job.employmentType)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {formatSalary(job.salary.min, job.salary.max)}
                {job.salary.negotiable && <span className="text-xs ml-1">(협상가능)</span>}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {job.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-50 text-gray-500 rounded">
                +{job.tags.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                지원자 {job.applicants}
              </span>
              {job.visaSponsorship && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  비자지원
                </span>
              )}
            </div>
            <span className="text-xs text-primary-600 font-medium group-hover:text-primary-700">
              자세히 보기 →
            </span>
          </div>
        </div>

        {/* Company Banner Image - 하단에 꽉 차게 표시 */}
        {job.company.bannerImage && (
          <div className="relative h-32 overflow-hidden group-hover:opacity-95 transition-opacity">
            <Image
              src={job.company.bannerImage}
              alt={`${job.company.name} 배너`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
        )}
      </div>
    </Link>
  );
}