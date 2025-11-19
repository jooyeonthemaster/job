import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: talentId } = await params;

    // 1. 인재 정보에서 이력서 URL 가져오기
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('resume_file_url')
      .eq('id', talentId)
      .single();

    if (userError || !userData?.resume_file_url) {
      return NextResponse.json(
        { error: '이력서를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. Cloudinary에서 파일 가져오기
    const response = await fetch(userData.resume_file_url);

    if (!response.ok) {
      console.error('[Resume Preview] Cloudinary fetch failed:', response.status);
      return NextResponse.json(
        { error: '이력서 미리보기에 실패했습니다.' },
        { status: response.status }
      );
    }

    // 3. 파일 스트리밍 (inline으로 표시)
    const fileBuffer = await response.arrayBuffer();

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline', // 브라우저에서 바로 열기
        'Cache-Control': 'public, max-age=3600', // 1시간 캐시
      },
    });
  } catch (error: any) {
    console.error('[Resume Preview] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
