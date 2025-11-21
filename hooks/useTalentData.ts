// 인재풀 데이터 로딩 훅
// app/talent/page.tsx에서 분리 (기능 변경 없음)

import { useState, useEffect } from 'react';
import { getAllTalents, type TalentProfile } from '@/lib/supabase/talent-service';

export function useTalentData() {
  const [realProfiles, setRealProfiles] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealData = async () => {
      setLoading(true);
      try {
        const talents = await getAllTalents();
        setRealProfiles(talents);
        console.log(`✅ Loaded ${talents.length} talents from Supabase`);
      } catch (error) {
        console.error('Failed to load real data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRealData();
  }, []);

  return { profiles: realProfiles, loading };
}
