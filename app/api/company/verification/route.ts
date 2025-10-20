import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyId = formData.get('company_id') as string;

    if (!file || !companyId) {
      return NextResponse.json(
        { error: '파일과 기업 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 2MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'JPG, PNG, PDF, TIFF 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // Cloudinary 업로드
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
    cloudinaryFormData.append('folder', `company_verifications/${companyId}`);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary 설정이 올바르지 않습니다.');
    }

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json();
      console.error('Cloudinary error details:', errorData);
      throw new Error(errorData.error?.message || 'Cloudinary 업로드 실패');
    }

    const cloudinaryData = await cloudinaryResponse.json();

    // Supabase에 인증 정보 저장
    const { data: existingVerification } = await supabase
      .from('company_verifications')
      .select('*')
      .eq('company_id', companyId)
      .single();

    const verificationData = {
      company_id: companyId,
      status: 'pending',
      document_url: cloudinaryData.secure_url,
      document_name: file.name,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existingVerification) {
      // 기존 레코드 업데이트
      result = await supabase
        .from('company_verifications')
        .update(verificationData)
        .eq('company_id', companyId)
        .select()
        .single();
    } else {
      // 새 레코드 생성
      result = await supabase
        .from('company_verifications')
        .insert(verificationData)
        .select()
        .single();
    }

    if (result.error) {
      throw new Error(result.error.message);
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error('Verification upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: '기업 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('company_verifications')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      data: data || null,
    });

  } catch (error) {
    console.error('Get verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '인증 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
