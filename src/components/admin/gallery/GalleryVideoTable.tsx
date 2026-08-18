'use client';

import { Play, Trash2, Video } from 'lucide-react';
import Image from 'next/image';
import { GalleryVideo } from '@/lib/services/adminGalleryService';

interface GalleryVideoTableProps {
  videos: GalleryVideo[];
  loading?: boolean;
  onDelete: (video: GalleryVideo) => void;
}

export default function GalleryVideoTable({
  videos,
  loading = false,
  onDelete,
}: GalleryVideoTableProps) {
  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#D4AF37] border-t-transparent mx-auto" />
        <p className="text-[#555555] mt-3">Loading videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-12 text-center shadow-sm">
        <Video className="w-16 h-16 text-[#555555]/20 mx-auto mb-4" />
        <p className="text-lg text-[#555555]">No videos found</p>
        <p className="text-sm text-[#555555]/60 mt-2">
          Click “Upload Video” to add videos to the gallery
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#0B3C5D]/5 to-[#D4AF37]/5 border-b border-[#E5E3DD]/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Thumbnail</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Uploaded</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DD]/30">
            {videos.map((video, index) => (
              <tr
                key={video.id}
                className={`transition-colors ${index % 2 === 0 ? 'bg-white/50' : 'bg-[#F9F8F4]/50'} hover:bg-[#D4AF37]/5`}
              >
                <td className="px-4 py-3">
                  <span className="text-sm text-[#555555]">{index + 1}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-[#0B3C5D]/10 border border-[#E5E3DD]/50 relative">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        width={80}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-[#555555]/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-[#0B3C5D] truncate max-w-xs">
                    {video.title || 'Untitled'}
                  </p>
                  {video.description && (
                    <p className="text-xs text-[#555555] truncate max-w-xs">{video.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#555555]">{video.duration || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#555555]">{formatDate(video.createdAt)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(video.videoUrl, '_blank')}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer"
                      title="Watch video"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(video)}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                      title="Delete video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
