// 인재풀 필터링 로직 훅
// app/talent/page.tsx에서 분리 (기능 변경 없음)

import { useState, useMemo } from 'react';
import type { TalentProfile } from '@/lib/supabase/talent-service';

export function useTalentFilters(profiles: TalentProfile[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedNationality, setSelectedNationality] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);

  // 필터링된 프로필
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      const matchesSearch =
        profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some(skill => profile.skills.includes(skill));

      const matchesNationality =
        selectedNationality === 'all' ||
        profile.nationality === selectedNationality;

      const matchesExperience =
        selectedExperience === 'all' ||
        (selectedExperience === '0-2' && profile.experience <= 2) ||
        (selectedExperience === '3-5' && profile.experience >= 3 && profile.experience <= 5) ||
        (selectedExperience === '6+' && profile.experience >= 6);

      return matchesSearch && matchesSkills && matchesNationality && matchesExperience;
    });
  }, [profiles, searchTerm, selectedSkills, selectedNationality, selectedExperience]);

  // 사용 가능한 국적 목록
  const nationalities = useMemo(() => {
    return Array.from(new Set(profiles.map(p => p.nationality)));
  }, [profiles]);

  // 사용 가능한 스킬 목록 (상위 12개)
  const allSkills = useMemo(() => {
    return Array.from(new Set(profiles.flatMap(p => p.skills))).slice(0, 12);
  }, [profiles]);

  return {
    // State
    searchTerm,
    selectedSkills,
    selectedNationality,
    selectedExperience,
    selectedAvailability,
    selectedCategory,
    expandedCategories,
    expandedSubcategories,
    // Setters
    setSearchTerm,
    setSelectedSkills,
    setSelectedNationality,
    setSelectedExperience,
    setSelectedAvailability,
    setSelectedCategory,
    setExpandedCategories,
    setExpandedSubcategories,
    // Computed
    filteredProfiles,
    nationalities,
    allSkills
  };
}
