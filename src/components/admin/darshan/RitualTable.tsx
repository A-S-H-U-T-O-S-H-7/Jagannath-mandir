// components/admin/darshan/RitualTable.tsx
'use client';

import { Edit, Trash2, CheckCircle, XCircle, Clock, GripVertical } from 'lucide-react';
import { Ritual } from '@/lib/services/adminDarshanService';

interface RitualTableProps {
  rituals: Ritual[];
  loading?: boolean;
  onEdit: (ritual: Ritual) => void;
  onDelete: (ritual: Ritual) => void;
  onToggleActive: (ritual: Ritual) => void;
}

const iconMap: Record<string, string> = {
  Sun: '🌅',
  Moon: '🌙',
  Star: '⭐',
  Clock: '🕐',
};

export default function RitualTable({
  rituals,
  loading = false,
  onEdit,
  onDelete,
  onToggleActive,
}: RitualTableProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#D4AF37] border-t-transparent mx-auto" />
        <p className="text-[#555555] mt-3">Loading rituals...</p>
      </div>
    );
  }

  if (rituals.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-12 text-center shadow-sm">
        <Clock className="w-16 h-16 text-[#555555]/20 mx-auto mb-4" />
        <p className="text-lg text-[#555555]">No rituals found</p>
        <p className="text-sm text-[#555555]/60 mt-2">
          Add daily rituals to help devotees plan their visit
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Icon</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#555555] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E3DD]/30">
            {rituals.map((ritual, index) => (
              <tr key={ritual.id} className="hover:bg-[#D4AF37]/5 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm text-[#555555]">{index + 1}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-[#0B3C5D]">{ritual.name}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-[#D4AF37]">{ritual.time}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-lg">{iconMap[ritual.icon] || '🕐'}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-[#555555] truncate max-w-xs">
                    {ritual.description}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {ritual.isActive ? (
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
                      onClick={() => onToggleActive(ritual)}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                        ritual.isActive
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={ritual.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {ritual.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onEdit(ritual)}
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-amber-100 text-amber-600 hover:bg-amber-200"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(ritual)}
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