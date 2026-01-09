// 채용 공고 요약 테이블 컴포넌트
// 입력된 필드만 표 형식으로 깔끔하게 표시

import {
  formatSalary,
  getExperienceLabel,
  getEmploymentTypeLabel,
  getKoreanLevelLabel,
  getEnglishLevelLabel
} from '@/utils/jobFormatters';
import { CheckCircle, XCircle } from 'lucide-react';

type JobData = {
  // 필수 필드
  title?: string;
  title_en?: string;
  deadline?: string;

  // 기본 정보
  department?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;

  // 급여
  salary_min?: number;
  salary_max?: number;
  salary_negotiable?: boolean;

  // 직무 상세
  job_description?: string;
  required_experience?: string;
  required_skills?: string[];
  main_tasks?: string[];
  requirements?: string[];
  preferred_qualifications?: string[];

  // 언어/비자
  visa_sponsorship?: boolean;
  for_korean?: boolean;      // 내국인 채용 여부
  for_foreigner?: boolean;   // 외국인 채용 여부
  korean_level?: string;
  english_level?: string;

  // 근무 조건
  probation?: string;
  start_date?: string;
  work_hours?: string;

  // 복지
  benefits?: string[];
  tags?: string[];

  // 담당자
  manager?: {
    name?: string;
    position?: string;
    email?: string;
    phone?: string;
  };

  // 회사 정보
  company?: {
    name?: string;
    industry?: string;
  };
};

interface JobSummaryTableProps {
  job: JobData;
}

// 값이 있는지 체크하는 유틸
const hasValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.filter(v => v && String(v).trim()).length > 0;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return true;
  return false;
};

// 테이블 행 컴포넌트
function TableRow({
  label,
  value,
  isHeader = false,
  colSpan = false
}: {
  label: string;
  value: React.ReactNode;
  isHeader?: boolean;
  colSpan?: boolean;
}) {
  if (colSpan) {
    return (
      <tr className="border-b border-primary-100 last:border-b-0">
        <th
          colSpan={2}
          className="px-4 py-3 text-left text-sm font-semibold text-primary-700 bg-primary-50/70"
        >
          {label}
        </th>
      </tr>
    );
  }

  return (
    <tr className={`border-b border-primary-100 last:border-b-0 ${isHeader ? 'bg-primary-50/50' : ''}`}>
      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 bg-gray-50/80 w-[140px] align-top whitespace-nowrap">
        {label}
      </th>
      <td className="px-4 py-3 text-sm text-gray-800">
        {value}
      </td>
    </tr>
  );
}

