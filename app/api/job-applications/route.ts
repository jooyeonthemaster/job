// 채용공고 지원 API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

// POST: 채용공고 지원
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, applicantId, message } = body;

    // 필수 필드 검증
    if (!jobId || !applicantId || !message) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 1. 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', applicantId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. 구직자 계정 확인
    if (user.role !== 'jobseeker') {
      return NextResponse.json(
        { error: '구직자만 지원할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 3. 채용공고 정보 조회
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        company_id,
        companies!inner (
          id,
          name
        )
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: '채용공고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 4. 중복 지원 확인
    const { data: existingApplication, error: checkError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('applicant_id', applicantId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('중복 확인 오류:', checkError);
      return NextResponse.json(
        { error: '지원서 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (existingApplication) {
      return NextResponse.json(
        { error: '이미 지원한 채용공고입니다.' },
        { status: 409 }
      );
    }

    // 5. 지원서 저장
    const { data: application, error: insertError } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        job_title: job.title,
        company_id: job.company_id,
        company_name: ((job.companies as unknown) as { id: string; name: string }).name,
        applicant_id: applicantId,
        applicant_name: user.full_name || '이름 없음',
        applicant_email: user.email,
        message: message,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('지원서 저장 오류:', insertError);
      return NextResponse.json(
        { error: '지원서 제출에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 6. jobs 테이블 applicants 수 증가
    const { error: updateError } = await supabase.rpc('increment_job_applicants', {
      job_id: jobId
    });

    // RPC 함수가 없을 경우 직접 업데이트
    if (updateError) {
      console.warn('RPC 함수 없음. 직접 업데이트:', updateError.message);

      // 현재 applicants 값 조회
      const { data: jobData } = await supabase
        .from('jobs')
        .select('applicants')
        .eq('id', jobId)
        .single();

      // +1 업데이트
      const { error: directUpdateError } = await supabase
        .from('jobs')
        .update({ applicants: (jobData?.applicants || 0) + 1 })
        .eq('id', jobId);

      if (directUpdateError) {
        console.error('applicants 업데이트 실패:', directUpdateError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: '지원서가 성공적으로 제출되었습니다.',
        data: application
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('지원서 제출 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET: 지원 현황 조회 (구직자용)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const applicantId = searchParams.get('applicantId');

    if (!applicantId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const { data: applications, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner (
          id,
          title,
          location,
          employment_type,
          deadline
        ),
        companies!inner (
          id,
          name,
          logo
        )
      `)
      .eq('applicant_id', applicantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('지원 현황 조회 오류:', error);
      return NextResponse.json(
        { error: '지원 현황 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: applications }, { status: 200 });

  } catch (error: any) {
    console.error('지원 현황 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}