'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Video, ChevronLeft, ChevronRight } from 'lucide-react';

interface EventVideo {
  id: number;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  banner_text: string | null;
  priority: number;
}

const EventVideos: React.FC = () => {
  const [videos, setVideos] = useState<EventVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/event-videos');
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos || []);
        }
      } catch (error) {
        console.error('Error fetching event videos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const goToNext = useCallback(() => {
    if (videos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  }, [videos.length]);

  const goToPrev = useCallback(() => {
    if (videos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  }, [videos.length]);

  useEffect(() => {
    if (videos.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      goToNext();
    }, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videos.length, goToNext]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const handleVideoEnd = () => {
    goToNext();
  };

  const getVideoSrc = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
      }
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;
      }
    }
    return url;
  };

  const isEmbedVideo = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  if (!loading && videos.length === 0) return null;

  const currentVideo = videos[currentIndex];

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
            <Video size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Videos</h2>
            <p className="text-gray-400 text-sm">Decouvrez les meilleurs moments</p>
          </div>
        </div>

        {loading ? (
          <div className="aspect-[9/16] max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl animate-pulse" />
        ) : currentVideo ? (
          <div className="relative max-w-md mx-auto">
            <div className="aspect-[9/16] bg-black rounded-3xl overflow-hidden relative border-4 border-white/20">
              {isEmbedVideo(currentVideo.video_url) ? (
                <iframe
                  src={getVideoSrc(currentVideo.video_url)}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  src={currentVideo.video_url}
                  poster={currentVideo.thumbnail_url || undefined}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop={videos.length === 1}
                  muted
                  playsInline
                  onEnded={handleVideoEnd}
                />
              )}

              {currentVideo.banner_text && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 py-2 overflow-hidden">
                  <div className="whitespace-nowrap animate-marquee">
                    <span className="inline-block px-4 text-white font-bold text-sm">
                      {currentVideo.banner_text}
                    </span>
                    <span className="inline-block px-4 text-white font-bold text-sm">
                      {currentVideo.banner_text}
                    </span>
                    <span className="inline-block px-4 text-white font-bold text-sm">
                      {currentVideo.banner_text}
                    </span>
                  </div>
                </div>
              )}

              {currentVideo.title && !currentVideo.banner_text && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-bold text-lg">{currentVideo.title}</h3>
                </div>
              )}
            </div>

            {videos.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <ChevronRight size={24} />
                </button>

                <div className="flex justify-center gap-2 mt-4">
                  {videos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex
                          ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
          display: flex;
        }
      `}</style>
    </section>
  );
};

export default EventVideos;
