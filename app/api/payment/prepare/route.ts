// 포트원 결제 준비 API

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: '채용공고 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 채용공고 정보 조회
    const { data: job, error: jobError } = await supabase
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

    // 2. 결제 정보 확인
    if (job.payment_status === 'paid') {
      return NextResponse.json(
        { error: '이미 결제가 완료된 공고입니다.' },
        { status: 400 }
      );
    }

    // 3. paymentId 생성 (이니시스 제한: 최대 40자)
    // UUID 앞 8자 + timestamp로 고유성 보장 (약 25자)
    const paymentId = `jb_${jobId.substring(0, 8)}_${Date.now()}`;

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
