import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/config';
import { POSTING_PRICES, VAT_RATE, BILLING_CONTACT } from '@/constants/job-posting';
import { PostingTier } from '@/types/job-form.types';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { postingTier } = await request.json();

    if (!postingTier || !POSTING_PRICES[postingTier as PostingTier]) {
      return NextResponse.json(
        { error: '유효한 노출 등급을 선택해주세요.' },
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

    const tier = POSTING_PRICES[postingTier as PostingTier];
    const vatAmount = tier.vatIncluded ? 0 : Math.floor(tier.price * VAT_RATE);
    const totalAmount = tier.vatIncluded ? tier.price : tier.price + vatAmount;

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert({
        company_id: user.id,
        title: '(결제 완료 후 작성)',
        title_en: '(Pending Title)',
        department: '작성 예정',
        location: '작성 예정',
        employment_type: 'FULL_TIME',
        experience_level: 'MID',
        salary_min: null,
        salary_max: null,
        salary_currency: 'KRW',
        salary_negotiable: true,
        description: '',
        job_description: null,
        required_experience: null,
        required_skills: null,
        visa_sponsorship: true,
        korean_level: 'INTERMEDIATE',
        english_level: 'INTERMEDIATE',
        posting_tier: postingTier as PostingTier,
        posting_price: tier.price,
        posting_duration: tier.duration,
        posting_vat_amount: vatAmount,
        posting_total_amount: totalAmount,
        payment_status: 'pending',
        payment_requested_at: new Date().toISOString(),
        payment_billing_contact_name: BILLING_CONTACT.name,
        payment_billing_contact_phone: BILLING_CONTACT.phone,
        status: 'draft',
        posted_at: new Date().toISOString(),
        views: 0,
        applicants: 0,
      })
      .select('id, posting_tier, posting_price, posting_vat_amount, posting_total_amount')
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: jobError?.message || '공고 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobId: job.id,
      postingTier: job.posting_tier,
      postingPrice: job.posting_price,
      vatAmount: job.posting_vat_amount,
      totalAmount: job.posting_total_amount,
    });
  } catch (error: any) {
    console.error('Job initiate error:', error);
    return NextResponse.json(
      { error: error.message || '공고 초기화 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


