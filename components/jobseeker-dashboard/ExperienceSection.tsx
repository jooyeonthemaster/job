// 경력 사항 섹션 컴포넌트

import { Briefcase } from 'lucide-react';
import type { Experience } from '@/types/jobseeker-dashboard.types';

type Props = {
  experiences?: Experience[];
};

export default function ExperienceSection({ experiences }: Props) {
  if (!experiences || experiences.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-primary-600" />
        경력 사항
      </h3>
      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="border-l-4 border-primary-500 pl-4 py-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{exp.position}</p>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {exp.startDate} ~ {exp.current ? '현재' : exp.endDate}
                </p>
              </div>
              {exp.current && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  재직 중
                </span>
              )}
            </div>
            {exp.description && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{exp.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
