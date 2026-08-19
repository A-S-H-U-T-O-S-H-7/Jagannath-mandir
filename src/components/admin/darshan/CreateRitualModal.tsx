// components/admin/darshan/CreateRitualModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Ritual } from '@/lib/services/adminDarshanService';
import TimeAmPmInput from '@/components/ui/TimeAmPmInput';
import { combineTimeAndPeriod, splitTimeAndPeriod } from '@/lib/utils/timingHelpers';

interface CreateRitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  editingRitual?: Ritual | null;
  isSaving?: boolean;
}

const iconOptions = [
  { value: 'Sun', label: '🌅 Sun' },
  { value: 'Moon', label: '🌙 Moon' },
  { value: 'Star', label: '⭐ Star' },
  { value: 'Clock', label: '🕐 Clock' },
];

export default function CreateRitualModal({
  isOpen,
  onClose,
  onSave,
  editingRitual,
  isSaving = false,
}: CreateRitualModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    time: '7:00 AM',
    icon: 'Clock',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingRitual) {
      const parsed = splitTimeAndPeriod(editingRitual.time || '7:00 AM');
      setFormData({
        name: editingRitual.name || '',
        time: combineTimeAndPeriod(parsed.clock, parsed.period),
        icon: editingRitual.icon || 'Clock',
        isActive: editingRitual.isActive !== false,
      });
    } else {
      setFormData({
        name: '',
        time: '7:00 AM',
        icon: 'Clock',
        isActive: true,
      });
    }
  }, [editingRitual, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.time.trim()) newErrors.time = 'Time is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E5E3DD]/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E3DD]/50 flex-shrink-0">
          <h2 className="text-lg font-serif font-bold text-[#0B3C5D]">
            {editingRitual ? '✏️ Edit Ritual' : '🕐 Add Daily Ritual'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#D4AF37]/5 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer text-[#555555]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Ritual Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border ${
                  errors.name ? 'border-red-500' : 'border-[#E5E3DD]/50'
                } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none`}
                placeholder="e.g. Mangala Aarti"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Time <span className="text-red-400">*</span>
              </label>
              <TimeAmPmInput
                value={formData.time}
                onChange={(time) => setFormData({ ...formData, time })}
                error={Boolean(errors.time)}
              />
              {errors.time && <p className="text-red-500 text-xs mt-1.5">{errors.time}</p>}
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Icon
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none cursor-pointer"
              >
                {iconOptions.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E5E3DD] text-[#D4AF37] focus:ring-[#D4AF37]/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-[#0B3C5D]">Active (visible on website)</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[#E5E3DD]/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer bg-[#F0EAE6] text-[#0B3C5D] hover:bg-[#E5DDD8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A] shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingRitual ? 'Updating...' : 'Adding...'}
                  </span>
                ) : (
                  editingRitual ? 'Update Ritual' : 'Add Ritual'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}