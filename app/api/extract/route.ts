import { NextResponse } from 'next/server';
// @ts-ignore
import { getFbVideoInfo } from 'fb-downloader-scrapper';
import ytdl from '@distube/ytdl-core';

export async function POST(req: Request) {
    try {
        const { url, platform } = await req.json();
        const RAPID_KEY = "51cd54615fmsh71ff838b853cd75p148e2djsn166130d6ad78";



      // XỬ LÝ YOUTUBE (Cập nhật theo đúng snippet fetch từ RapidAPI)
if (platform === 'YOUTUBE') {
  try {
    // 1. Tách Video ID chính xác
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length == 11) ? match[7] : url.split('shorts/')[1]?.split('?')[0];

    if (!videoId) {
      return NextResponse.json({ error: "Không tìm thấy Video ID hợp lệ" }, { status: 400 });
    }

    // 2. Cấu hình URL theo đúng snippet của bạn
    const apiUrl = `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}&urlAccess=normal&videos=auto&audios=auto`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '51cd54615fmsh71ff838b853cd75p148e2djsn166130d6ad78',
        'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    // 3. Trích xuất dữ liệu từ mảng videos.items
    if (result.errorId === "Success" && result.videos && result.videos.items) {
      const videoItems = result.videos.items;
      
      // Lấy video 1080p hoặc chất lượng cao nhất có âm thanh
      const hdVideo = videoItems.find((v: any) => v.quality === "1080p" && v.hasAudio) || 
                      videoItems.find((v: any) => v.hasAudio) || 
                      videoItems[0];

      return NextResponse.json({
        type: 'youtube',
        title: result.title,
        thumbnail: result.thumbnails[result.thumbnails.length - 1].url,
        hd: hdVideo.url,
        metadata: {
          size: hdVideo.sizeText,
          quality: hdVideo.quality,
          views: result.viewCount?.toLocaleString(),
          duration: result.lengthSeconds
        }
      });
    } else {
      throw new Error("API không trả về dữ liệu video hợp lệ.");
    }

  } catch (err: any) {
    return NextResponse.json({ error: "Lỗi YouTube: " + err.message }, { status: 500 });
  }
}

        // XỬ LÝ TIKTOK (Sử dụng TikWM API như bước trước)
        if (platform === 'TIKTOK') {
            const res = await fetch(`https://www.tikwm.com/api/?url=${url}`);
            const tiktokData = await res.json();
            return NextResponse.json({
                type: 'tiktok',
                hd: tiktokData.data.play,
                thumbnail: tiktokData.data.cover
            });
        }

        // XỬ LÝ FACEBOOK
        if (platform === 'FACEBOOK') {
            const fbData = await getFbVideoInfo(url);
            return NextResponse.json({
                type: 'facebook',
                hd: fbData.hd,
                sd: fbData.sd
            });
        }

        // XỬ LÝ INSTAGRAM (Cập nhật theo cấu trúc JSON thực tế)
        if (platform === 'INSTAGRAM') {
            try {
                const response = await fetch(`https://instagram-reels-downloader-api.p.rapidapi.com/download?url=${encodeURIComponent(url)}`, {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': '51cd54615fmsh71ff838b853cd75p148e2djsn166130d6ad78',
                        'x-rapidapi-host': 'instagram-reels-downloader-api.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                // Kiểm tra cấu trúc: data -> medias -> [0] -> url
                if (result.success && result.data && result.data.medias && result.data.medias.length > 0) {
                    const videoData = result.data.medias[0];

                    return NextResponse.json({
                        type: 'instagram',
                        hd: videoData.url, // Đây là link mp4 bạn cần
                        title: result.data.title || "Instagram Reel",
                        thumbnail: result.data.thumbnail,
                        metadata: {
                            views: result.data.view_count,
                            likes: result.data.like_count,
                            duration: result.data.duration
                        }
                    });
                } else {
                    throw new Error("Cấu trúc dữ liệu API thay đổi hoặc không có media.");
                }
            } catch (err: any) {
                return NextResponse.json({ error: "Instagram Error: " + err.message }, { status: 500 });
            }
        }

        return NextResponse.json({ error: "Nền tảng chưa được hỗ trợ" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: "Lỗi: " + error.message }, { status: 500 });
    }
}