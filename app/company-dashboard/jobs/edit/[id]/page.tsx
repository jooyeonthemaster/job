'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import ValidationModal from '@/components/ValidationModal';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [companyData, setCompanyData] = useState<any>(null);

  // 기본 정보
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [experienceLevel, setExperienceLevel] = useState('MID');

  // 급여
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryNegotiable, setSalaryNegotiable] = useState(true);

  // 상세 정보
  const [description, setDescription] = useState('');
  const [mainTasks, setMainTasks] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [preferredQualifications, setPreferredQualifications] = useState<string[]>(['']);

  // 복지 및 태그
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['']);

  // 비자 및 언어
  const [visaSponsorship, setVisaSponsorship] = useState(true);
  const [koreanLevel, setKoreanLevel] = useState('INTERMEDIATE');
  const [englishLevel, setEnglishLevel] = useState('FLUENT');

  // 마감일
  const [deadline, setDeadline] = useState('');

  // 근무 조건
  const [probation, setProbation] = useState('3개월');
  const [workHours, setWorkHours] = useState('');
  const [startDate, setStartDate] = useState('즉시 가능');

  // 채용 담당자
  const [managerName, setManagerName] = useState('');
  const [managerPosition, setManagerPosition] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPhone, setManagerPhone] = useState('');

  // 채용공고 및 회사 정보 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push('/company-auth');
          return;
        }

        // 회사 정보 가져오기
        const companyDoc = await getDoc(doc(db, 'companies', user.uid));
        if (companyDoc.exists()) {
          setCompanyData({ id: user.uid, ...companyDoc.data() });
        }

        // 채용공고 정보 가져오기
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (jobDoc.exists()) {
          const jobData = jobDoc.data();

          // 폼에 기존 데이터 설정
          setTitle(jobData.title || '');
          setTitleEn(jobData.titleEn || '');
          setDepartment(jobData.department || '');
          setLocation(jobData.location || '');
          setEmploymentType(jobData.employmentType || 'FULL_TIME');
          setExperienceLevel(jobData.experienceLevel || 'MID');

          setSalaryMin(jobData.salary?.min?.toString() || '');
          setSalaryMax(jobData.salary?.max?.toString() || '');
          setSalaryNegotiable(jobData.salary?.negotiable ?? true);

          setDescription(jobData.description || '');
          setMainTasks(jobData.mainTasks?.length > 0 ? jobData.mainTasks : ['']);
          setRequirements(jobData.requirements?.length > 0 ? jobData.requirements : ['']);
          setPreferredQualifications(jobData.preferredQualifications?.length > 0 ? jobData.preferredQualifications : ['']);

          setBenefits(jobData.benefits?.length > 0 ? jobData.benefits : ['']);
          setTags(jobData.tags?.length > 0 ? jobData.tags : ['']);

          setVisaSponsorship(jobData.visaSponsorship ?? true);
          setKoreanLevel(jobData.languageRequirements?.korean || 'INTERMEDIATE');
          setEnglishLevel(jobData.languageRequirements?.english || 'FLUENT');

          setDeadline(jobData.deadline || '');

          setProbation(jobData.workConditions?.probation || '3개월');
          setWorkHours(jobData.workConditions?.workHours || '');
          setStartDate(jobData.workConditions?.startDate || '즉시 가능');

          setManagerName(jobData.manager?.name || '');
          setManagerPosition(jobData.manager?.position || '');
          setManagerEmail(jobData.manager?.email || '');
          setManagerPhone(jobData.manager?.phone || '');
        } else {
          setError('채용공고를 찾을 수 없습니다');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [jobId, router]);

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    // 필수 항목 검증
    if (!title.trim()) errors.push('포지션명 (한글)을 입력해주세요');
    if (!titleEn.trim()) errors.push('포지션명 (영문)을 입력해주세요');
    if (!department.trim()) errors.push('부서/팀을 입력해주세요');
    if (!location.trim()) errors.push('근무지를 입력해주세요');

    // 급여 검증
    if (!salaryMin || parseInt(salaryMin) <= 0) {
      errors.push('최소 연봉을 입력해주세요');
    }
    if (!salaryMax || parseInt(salaryMax) <= 0) {
      errors.push('최대 연봉을 입력해주세요');
    }
    if (salaryMin && salaryMax && parseInt(salaryMin) > parseInt(salaryMax)) {
      errors.push('최소 연봉은 최대 연봉보다 작아야 합니다');
    }

    // 상세 정보 검증
    if (!description.trim()) errors.push('포지션 설명을 입력해주세요');

    const validMainTasks = mainTasks.filter(t => t.trim());
    if (validMainTasks.length === 0) errors.push('최소 1개 이상의 주요 업무를 입력해주세요');

    const validRequirements = requirements.filter(r => r.trim());
    if (validRequirements.length === 0) errors.push('최소 1개 이상의 자격 요건을 입력해주세요');

    // 마감일 검증
    if (!deadline) errors.push('마감일을 선택해주세요');
    else {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        errors.push('마감일은 오늘 이후여야 합니다');
      }
    }

    return errors;
  };

  const isFormValid = (): boolean => {
    return validateForm().length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationModal(true);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('로그인이 필요합니다');
      }

      if (!companyData) {
        throw new Error('기업 정보를 불러올 수 없습니다');
      }

      const jobData = {
        companyId: user.uid,
        company: {
          id: companyData.id,
          name: companyData.name,
          nameEn: companyData.nameEn,
          logo: companyData.logo || '',
          industry: companyData.industry,
          location: companyData.location,
          employeeCount: companyData.employeeCount,
        },
        title,
        titleEn,
        department,
        location,
        employmentType,
        experienceLevel,
        salary: {
          min: parseInt(salaryMin),
          max: parseInt(salaryMax),
          currency: 'KRW',
          negotiable: salaryNegotiable
        },
        description,
        mainTasks: mainTasks.filter(t => t.trim()),
        requirements: requirements.filter(r => r.trim()),
        preferredQualifications: preferredQualifications.filter(q => q.trim()),
        benefits: benefits.filter(b => b.trim()),
        tags: tags.filter(t => t.trim()),
        visaSponsorship,
        languageRequirements: {
          korean: koreanLevel,
          english: englishLevel
        },
        deadline,
        workConditions: {
          type: employmentType === 'FULL_TIME' ? '정규직' :
                employmentType === 'PART_TIME' ? '계약직' :
                employmentType === 'CONTRACT' ? '파트타임' : '인턴',
          probation,
          location,
          workHours: workHours || '자율 출퇴근제',
          salary: `₩${parseInt(salaryMin).toLocaleString()}만 - ${parseInt(salaryMax).toLocaleString()}만`,
          startDate
        },
        manager: {
          name: managerName || companyData.recruiters?.[0]?.name || '',
          position: managerPosition || companyData.recruiters?.[0]?.position || '',
          email: managerEmail || companyData.recruiters?.[0]?.email || companyData.email,
          phone: managerPhone || companyData.recruiters?.[0]?.phone || companyData.phone
        },
        views: 0,
        applicants: 0,
        status: 'active',
        postedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'jobs', jobId), jobData);
      console.log('Job updated:', jobId);

      // 성공 후 채용 관리 페이지로 이동
      router.push('/company-dashboard?tab=jobs');
    } catch (err: any) {
      console.error('Error creating job:', err);
      setError(err.message || '채용공고 등록에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        errors={validationErrors}
        title="필수 입력 항목을 확인해주세요"
        type="error"
      />

      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/company-dashboard?tab=jobs" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">채용 관리로 돌아가기</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">채용공고 수정</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">기본 정보</h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    포지션명 (한글) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 프론트엔드 개발자"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    포지션명 (영문) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: Frontend Developer"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    부서/팀 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: Engineering"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    근무지 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 서울 강남구"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">고용 형태</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="FULL_TIME">정규직</option>
                    <option value="PART_TIME">계약직</option>
                    <option value="CONTRACT">파트타임</option>
                    <option value="INTERNSHIP">인턴</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">경력 수준</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="ENTRY">신입</option>
                    <option value="JUNIOR">주니어 (1-3년)</option>
                    <option value="MID">미드레벨 (4-7년)</option>
                    <option value="SENIOR">시니어 (8년+)</option>
                    <option value="EXECUTIVE">임원급</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  마감일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 급여 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">급여 정보</h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최소 연봉 (만원) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 6000"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 연봉 (만원) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 9000"
                    min="0"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={salaryNegotiable}
                  onChange={(e) => setSalaryNegotiable(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-700">협의 가능</span>
              </label>
            </div>
          </div>

          {/* 상세 설명 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">포지션 상세</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  포지션 설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="이 포지션에 대한 전반적인 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주요 업무 <span className="text-red-500">*</span>
                </label>
                {mainTasks.map((task, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => updateItem(setMainTasks, index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="주요 업무 내용"
                    />
                    {mainTasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(setMainTasks, index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(setMainTasks)}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  업무 추가
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자격 요건 <span className="text-red-500">*</span>
                </label>
                {requirements.map((req, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateItem(setRequirements, index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="필수 자격 요건"
                    />
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(setRequirements, index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(setRequirements)}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  요건 추가
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">우대 사항</label>
                {preferredQualifications.map((qual, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={qual}
                      onChange={(e) => updateItem(setPreferredQualifications, index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="우대 사항"
                    />
                    {preferredQualifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(setPreferredQualifications, index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(setPreferredQualifications)}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  우대사항 추가
                </button>
              </div>
            </div>
          </div>

          {/* 복지 및 태그 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">복지 및 혜택</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">복지 항목</label>
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateItem(setBenefits, index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="예: 4대보험, 퇴직금"
                    />
                    {benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(setBenefits, index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(setBenefits)}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  복지 추가
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">태그 (기술스택, 키워드)</label>
                {tags.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateItem(setTags, index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="예: React, TypeScript"
                    />
                    {tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(setTags, index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(setTags)}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  태그 추가
                </button>
              </div>
            </div>
          </div>

          {/* 비자 및 언어 요구사항 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">비자 및 언어 요구사항</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visaSponsorship}
                  onChange={(e) => setVisaSponsorship(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">비자 스폰서십 가능</span>
              </label>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">한국어 수준</label>
                  <select
                    value={koreanLevel}
                    onChange={(e) => setKoreanLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="NONE">불필요</option>
                    <option value="BASIC">기초</option>
                    <option value="INTERMEDIATE">중급</option>
                    <option value="FLUENT">유창</option>
                    <option value="NATIVE">원어민</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">영어 수준</label>
                  <select
                    value={englishLevel}
                    onChange={(e) => setEnglishLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="NONE">불필요</option>
                    <option value="BASIC">기초</option>
                    <option value="INTERMEDIATE">중급</option>
                    <option value="FLUENT">유창</option>
                    <option value="NATIVE">원어민</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 근무 조건 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">근무 조건</h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">수습 기간</label>
                  <input
                    type="text"
                    value={probation}
                    onChange={(e) => setProbation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 3개월"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">입사 예정일</label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 즉시 가능"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">근무 시간</label>
                <input
                  type="text"
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: 자율 출퇴근제 (코어타임 10:00-16:00)"
                />
              </div>
            </div>
          </div>

          {/* 채용 담당자 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">채용 담당자 정보</h2>
            <p className="text-sm text-gray-500 mb-4">입력하지 않으면 기업 정보의 담당자 정보가 사용됩니다</p>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">담당자 이름</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 김철수"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">직책</label>
                  <input
                    type="text"
                    value={managerPosition}
                    onChange={(e) => setManagerPosition(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 개발팀 리드"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <input
                    type="email"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: recruit@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                  <input
                    type="tel"
                    value={managerPhone}
                    onChange={(e) => setManagerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 02-1234-5678"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-4">
            <Link
              href="/company-dashboard?tab=jobs"
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors
                ${isFormValid()
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  수정사항 저장
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}