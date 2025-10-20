import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: '기업 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 기업 정보 업데이트: profile_completed = true, status = 'active'
    const { data, error } = await supabase
      .from('companies')
      .update({
        profile_completed: true,
        status: 'active'
      })
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      console.error('[API] 기업 공개 실패:', error);
      return NextResponse.json(
        { error: '기업 공개에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log('[API] 기업 공개 성공:', data.id);

    return NextResponse.json({
      success: true,
      company: data
    });
  } catch (error: any) {
    console.error('[API] 기업 공개 에러:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
