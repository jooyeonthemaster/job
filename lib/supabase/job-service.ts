// 채용공고 Supabase 서비스 레이어

import { supabase } from './config';
import { JobFormData, JobSubmitData } from '@/types/job-form.types';
import { JobContentBlock, EditorBlock } from '@/types/job-content.types';
import { POSTING_PRICES, VAT_RATE, BILLING_CONTACT } from '@/constants/job-posting';

// ==========================================
// 채용공고 생성 (임시저장 또는 등록)
// ==========================================
export async function createJob(
  formData: JobFormData,
  companyId: string,
  editorContent: string,
  isDraft: boolean = false // true: 임시저장(draft), false: 등록(pending_approval)
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    // 1. 회사 정보 조회
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      throw new Error('기업 정보를 불러올 수 없습니다.');
    }

    // 2. 과금 정보 계산
    const selectedPrice = POSTING_PRICES[formData.postingTier];
    const vatAmount = selectedPrice.vatIncluded
      ? 0
      : Math.floor(selectedPrice.price * VAT_RATE);
    const totalAmount = selectedPrice.vatIncluded
      ? selectedPrice.price
      : selectedPrice.price + vatAmount;

    // 3. 임시저장 시 빈 값 처리 (null로 변환)
    const salaryMin = formData.salaryMin ? parseInt(formData.salaryMin) : null;
    const salaryMax = formData.salaryMax ? parseInt(formData.salaryMax) : null;
    const deadline = formData.deadline || null;

    // 4. jobs 테이블에 메타데이터 저장
    const { data: job, error: jobError } = await supabase
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

        // 급여 (빈 값이면 null)
        salary_min: salaryMin,
        salary_max: salaryMax,
        salary_currency: 'KRW',
        salary_negotiable: formData.salaryNegotiable,

        // 상세 정보 (에디터 HTML 저장)
        description: editorContent || '',

        // ✨ 신규: JD, 경력 사항, 스킬
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

        // 결제 정보
        payment_status: 'pending',
        payment_requested_at: new Date().toISOString(),
        payment_billing_contact_name: BILLING_CONTACT.name,
        payment_billing_contact_phone: BILLING_CONTACT.phone,

        // 메타 정보 (deadline 빈 값이면 null)
        deadline: deadline,
        status: isDraft ? 'draft' : 'pending_approval', // 임시저장 or 승인대기
        posted_at: new Date().toISOString(),
        views: 0,
        applicants: 0,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Job creation error:', jobError);
      throw new Error(jobError?.message || '채용공고 등록에 실패했습니다.');
    }

    // 4. 근무 조건 저장
    if (formData.probation || formData.workHours || formData.startDate) {
      const { error: workError } = await supabase
        .from('job_work_conditions')
        .insert({
          job_id: job.id,
          probation: formData.probation,
          work_hours: formData.workHours,
          start_date: formData.startDate,
        });

      if (workError) {
        console.error('Work conditions error:', workError);
      }
    }

    // 5. 채용 담당자 저장 (name과 email이 NOT NULL이므로 기본값 제공)
    const managerName = formData.managerName?.trim() || company.manager_name || company.name || '담당자';
    const managerEmail = formData.managerEmail?.trim() || company.email || 'contact@company.com';

    const { error: managerError } = await supabase
      .from('job_manager')
      .insert({
        job_id: job.id,
        name: managerName,
        position: formData.managerPosition || '',
        email: managerEmail,
        phone: formData.managerPhone || company.manager_phone || '',
      });

    if (managerError) {
      console.error('Manager error:', managerError);
      // 에러가 나도 공고는 저장되었으므로 계속 진행
    }

    return { success: true, jobId: job.id };
  } catch (err: any) {
    console.error('Create job error:', err);
    return { success: false, error: err.message || '채용공고 등록에 실패했습니다.' };
  }
}

