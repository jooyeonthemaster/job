'use client';

import { Company } from '@/types';
import { Building2, MapPin, Users, Star, Briefcase, Clock } from 'lucide-react';
import Link from 'next/link';

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link href={`/companies/${company.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
        {/* Company Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="w-8 h-8 text-gray-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {company.name}
            </h3>
            <p className="text-sm text-gray-500">{company.nameEn}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900 ml-1">
                  {company.rating}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({company.reviewCount} 리뷰)
              </span>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {company.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{company.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">직원 {company.employeeCount}명</span>
          </div>
          {company.established && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">설립 {company.established}</span>
            </div>
          )}
        </div>

        {/* Tech Stack */}
        {company.techStack && company.techStack.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {company.techStack.slice(0, 4).map(tech => (
                <span 
                  key={tech} 
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {tech}
                </span>
              ))}
              {company.techStack.length > 4 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                  +{company.techStack.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-600">
                채용중 {company.openPositions}건
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {company.industry}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}