'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Play, Calendar, MapPin, ArrowRight, Video } from 'lucide-react';
import { Link } from '../../lib/safe-navigation';
import { Event } from '../../types';

interface EventVideo {
  id: number;
  video_url: string;
  thumbnail_url: string | null;
  video_title: string | null;
  event_id: string;
  title: string;
  slug: string;
  date: string;
  location: string;
  category: string;
  price?: number;
  imageurl?: string;
  organizer?: string;
}

type Props = {
  onSelect?: (event: Event) => void;
};

const EventVideos: React.FC<Props> = ({ onSelect }) => {
  const [videos, setVideos] = useState<EventVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

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

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const handlePlay = (id: number) => {
    if (playingId !== null && playingId !== id) {
      const prevVideo = videoRefs.current.get(playingId);
      if (prevVideo) {
        prevVideo.pause();
        prevVideo.currentTime = 0;
      }
    }
    setPlayingId(id);
    const video = videoRefs.current.get(id);
    if (video) {
      video.play();
    }
  };

  if (!loading && videos.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
            <Video size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Les Prochains Evenements</h2>
            <p className="text-gray-400 text-sm">En video, comme si vous y etiez deja.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="aspect-[9/16] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl animate-pulse" />
            ))
          ) : (
            videos.map((video) => {
              const href = video.slug ? `/events/${video.slug}` : `/events/${video.event_id}`;
              const isPlaying = playingId === video.id;

              return (
                <div key={video.id} className="group relative">
                  <div className="aspect-[9/16] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative">
                    <video
                      ref={(el) => {
                        if (el) videoRefs.current.set(video.id, el);
                      }}
                      src={video.video_url}
                      poster={video.thumbnail_url || undefined}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      onClick={() => handlePlay(video.id)}
                    />
                    
                    {!isPlaying && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                        onClick={() => handlePlay(video.id)}
                      >
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                          <Play size={32} className="text-white ml-1" fill="white" />
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 backdrop-blur-xl text-white text-xs font-medium px-2 py-1 rounded-full">
                          {video.category}
                        </span>
                        <span className="text-purple-400 font-bold text-xs flex items-center">
                          <Calendar size={12} className="mr-1" /> {formatDate(video.date)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight mb-1 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-300 text-sm flex items-center mb-3">
                        <MapPin size={14} className="mr-1.5 text-gray-400" /> {video.location}
                      </p>
                      
                      {onSelect ? (
                        <button
                          onClick={() => onSelect({
                            id: video.event_id,
                            title: video.title,
                            slug: video.slug,
                            date: video.date,
                            location: video.location,
                            category: video.category as Event['category'],
                            price: video.price || 0,
                            imageUrl: video.thumbnail_url || video.imageurl || null,
                            organizer: video.organizer || ''
                          })}
                          className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          Voir l'evenement <ArrowRight size={16} />
                        </button>
                      ) : (
                        <Link
                          href={href}
                          className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          Voir l'evenement <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default EventVideos;
