'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Briefcase,
  Building2,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface JobGridCardProps {
  job: {
    id: number;
    company: string;
    logo?: string | null;
    companyImage?: string | null;
    position: string;
    location: string;
    experience: string;
    salary: string;
    type: string;
    skills: string[];
    deadline: string;
    isNew?: boolean;
    isHot?: boolean;
    applicants: number;
    views: number;
  };
  size?: 'small' | 'medium' | 'large';
}

export default function JobGridCard({ job, size = 'medium' }: JobGridCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-5'
  };
  
  const titleClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };
  
  const companyClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };
  
  const detailClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-sm'
  };

  return (
    <div
      className={cn(
        "relative",
        isHovered ? "z-[100]" : "z-0"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/jobs/${job.id}`} className="block">
        <div
          className={cn(
            "relative bg-white border transition-all duration-300 cursor-pointer h-full",
            sizeClasses[size],
            "shadow-sm hover:shadow-lg",
            isHovered ? "border-primary-400 rounded-t-xl border-b-0" : "border-gray-200 rounded-md"
          )}
        >
        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {job.isNew && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              NEW
            </span>
          )}
          {job.isHot && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              HOT
            </span>
          )}
        </div>
        
        {/* Company Logo */}
        <div className={cn(
          "flex items-center justify-center rounded-lg mb-3 overflow-hidden font-bold",
          size === 'small' ? 'w-10 h-10 text-sm' : size === 'medium' ? 'w-12 h-12 text-base' : 'w-14 h-14 text-lg',
          job.logo ? 'bg-gradient-to-br from-gray-100 to-gray-200' : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
        )}>
          {job.logo ? (
            <Image
              src={job.logo}
              alt={job.company}
              width={size === 'small' ? 40 : size === 'medium' ? 48 : 56}
              height={size === 'small' ? 40 : size === 'medium' ? 48 : 56}
              className="w-full h-full object-cover"
              onError={(e) => {
                // 이미지 로드 실패 시 회사 이름 첫 글자 표시
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.classList.add('bg-gradient-to-br', 'from-primary-500', 'to-primary-600', 'text-white');
                  parent.classList.remove('from-gray-100', 'to-gray-200');
                  parent.textContent = job.company.charAt(0);
                }
              }}
            />
          ) : (
            // 로고 없을 때 회사 이름 첫 글자
            <span>{job.company.charAt(0)}</span>
          )}
        </div>
        
        {/* Main Content */}
        <div className="space-y-2">
          <div>
            <h3 className={cn(
              "font-bold text-gray-900 line-clamp-2 mb-1",
              titleClasses[size]
            )}>
              {job.position}
            </h3>
            <p className={cn(
              "text-gray-600 font-medium",
              companyClasses[size]
            )}>
              {job.company}
            </p>
          </div>
          
          {/* Basic Info */}
          <div className={cn(
            "space-y-1 text-gray-500",
            detailClasses[size]
          )}>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{job.experience}</span>
            </div>
          </div>
          
        </div>
        
        {/* Bottom Info (always visible) */}
        <div className={cn(
          "flex items-center justify-between mt-3 pt-2 border-t border-gray-100",
          detailClasses[size]
        )}>
          <span className="text-gray-500">{job.type}</span>
          <span className="text-primary-600 font-medium">{job.deadline}</span>
        </div>
        
        {/* Hover Content - Extended Info (Absolute Overlay) */}
        {isHovered && (
          <div className={cn(
            "absolute -left-[1px] -right-[1px] top-full -mt-[1px] bg-white rounded-b-xl border-x border-b border-primary-400 shadow-xl transition-all duration-200 overflow-hidden",
            sizeClasses[size]
          )}>
            <div className="space-y-2">
              {/* Salary */}
              {size !== 'small' && (
                <div className={cn(
                  "flex items-center gap-1.5 text-primary-600 font-medium",
                  detailClasses[size]
                )}>
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{job.salary}</span>
                </div>
              )}

              {/* Company Image */}
              <div className="relative h-24 -mx-5 mb-3 overflow-hidden">
                {job.companyImage ? (
                  <Image
                    src={job.companyImage}
                    alt={`${job.company} 전경`}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
                )}
              </div>

              {/* Skills */}
              {size !== 'small' && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div className="pt-2 border-t border-gray-100"></div>

              {/* Apply Button (for medium and large sizes) */}
              {size !== 'small' && (
                <button className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1">
                  바로 지원
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
        </div>
      </Link>
    </div>
  );
}