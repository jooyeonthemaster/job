import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Admin SDK 설정
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const publicId = searchParams.get('publicId');

  console.log('📄 PDF Proxy Request for publicId:', publicId);

  if (!publicId) {
    return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
  }

  try {
    console.log('🔐 Using Cloudinary Admin API to fetch PDF...');
    
    // Cloudinary Admin API로 인증된 다운로드 URL 생성
    const downloadUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      secure: true,
      sign_url: true, // 서명된 URL 생성
      attachment: false, // inline으로 표시
    });

    console.log('📥 Downloading from:', downloadUrl);

    // 서명된 URL로 PDF 다운로드
    const response = await fetch(downloadUrl, {
      method: 'GET',
    });

    console.log('📊 Download Response Status:', response.status);

    if (!response.ok) {
      console.error('❌ Download Error:', response.status, response.statusText);
      throw new Error(`Failed to download PDF: ${response.status}`);
    }

    const pdfBuffer = await response.arrayBuffer();
    console.log('✅ PDF downloaded successfully, size:', pdfBuffer.byteLength, 'bytes');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('💥 PDF proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PDF', details: error.message },
      { status: 500 }
    );
  }
}
