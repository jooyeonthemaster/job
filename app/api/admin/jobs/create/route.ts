// 관리자 전용 채용공고 생성 API
// 모든 회사의 공고를 생성할 수 있음

import { NextRequest, NextResponse } from 'next/server';
import { supabase, createAdminClient } from '@/lib/supabase/config';
import { JobFormData } from '@/types/job-form.types';
import { POSTING_PRICES, VAT_RATE, BILLING_CONTACT } from '@/constants/job-posting';

export const dynamic = 'force-dynamic';

interface AdminJobCreateRequest {
  companyId: string;        // 어떤 회사의 공고인지
  formData: JobFormData;
  editorContent: string;
  isDraft: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // 1. 요청 데이터 파싱
    const body: AdminJobCreateRequest = await request.json();
    const { companyId, formData, editorContent, isDraft } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: '회사 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 2. 관리자 권한 확인
    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // JWT 디코딩 (검증 없이 이메일 추출)
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    const userEmail = payload.email;

    console.log('🔍 [TOKEN] JWT 디코딩 성공');
    console.log('🔍 [TOKEN] 이메일:', userEmail);
    console.log('🔍 [TOKEN] Payload:', payload);

    if (!userEmail) {
      console.error('🔴 [AUTH ERROR] 토큰에 이메일 없음');
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 이메일 기반 관리자 체크 (admin 페이지와 동일)
    const adminEmails = [
      'admin@ssmhr.com',
      'yjpark@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com',
      'admin@gmail.com'
    ];

    if (!adminEmails.includes(userEmail || '')) {
      console.error('🔴 [AUTH ERROR] 관리자 권한 없음');
      console.error('🔴 [AUTH ERROR] 시도한 이메일:', userEmail);
      console.error('🔴 [AUTH ERROR] 허용된 이메일:', adminEmails);
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    console.log('✅ [AUTH SUCCESS] 관리자 인증 성공:', userEmail);

    // 3. 회사 정보 조회
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: '회사 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const selectedPrice = POSTING_PRICES[formData.postingTier];
    const vatAmount = selectedPrice.vatIncluded
      ? 0
      : Math.floor(selectedPrice.price * VAT_RATE);
    const totalAmount = selectedPrice.vatIncluded
      ? selectedPrice.price
      : selectedPrice.price + vatAmount;

    // 5. 급여 및 마감일 처리
    const salaryMin = formData.salaryMin ? parseInt(formData.salaryMin) : null;
    const salaryMax = formData.salaryMax ? parseInt(formData.salaryMax) : null;
    const deadline = formData.deadline || null;

    // 6. 공고 생성 (서비스 롤 사용 - RLS 우회)
    const adminClient = createAdminClient();
    const { data: job, error: jobError } = await adminClient
      .from('jobs')
      .insert({
        company_id: companyId,

        // 기본 정보
        title: formData.title || '(제목 없음)',
        title_en: formData.titleEn || '(No title)',
        department: formData.department || '미정',
        location: formData.location || '미정',
        employment_type: formData.employmentType,
        experience_level: formData.experienceLevel,

        // 급여
        salary_min: salaryMin,
        salary_max: salaryMax,
        salary_currency: 'KRW',
        salary_negotiable: formData.salaryNegotiable,

        // 상세 정보 (에디터 HTML 저장)
        description: editorContent || '',

        // JD, 경력, 스킬
        job_description: formData.jobDescription || null,
        required_experience: formData.requiredExperience || null,
        required_skills: formData.requiredSkills && formData.requiredSkills.length > 0
          ? formData.requiredSkills.filter(s => s.trim())
          : null,

        // 언어/비자
        visa_sponsorship: formData.visaSponsorship,
        korean_level: formData.koreanLevel,
        english_level: formData.englishLevel,

        // 과금 정보
        posting_tier: formData.postingTier,
        posting_price: selectedPrice.price,
        posting_duration: selectedPrice.duration,
        posting_vat_amount: vatAmount,
        posting_total_amount: totalAmount,

        // 결제 정보 (관리자 공고는 결제 완료 상태로 시작)
        payment_status: 'paid',  // 관리자 공고는 즉시 결제 완료
        payment_requested_at: new Date().toISOString(),
        payment_billing_contact_name: '관리자',
        payment_billing_contact_phone: BILLING_CONTACT.phone,

        // 메타 정보
        deadline: deadline,
        status: isDraft ? 'draft' : 'active',  // 관리자 공고는 즉시 활성화 (승인 필요 없음)
        posted_at: new Date().toISOString(),
        views: 0,
        applicants: 0,
      })
      .select()
      .single();

    if (jobError) {
      console.error('Job creation error:', jobError);
      return NextResponse.json(
        { error: '공고 생성에 실패했습니다: ' + jobError.message },
        { status: 500 }
      );
    }

    // 7. 근무 조건 저장 (별도 테이블)
    if (formData.probation || formData.workHours || formData.startDate) {
      const { error: workCondError } = await adminClient
        .from('job_work_conditions')
        .insert({
          job_id: job.id,
          probation: formData.probation || '3개월',
          work_hours: formData.workHours || '',
          start_date: formData.startDate || '즉시 가능'
        });

      if (workCondError) {
        console.error('Work conditions error:', workCondError);
      }
    }

    // 8. 담당자 정보 저장 (별도 테이블)
    if (formData.managerName || formData.managerEmail || formData.managerPhone) {
      const { error: managerError } = await adminClient
        .from('job_manager')
        .insert({
          job_id: job.id,
          name: formData.managerName || '',
          position: formData.managerPosition || '',
          email: formData.managerEmail || '',
          phone: formData.managerPhone || ''
        });

      if (managerError) {
        console.error('Manager info error:', managerError);
      }
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: isDraft ? '임시저장되었습니다.' : '공고가 등록되었습니다.'
    });

  } catch (error: any) {
    console.error('Admin job create error:', error);
    return NextResponse.json(
      { error: error.message || '공고 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
