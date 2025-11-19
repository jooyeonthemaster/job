// 기업의 지원자 관리 API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: 기업의 모든 지원자 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');

    if (!companyId) {
      return NextResponse.json(
        { error: '기업 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner (
          id,
          title,
          location,
          employment_type,
          deadline
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    // 상태 필터
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 공고별 필터
    if (jobId && jobId !== 'all') {
      query = query.eq('job_id', jobId);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('지원자 조회 오류:', error);
      return NextResponse.json(
        { error: '지원자 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: applications }, { status: 200 });

  } catch (error: any) {
    console.error('지원자 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 지원 상태 변경
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from('job_applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('상태 변경 오류:', error);
      return NextResponse.json(
        { error: '상태 변경에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '상태가 변경되었습니다.',
        data
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('상태 변경 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
