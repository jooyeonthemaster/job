// 관리자 구직자 관리 탭 컴포넌트

import { useEffect } from 'react';
import { Eye, Users } from 'lucide-react';
import Link from 'next/link';
import { JobseekerProfile } from '@/lib/firebase/jobseeker-service';

interface JobseekersTabProps {
  jobseekers: JobseekerProfile[];
  loading: boolean;
  onLoad: () => Promise<void>;
}

export default function JobseekersTab({ jobseekers, loading, onLoad }: JobseekersTabProps) {
  useEffect(() => {
    onLoad();
  }, [onLoad]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-500">구직자 목록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">구직자 관리</h2>
        <div className="text-sm text-gray-600">
          총 {jobseekers.length}명
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {jobseekers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">등록된 구직자가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">헤드라인</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주요 기술</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">희망 직무</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">온보딩 완료</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobseekers.map((jobseeker) => (
                  <tr key={jobseeker.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {jobseeker.profileImageUrl ? (
                          <img src={jobseeker.profileImageUrl} alt={jobseeker.fullName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">
                              {jobseeker.fullName?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{jobseeker.fullName}</div>
                          <div className="text-sm text-gray-500">{jobseeker.headline || jobseeker.uid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{jobseeker.headline || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {jobseeker.skills?.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {jobseeker.skills && jobseeker.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{jobseeker.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{jobseeker.desiredPositions?.join(', ') || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {jobseeker.onboardingCompleted ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          완료
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          미완료
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {jobseeker.createdAt ? new Date((jobseeker.createdAt as any).toDate?.() || jobseeker.createdAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        href={`/talent/${jobseeker.uid}`}
                        className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