// 리스트 형식 표시
function ListDisplay({ items }: { items: string[] }) {
  const validItems = items.filter(item => item && item.trim());
  if (validItems.length === 0) return null;

  return (
    <ul className="space-y-1">
      {validItems.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className="text-primary-400 mt-1.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// 태그 형식 표시
function TagsDisplay({ items }: { items: string[] }) {
  const validItems = items.filter(item => item && item.trim());
  if (validItems.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {validItems.map((item, index) => (
        <span
          key={index}
          className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium border border-primary-100"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// O/X 표시
function BooleanDisplay({ value, trueText, falseText }: { value: boolean; trueText: string; falseText: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${value ? 'text-primary-600' : 'text-gray-400'}`}>
      {value ? (
        <>
          <CheckCircle className="w-4 h-4" />
          {trueText}
        </>
      ) : (
        <>
          <XCircle className="w-4 h-4" />
          {falseText}
        </>
      )}
    </span>
  );
}

export default function JobSummaryTable({ job }: JobSummaryTableProps) {
  // 급여 포맷팅
  const getSalaryDisplay = () => {
    if (!hasValue(job.salary_min) && !hasValue(job.salary_max)) return null;

    const salaryText = formatSalary(job.salary_min ?? null, job.salary_max ?? null);
    const negotiable = job.salary_negotiable ? ' (협의 가능)' : '';
    return `${salaryText} 만원${negotiable}`;
  };

  // 마감일 포맷팅
  const getDeadlineDisplay = () => {
    if (!job.deadline) return null;
    return new Date(job.deadline).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-primary-100 overflow-hidden">
      <table className="w-full">
        <tbody>
          {/* ===== 모집 개요 섹션 ===== */}
          <TableRow label="📋 모집 개요" value="" colSpan />

          {hasValue(job.title) && (
            <TableRow
              label="모집분야"
              value={
                <div>
                  <span className="font-semibold text-gray-900">{job.title}</span>
                  {hasValue(job.title_en) && (
                    <span className="text-gray-500 ml-2">({job.title_en})</span>
                  )}
                </div>
              }
            />
          )}

          {hasValue(job.department) && (
            <TableRow label="부서/팀" value={job.department} />
          )}

          {hasValue(job.employment_type) && (
            <TableRow label="고용형태" value={getEmploymentTypeLabel(job.employment_type || '')} />
          )}

          {hasValue(job.experience_level) && (
            <TableRow label="경력" value={getExperienceLabel(job.experience_level || '')} />
          )}

          {getSalaryDisplay() && (
            <TableRow label="연봉" value={getSalaryDisplay()} />
          )}

          {hasValue(job.location) && (
            <TableRow label="근무지" value={job.location} />
          )}

          {getDeadlineDisplay() && (
            <TableRow label="마감일" value={getDeadlineDisplay()} />
          )}

          {/* ===== 근무 조건 섹션 ===== */}
          {(hasValue(job.work_hours) || hasValue(job.probation) || hasValue(job.start_date)) && (
            <>
              <TableRow label="⏰ 근무 조건" value="" colSpan />

              {hasValue(job.work_hours) && (
                <TableRow label="근무시간" value={job.work_hours} />
              )}

              {hasValue(job.probation) && (
                <TableRow label="수습기간" value={job.probation} />
              )}

              {hasValue(job.start_date) && (
                <TableRow label="입사예정일" value={job.start_date} />
              )}
            </>
          )}

          {/* ===== 담당 업무 섹션 ===== */}
          {(hasValue(job.job_description) || hasValue(job.main_tasks)) && (
            <>
              <TableRow label="💼 담당 업무" value="" colSpan />

              {hasValue(job.job_description) && (
                <TableRow
                  label="직무 설명"
                  value={
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {job.job_description}
                    </div>
                  }
                />
              )}

              {hasValue(job.main_tasks) && (
                <TableRow
                  label="주요 업무"
                  value={<ListDisplay items={job.main_tasks || []} />}
                />
              )}
            </>
          )}

          {/* ===== 자격 요건 섹션 ===== */}
          {(hasValue(job.required_experience) || hasValue(job.requirements) || hasValue(job.required_skills)) && (
            <>
              <TableRow label="✅ 자격 요건" value="" colSpan />

              {hasValue(job.required_experience) && (
                <TableRow
                  label="필요 경력"
                  value={
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {job.required_experience}
                    </div>
                  }
                />
              )}

              {hasValue(job.requirements) && (
                <TableRow
                  label="필수 요건"
                  value={<ListDisplay items={job.requirements || []} />}
                />
              )}

              {hasValue(job.required_skills) && (
                <TableRow
                  label="필요 스킬"
                  value={<TagsDisplay items={job.required_skills || []} />}
                />
              )}
            </>
          )}

          {/* ===== 우대 사항 섹션 ===== */}
          {hasValue(job.preferred_qualifications) && (
            <>
              <TableRow label="⭐ 우대 사항" value="" colSpan />
              <TableRow
                label="우대 조건"
                value={<ListDisplay items={job.preferred_qualifications || []} />}
              />
            </>
          )}

          {/* ===== 언어 및 비자 섹션 ===== */}
          {(hasValue(job.korean_level) || hasValue(job.english_level) || job.visa_sponsorship !== undefined) && (
            <>
              <TableRow label="🌐 언어 및 비자" value="" colSpan />

              {hasValue(job.korean_level) && (
                <TableRow label="한국어" value={getKoreanLevelLabel(job.korean_level || '')} />
              )}

              {hasValue(job.english_level) && (
                <TableRow label="영어" value={getEnglishLevelLabel(job.english_level || '')} />
              )}

              {job.visa_sponsorship !== undefined && (
                <TableRow
                  label="비자 지원"
                  value={
                    <BooleanDisplay
                      value={job.visa_sponsorship}
                      trueText="지원 가능"
                      falseText="지원 불가"
                    />
                  }
                />
              )}

              {/* 채용 대상 표시 */}
              {(job.for_korean !== undefined || job.for_foreigner !== undefined) && (
                <TableRow
                  label="채용 대상"
                  value={
                    job.for_korean && job.for_foreigner ? (
                      <span className="text-gray-700">국적 무관</span>
                    ) : job.for_korean ? (
                      <span className="text-primary-600">내국인 채용</span>
                    ) : job.for_foreigner ? (
                      <span className="text-primary-600">외국인 채용</span>
                    ) : (
                      <span className="text-gray-400">미지정</span>
                    )
                  }
                />
              )}
            </>
          )}

          {/* ===== 복지 혜택 섹션 ===== */}
          {hasValue(job.benefits) && (
            <>
              <TableRow label="🎁 복지 혜택" value="" colSpan />
              <TableRow
                label="복지 항목"
                value={<ListDisplay items={job.benefits || []} />}
              />
            </>
          )}

          {/* ===== 채용 담당자 섹션 ===== */}
          {job.manager && (hasValue(job.manager.name) || hasValue(job.manager.email)) && (
            <>
              <TableRow label="👤 채용 담당자" value="" colSpan />

              {hasValue(job.manager.name) && (
                <TableRow
                  label="담당자"
                  value={
                    <span>
                      {job.manager.name}
                      {hasValue(job.manager.position) && (
                        <span className="text-gray-500 ml-1">({job.manager.position})</span>
                      )}
                    </span>
                  }
                />
              )}

              {hasValue(job.manager.email) && (
                <TableRow
                  label="이메일"
                  value={
                    <a
                      href={`mailto:${job.manager.email}`}
                      className="text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {job.manager.email}
                    </a>
                  }
                />
              )}

              {hasValue(job.manager.phone) && (
                <TableRow
                  label="연락처"
                  value={
                    <a
                      href={`tel:${job.manager.phone}`}
                      className="text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {job.manager.phone}
                    </a>
                  }
                />
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
