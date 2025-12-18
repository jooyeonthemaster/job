// 포트원 결제 준비 API

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: '채용공고 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          manager_name,
          manager_phone,
          email
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

    if (job.company_id !== user.id) {
      return NextResponse.json(
        { error: '해당 채용공고에 대한 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 2. 결제 정보 확인
    if (job.payment_status === 'paid' || job.payment_status === 'confirmed') {
      return NextResponse.json(
        { error: '이미 결제가 완료된 공고입니다.' },
        { status: 400 }
      );
    }

    // 3. paymentId 생성 (KPN 제한: 최대 32바이트, 영문+숫자만)
    // jobId 앞 16자 + timestamp 뒤 10자 = 28자 (여유 있게)
    const compactJobId = jobId.replace(/-/g, '').substring(0, 16);
    const timestamp = Date.now().toString().slice(-10);
    const paymentId = `jb${compactJobId}${timestamp}`; // 총 28자

    // 4. 결제 정보 반환
    const paymentInfo = {
      paymentId,
      orderName: `${job.title} 채용공고`,
      totalAmount: job.posting_total_amount, // VAT 포함 금액
      taxFreeAmount: 0, // 면세 금액 (없음)
      vatAmount: job.posting_vat_amount, // 부가세
      currency: 'KRW',
      customer: {
        fullName: job.companies?.manager_name || job.companies?.name || '담당자',
        phoneNumber: job.companies?.manager_phone || '010-0000-0000', // 이니시스는 필수
        email: job.companies?.email || 'noreply@jobmatch.com'
      },
      customData: {
        jobId: job.id,
        companyId: job.company_id,
        postingTier: job.posting_tier,
        postingPrice: job.posting_price
      }
    };

    return NextResponse.json(paymentInfo);
  } catch (error: any) {
    console.error('Payment prepare error:', error);
    return NextResponse.json(
      { error: error.message || '결제 준비 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
