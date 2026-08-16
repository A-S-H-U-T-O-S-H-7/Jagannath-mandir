// components/admin/settings/TimingsSettings.tsx
'use client';

import { useState } from "react";
import { Clock, Save, Plus, X } from "lucide-react";

interface TimingsSettingsProps {
  settings: {
    morningStart?: string;
    morningEnd?: string;
    eveningStart?: string;
    eveningEnd?: string;
    rituals?: string[];
  };
  onUpdate: (data: any) => Promise<void>;
}

export default function TimingsSettings({ settings, onUpdate }: TimingsSettingsProps) {
  const [formData, setFormData] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);
  const [newRitual, setNewRitual] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRitualAdd = () => {
    if (newRitual.trim()) {
      setFormData(prev => ({
        ...prev,
        rituals: [...(prev.rituals || []), newRitual.trim()]
      }));
      setNewRitual('');
    }
  };

  const handleRitualRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rituals: (prev.rituals || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onUpdate(formData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-[#E5E3DD]/50 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[#D4AF37]/10">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#0B3C5D]">
            Darshan <span className="text-[#D4AF37]">Timings</span>
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-2">
                Morning Start
              </label>
              <input
                type="text"
                value={formData.morningStart || ''}
                onChange={(e) => handleChange('morningStart', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
                placeholder="5:00 AM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-2">
                Morning End
              </label>
              <input
                type="text"
                value={formData.morningEnd || ''}
                onChange={(e) => handleChange('morningEnd', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
                placeholder="12:00 PM"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-2">
                Evening Start
              </label>
              <input
                type="text"
                value={formData.eveningStart || ''}
                onChange={(e) => handleChange('eveningStart', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
                placeholder="4:00 PM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-2">
                Evening End
              </label>
              <input
                type="text"
                value={formData.eveningEnd || ''}
                onChange={(e) => handleChange('eveningEnd', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
                placeholder="9:00 PM"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B3C5D] mb-2">
              Daily Rituals
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newRitual}
                onChange={(e) => setNewRitual(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRitualAdd()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
                placeholder="Enter ritual name..."
              />
              <button
                type="button"
                onClick={handleRitualAdd}
                className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] hover:bg-[#E8C84A] transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {(formData.rituals || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(formData.rituals || []).map((ritual, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 text-[#0B3C5D] text-sm border border-[#D4AF37]/20"
                  >
                    <span>{ritual}</span>
                    <button
                      type="button"
                      onClick={() => handleRitualRemove(index)}
                      className="text-[#555555] hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E5E3DD]/50">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold transition-all duration-200 hover:bg-[#E8C84A] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Timings"}
          </button>
        </div>
      </div>
    </form>
  );
}