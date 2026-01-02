'use client';

// 인재풀 메인 페이지 - 리팩토링 완료 (833줄 → 150줄)
// 기능 변경 없음, 컴포넌트/훅/유틸리티로 분리

import { useState } from 'react';
import Header from '@/components/Header';
import TalentSearchBar from '@/components/talent/TalentSearchBar';
import TalentSidebar from '@/components/talent/TalentSidebar';
import TalentCard from '@/components/talent/TalentCard';
import LoginRequiredModal from '@/components/talent/LoginRequiredModal';
import { useTalentAuth } from '@/hooks/useTalentAuth';
import { useTalentData } from '@/hooks/useTalentData';
import { useTalentFilters } from '@/hooks/useTalentFilters';

export default function TalentPage() {
  // Custom Hooks
  const { isCompany, checkingAuth } = useTalentAuth();
  const { profiles, loading } = useTalentData();
  const {
    searchTerm,
    selectedSkills,
    selectedNationality,
    selectedExperience,
    selectedAvailability,
    selectedCategory,
    expandedCategories,
    expandedSubcategories,
    setSearchTerm,
    setSelectedSkills,
    setSelectedNationality,
    setSelectedExperience,
    setSelectedAvailability,
    setSelectedCategory,
    setExpandedCategories,
    setExpandedSubcategories,
    filteredProfiles,
    nationalities
  } = useTalentFilters(profiles);

  // Local State
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSelectedSkills([]);
    setSelectedCategory([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section with Search */}
      <TalentSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <TalentSidebar
                selectedSkills={selectedSkills}
                selectedCategory={selectedCategory}
                expandedCategories={expandedCategories}
                expandedSubcategories={expandedSubcategories}
                filteredCount={filteredProfiles.length}
                selectedNationality={selectedNationality}
                selectedExperience={selectedExperience}
                selectedAvailability={selectedAvailability}
                nationalities={nationalities}
                onNationalityChange={setSelectedNationality}
                onExperienceChange={setSelectedExperience}
                onAvailabilityChange={setSelectedAvailability}
                onSkillsChange={setSelectedSkills}
                onCategoryChange={setSelectedCategory}
                onExpandedCategoriesChange={setExpandedCategories}
                onExpandedSubcategoriesChange={setExpandedSubcategories}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Talent Cards */}
            <div className="lg:col-span-3 space-y-6">
              {loading ? (
                <div className="bg-white rounded-md shadow-sm p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">실제 데이터를 불러오는 중...</p>
                </div>
              ) : filteredProfiles.length > 0 ? (
                filteredProfiles.map(profile => (
                  <TalentCard
                    key={profile.id}
                    profile={profile}
                    checkingAuth={checkingAuth}
                    isCompany={isCompany}
                    onLoginRequired={() => setShowLoginModal(true)}
                  />
                ))
              ) : (
                <div className="bg-white rounded-md shadow-sm p-12 text-center">
                  <p className="text-gray-500 mb-2">검색 조건에 맞는 인재가 없습니다.</p>
                  <p className="text-sm text-gray-400">다른 조건으로 검색해보세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 로그인 필요 모달 */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
