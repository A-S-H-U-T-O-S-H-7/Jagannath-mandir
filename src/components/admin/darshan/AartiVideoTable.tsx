// components/admin/darshan/AartiVideoTable.tsx
'use client';

import { Edit, Trash2, Eye, Play, Pause, CheckCircle, XCircle, Video, Calendar } from 'lucide-react';
import Image from 'next/image';
import { AartiVideo } from '@/lib/services/adminDarshanService';

interface AartiVideoTableProps {
  videos: AartiVideo[];
  loading?: boolean;
  onEdit: (video: AartiVideo) => void;
  onDelete: (video: AartiVideo) => void;
  onToggleActive: (video: AartiVideo) => void;
}

export default function AartiVideoTable({
  videos,
  loading = false,
  onEdit,
  onDelete,
  onToggleActive,
}: AartiVideoTableProps) {
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
        <p className="text-lg text-[#555555]">No aarti videos found</p>
        <p className="text-sm text-[#555555]/60 mt-2">
          Upload aarti videos to share with devotees
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DD]/30">
            {videos.map((video, index) => (
              <tr key={video.id} className="hover:bg-[#D4AF37]/5 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm text-[#555555]">{index + 1}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F9F8F4] border border-[#E5E3DD]/50 relative">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/5">
                        <Play className="w-5 h-5 text-[#555555]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-[#0B3C5D] truncate max-w-xs">
                    {video.title}
                  </p>
                  {video.duration && (
                    <p className="text-xs text-[#555555]">{video.duration}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#555555]">
                    {video.date ? new Date(video.date).toLocaleDateString() : '-'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {video.isActive ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                      <XCircle className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(video.videoUrl, '_blank')}
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
                      title="Watch Video"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleActive(video)}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                        video.isActive
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={video.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {video.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onEdit(video)}
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-amber-100 text-amber-600 hover:bg-amber-200"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(video)}
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
                      title="Delete"
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