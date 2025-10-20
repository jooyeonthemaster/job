// 학력 사항 섹션 컴포넌트

import { GraduationCap } from 'lucide-react';
import type { Education } from '@/types/jobseeker-dashboard.types';

type Props = {
  educations?: Education[];
};

export default function EducationSection({ educations }: Props) {
  if (!educations || educations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-secondary-600" />
        학력 사항
      </h3>
      <div className="space-y-4">
        {educations.map((edu) => (
          <div key={edu.id} className="border-l-4 border-secondary-500 pl-4 py-2">
            <p className="font-semibold text-gray-900">{edu.school}</p>
            <p className="text-sm text-gray-600">{edu.degree} • {edu.field}</p>
            <p className="text-xs text-gray-500 mt-1">
              {edu.startYear} ~ {edu.current ? '재학 중' : edu.endYear}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
