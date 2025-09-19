'use client';

import Link from 'next/link';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Users,
  Eye,
  Building2,
  ChevronRight,
  DollarSign,
  Star
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface JobGridCardProps {
  job: {
    id: number;
    company: string;
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
    <Link href={`/jobs/${job.id}`} className="block relative">
      <div 
        className={cn(
          "relative bg-white border transition-all duration-300 cursor-pointer h-full",
          sizeClasses[size],
          "shadow-sm hover:shadow-lg",
          isHovered ? "z-50 border-primary-400 rounded-t-xl border-b-0" : "border-gray-200 rounded-xl"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
        
        {/* Company Logo Placeholder */}
        <div className={cn(
          "flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 mb-3",
          size === 'small' ? 'w-10 h-10' : size === 'medium' ? 'w-12 h-12' : 'w-14 h-14'
        )}>
          <Building2 className={cn(
            "text-gray-500",
            size === 'small' ? 'w-5 h-5' : size === 'medium' ? 'w-6 h-6' : 'w-7 h-7'
          )} />
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
            "absolute -left-[1px] -right-[1px] top-full -mt-[1px] bg-white rounded-b-xl border-x border-b border-primary-400 shadow-xl z-50 transition-all duration-200",
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
              
              {/* Stats */}
              <div className={cn(
                "flex items-center justify-between pt-2 border-t border-gray-100",
                detailClasses[size]
              )}>
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{job.applicants}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{job.views}</span>
                  </div>
                </div>
                <span className="text-primary-600 font-medium">
                  {job.deadline}
                </span>
              </div>
              
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
  );
}