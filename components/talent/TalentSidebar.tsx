// 인재풀 사이드바 필터 컴포넌트
// 상단 필터(국적, 경력, 가용성)와 직군별 필터 통합

import { Filter, ChevronRight, ChevronDown } from 'lucide-react';
import { TALENT_CATEGORIES } from '@/constants/talent-categories';

type TalentSidebarProps = {
  selectedSkills: string[];
  selectedCategory: string[];
  expandedCategories: string[];
  expandedSubcategories: string[];
  filteredCount: number;
  // 기본 필터 props
  selectedNationality: string;
  selectedExperience: string;
  selectedAvailability: string;
  nationalities: string[];
  onNationalityChange: (value: string) => void;
  onExperienceChange: (value: string) => void;
  onAvailabilityChange: (value: string) => void;
  // 스킬/카테고리 필터 props
  onSkillsChange: (skills: string[]) => void;
  onCategoryChange: (categories: string[]) => void;
  onExpandedCategoriesChange: (categories: string[]) => void;
  onExpandedSubcategoriesChange: (subcategories: string[]) => void;
  onResetFilters: () => void;
};

export default function TalentSidebar({
  selectedSkills,
  selectedCategory,
  expandedCategories,
  expandedSubcategories,
  filteredCount,
  selectedNationality,
  selectedExperience,
  selectedAvailability,
  nationalities,
  onNationalityChange,
  onExperienceChange,
  onAvailabilityChange,
  onSkillsChange,
  onCategoryChange,
  onExpandedCategoriesChange,
  onExpandedSubcategoriesChange,
  onResetFilters
}: TalentSidebarProps) {
  return (
    <div className="bg-white rounded-md shadow-sm p-6 sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">상세 필터</h3>
      </div>

      {/* 기본 필터: 국적, 경력, 가용성 */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        {/* 국적 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">국적</label>
          <select
            value={selectedNationality}
            onChange={(e) => onNationalityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">모든 국적</option>
            {nationalities.map(nat => (
              <option key={nat} value={nat}>{nat}</option>
            ))}
          </select>
        </div>

        {/* 경력 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">경력</label>
          <select
            value={selectedExperience}
            onChange={(e) => onExperienceChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">모든 경력</option>
            <option value="0-2">0-2년</option>
            <option value="3-5">3-5년</option>
            <option value="6+">6년 이상</option>
          </select>
        </div>

        {/* 가용성 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">가용성</label>
          <select
            value={selectedAvailability}
            onChange={(e) => onAvailabilityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">모두</option>
            <option value="immediate">즉시 가능</option>
            <option value="2weeks">2주 이내</option>
            <option value="1month">1개월 이내</option>
          </select>
        </div>
      </div>

      {/* Industry Categories Filter */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            직군별 전문 기술
          </label>

          {/* Main Categories */}
          <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
            {TALENT_CATEGORIES.map(category => (
              <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (expandedCategories.includes(category.name)) {
                      onExpandedCategoriesChange(expandedCategories.filter(c => c !== category.name));
                    } else {
                      onExpandedCategoriesChange([...expandedCategories, category.name]);
                    }
                  }}
                >
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategory.includes(category.name)}
                      onChange={(e) => {
                        e.stopPropagation();
                        // 해당 카테고리의 모든 스킬 추출
                        const categorySkills = category.subcategories.flatMap(sub => sub.skills);

                        if (e.target.checked) {
                          // 카테고리 추가 + 모든 하위 스킬 추가
                          onCategoryChange([...selectedCategory, category.name]);
                          onSkillsChange([...new Set([...selectedSkills, ...categorySkills])]);
                        } else {
                          // 카테고리 제거 + 모든 하위 스킬 제거
                          onCategoryChange(selectedCategory.filter(c => c !== category.name));
                          onSkillsChange(selectedSkills.filter(skill => !categorySkills.includes(skill)));
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  </label>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedCategories.includes(category.name) ? 'rotate-90' : ''
                  }`} />
                </div>

                {expandedCategories.includes(category.name) && (
                  <div className="bg-gray-50 p-2 space-y-1">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.name} className="bg-white rounded p-1">
                        <div
                          className="flex items-center justify-between px-2 py-1 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            const key = `${category.name}-${subcategory.name}`;
                            if (expandedSubcategories.includes(key)) {
                              onExpandedSubcategoriesChange(expandedSubcategories.filter(s => s !== key));
                            } else {
                              onExpandedSubcategoriesChange([...expandedSubcategories, key]);
                            }
                          }}
                        >
                          <span className="text-xs font-medium text-gray-600">{subcategory.name}</span>
                          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${
                            expandedSubcategories.includes(`${category.name}-${subcategory.name}`) ? 'rotate-180' : ''
                          }`} />
                        </div>

                        {expandedSubcategories.includes(`${category.name}-${subcategory.name}`) && (
                          <div className="px-2 py-1 grid grid-cols-2 gap-1">
                            {subcategory.skills.map(skill => (
                              <label key={skill} className="flex items-center gap-1 cursor-pointer hover:text-primary-600">
                                <input
                                  type="checkbox"
                                  checked={selectedSkills.includes(skill)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      onSkillsChange([...selectedSkills, skill]);
                                    } else {
                                      onSkillsChange(selectedSkills.filter(s => s !== skill));
                                    }
                                  }}
                                  className="w-3 h-3 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-xs text-gray-600 truncate" title={skill}>{skill}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {(selectedSkills.length > 0 || selectedCategory.length > 0) && (
          <button
            onClick={onResetFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            모든 필터 초기화
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{filteredCount}</span>명의 인재가 검색되었습니다
        </p>
      </div>
    </div>
  );
}
