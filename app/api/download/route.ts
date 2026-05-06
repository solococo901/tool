import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new Response("Missing URL", { status: 400 });

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Response(blob, {
      headers: {
        'Content-Disposition': `attachment; filename="video-${Date.now()}.mp4"`,
        'Content-Type': 'video/mp4',
      },
    });
  } catch (e) {
    return new Response("Lỗi khi tải file", { status: 500 });
  }
}