// ==========================================
// 채용공고 조회
// ==========================================
export async function getJob(jobId: string) {
  try {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        job_work_conditions(*),
        job_manager(*),
        companies(*)
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error('채용공고를 찾을 수 없습니다.');
    }

    return { success: true, job };
  } catch (err: any) {
    console.error('Get job error:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 회사별 채용공고 목록 조회
// ==========================================
export async function getCompanyJobs(companyId: string) {
  try {
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        *,
        job_work_conditions(*),
        job_manager(*)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (jobsError) {
      throw new Error(jobsError.message);
    }

    return { success: true, jobs: jobs || [] };
  } catch (err: any) {
    console.error('Get company jobs error:', err);
    return { success: false, error: err.message, jobs: [] };
  }
}

// ==========================================
// 채용공고 업데이트
// ==========================================
export async function updateJob(
  jobId: string,
  formData: Partial<JobFormData>,
  editorContent?: string
) {
  try {
    const updates: any = {};

    // 기본 정보
    if (formData.title) updates.title = formData.title;
    if (formData.titleEn) updates.title_en = formData.titleEn;
    if (formData.department) updates.department = formData.department;
    if (formData.location) updates.location = formData.location;
    if (formData.employmentType) updates.employment_type = formData.employmentType;
    if (formData.experienceLevel) updates.experience_level = formData.experienceLevel;
    
    // 급여 (빈 값 처리)
    if (formData.salaryMin) {
      updates.salary_min = parseInt(formData.salaryMin);
    }
    if (formData.salaryMax) {
      updates.salary_max = parseInt(formData.salaryMax);
    }
    if (formData.salaryNegotiable !== undefined) {
      updates.salary_negotiable = formData.salaryNegotiable;
    }
    
    // 상세 정보
    if (editorContent !== undefined) updates.description = editorContent;

    // ✨ 신규: JD, 경력 사항, 스킬
    if (formData.jobDescription !== undefined) {
      updates.job_description = formData.jobDescription || null;
    }
    if (formData.requiredExperience !== undefined) {
      updates.required_experience = formData.requiredExperience || null;
    }
    if (formData.requiredSkills !== undefined) {
      updates.required_skills = formData.requiredSkills && formData.requiredSkills.length > 0
        ? formData.requiredSkills.filter(s => s.trim())
        : null;
    }

    // 언어/비자
    if (formData.visaSponsorship !== undefined) {
      updates.visa_sponsorship = formData.visaSponsorship;
    }
    if (formData.koreanLevel) updates.korean_level = formData.koreanLevel;
    if (formData.englishLevel) updates.english_level = formData.englishLevel;
    
    // 마감일 (빈 값 처리)
    if (formData.deadline) {
      updates.deadline = formData.deadline;
    }

    updates.updated_at = new Date().toISOString();

    // jobs 테이블 업데이트
    const { error: jobError } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId);

    if (jobError) {
      throw new Error(jobError.message);
    }

    // 근무 조건 업데이트
    if (formData.probation !== undefined || formData.workHours !== undefined || formData.startDate !== undefined) {
      const { error: wcError } = await supabase
        .from('job_work_conditions')
        .upsert({
          job_id: jobId,
          probation: formData.probation || null,
          work_hours: formData.workHours || null,
          start_date: formData.startDate || null,
        }, {
          onConflict: 'job_id'
        });

      if (wcError) {
        console.error('Work conditions update error:', wcError);
      }
    }

    // 담당자 정보 업데이트
    // Note: 채용 공고별로 독립적인 담당자 정보 관리
    // 사용자가 입력한 값이 있으면 업데이트, 없으면 기존 값 유지
    if (formData.managerName !== undefined || formData.managerEmail !== undefined) {
      // 최소한 하나의 필드라도 업데이트 시도
      const { data: existingManager } = await supabase
        .from('job_manager')
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (existingManager) {
        // 기존 manager 있으면 업데이트
        const { error: mgrError } = await supabase
          .from('job_manager')
          .update({
            name: formData.managerName?.trim() || existingManager.name,
            position: formData.managerPosition !== undefined ? formData.managerPosition : existingManager.position,
            email: formData.managerEmail?.trim() || existingManager.email,
            phone: formData.managerPhone !== undefined ? formData.managerPhone : existingManager.phone,
          })
          .eq('job_id', jobId);

        if (mgrError) {
          console.error('Manager update error:', mgrError);
          // 에러 발생해도 공고 업데이트는 성공으로 처리
        }
      } else if (formData.managerName?.trim() && formData.managerEmail?.trim()) {
        // manager가 없고, name과 email이 모두 있으면 생성
        const { error: mgrError } = await supabase
          .from('job_manager')
          .insert({
            job_id: jobId,
            name: formData.managerName.trim(),
            position: formData.managerPosition || '',
            email: formData.managerEmail.trim(),
            phone: formData.managerPhone || '',
          });

        if (mgrError) {
          console.error('Manager insert error:', mgrError);
          // 에러 발생해도 공고 업데이트는 성공으로 처리
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Update job error:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 채용공고 삭제
// ==========================================
export async function deleteJob(jobId: string) {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Delete job error:', err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 채용공고 상태 변경
// ==========================================
export async function updateJobStatus(
  jobId: string,
  status: 'draft' | 'pending_approval' | 'active' | 'rejected' | 'expired' | 'closed'
) {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Update job status error:', err);
    return { success: false, error: err.message };
  }
}
