'use client';

import { useState } from 'react';
import { ChevronDown, Filter, MapPin, Briefcase, DollarSign, Globe, X } from 'lucide-react';
import { industries, locations, experienceLevels, employmentTypes } from '@/lib/data';
import { cn } from '@/lib/utils';

interface FilterSectionProps {
  onFilterChange?: (filters: any) => void;
}

export default function FilterSection({ onFilterChange }: FilterSectionProps) {
  const [activeFilters, setActiveFilters] = useState<any>({
    industry: [],
    location: [],
    experience: [],
    employment: [],
    visaSponsorship: false,
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    industry: true,
    location: true,
    experience: false,
    employment: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters((prev: any) => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter((v: string) => v !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      onFilterChange?.(updated);
      return updated;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      industry: [],
      location: [],
      experience: [],
      employment: [],
      visaSponsorship: false,
    });
    onFilterChange?.({});
  };

  const hasActiveFilters = 
    activeFilters.industry.length > 0 ||
    activeFilters.location.length > 0 ||
    activeFilters.experience.length > 0 ||
    activeFilters.employment.length > 0 ||
    activeFilters.visaSponsorship;

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-white">필터</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              모두 지우기
            </button>
          )}
        </div>

        <div className="space-y-3">
          {/* Industry Filter */}
          <div className="border-t border-white/5 pt-3">
            <button
              onClick={() => toggleSection('industry')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                산업분야
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                expandedSections.industry && "rotate-180"
              )} />
            </button>
            {expandedSections.industry && (
              <div className="mt-3 space-y-2">
                {industries.map((industry) => (
                  <label
                    key={industry}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.industry.includes(industry)}
                      onChange={() => toggleFilter('industry', industry)}
                      className="w-4 h-4 rounded glass-button"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                      {industry}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Location Filter */}
          <div className="border-t border-white/5 pt-3">
            <button
              onClick={() => toggleSection('location')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                지역
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                expandedSections.location && "rotate-180"
              )} />
            </button>
            {expandedSections.location && (
              <div className="mt-3 space-y-2">
                {locations.map((location) => (
                  <label
                    key={location}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.location.includes(location)}
                      onChange={() => toggleFilter('location', location)}
                      className="w-4 h-4 rounded glass-button"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                      {location}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Experience Filter */}
          <div className="border-t border-white/5 pt-3">
            <button
              onClick={() => toggleSection('experience')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                경력
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                expandedSections.experience && "rotate-180"
              )} />
            </button>
            {expandedSections.experience && (
              <div className="mt-3 space-y-2">
                {experienceLevels.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.experience.includes(level.value)}
                      onChange={() => toggleFilter('experience', level.value)}
                      className="w-4 h-4 rounded glass-button"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                      {level.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Visa Sponsorship */}
          <div className="border-t border-white/5 pt-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Globe className="w-4 h-4" />
                비자 지원 가능
              </span>
              <input
                type="checkbox"
                checked={activeFilters.visaSponsorship}
                onChange={(e) => {
                  setActiveFilters((prev: any) => ({
                    ...prev,
                    visaSponsorship: e.target.checked
                  }));
                  onFilterChange?.({ ...activeFilters, visaSponsorship: e.target.checked });
                }}
                className="w-4 h-4 rounded glass-button"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2">적용된 필터</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]: [string, any]) => {
              if (Array.isArray(value) && value.length > 0) {
                return value.map((v: string) => (
                  <span
                    key={`${key}-${v}`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs glass rounded-full text-gray-300"
                  >
                    {v}
                    <button
                      onClick={() => toggleFilter(key, v)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ));
              }
              if (key === 'visaSponsorship' && value) {
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs glass rounded-full text-gray-300"
                  >
                    비자 지원
                    <button
                      onClick={() => {
                        setActiveFilters((prev: any) => ({ ...prev, visaSponsorship: false }));
                        onFilterChange?.({ ...activeFilters, visaSponsorship: false });
                      }}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}