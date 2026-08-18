'use client';

import { useState } from 'react';
import { Clock, Save, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import {
  AmPm,
  RitualEntry,
  createRitualId,
  formatDisplayTime,
  fromTimeInputValue,
  normalizeRituals,
  sanitizeClockTime,
  toTimeInputValue,
} from '@/lib/utils/timingHelpers';

interface TimingsSettingsProps {
  settings: {
    morningStart?: string;
    morningEnd?: string;
    eveningStart?: string;
    eveningEnd?: string;
    rituals?: Array<RitualEntry | string>;
  };
  onUpdate: (data: any) => Promise<void>;
}

const inputClass =
  'w-full px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200';

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (displayTime: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0B3C5D] mb-2">{label}</label>
      <input
        type="time"
        value={toTimeInputValue(value)}
        onChange={(e) => onChange(fromTimeInputValue(e.target.value))}
        className={inputClass}
      />
      {value && (
        <p className="text-xs text-[#555555] mt-1">{formatDisplayTime(value)}</p>
      )}
    </div>
  );
}

export default function TimingsSettings({ settings, onUpdate }: TimingsSettingsProps) {
  const [formData, setFormData] = useState({
    morningStart: settings.morningStart || '5:00 AM',
    morningEnd: settings.morningEnd || '12:00 PM',
    eveningStart: settings.eveningStart || '4:00 PM',
    eveningEnd: settings.eveningEnd || '9:00 PM',
    rituals: normalizeRituals(settings.rituals),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('7:30');
  const [newPeriod, setNewPeriod] = useState<AmPm>('AM');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<RitualEntry | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRitualAdd = () => {
    if (!newName.trim()) return;
    const ritual: RitualEntry = {
      id: createRitualId(),
      name: newName.trim(),
      time: sanitizeClockTime(newTime || '7:30'),
      period: newPeriod,
    };
    setFormData((prev) => ({ ...prev, rituals: [...prev.rituals, ritual] }));
    setNewName('');
    setNewTime('7:30');
    setNewPeriod('AM');
  };

  const startEdit = (ritual: RitualEntry) => {
    setEditingId(ritual.id);
    setEditDraft({ ...ritual });
  };

  const saveEdit = () => {
    if (!editDraft) return;
    setFormData((prev) => ({
      ...prev,
      rituals: prev.rituals.map((ritual) =>
        ritual.id === editDraft.id
          ? {
              ...editDraft,
              name: editDraft.name.trim() || ritual.name,
              time: sanitizeClockTime(editDraft.time),
            }
          : ritual
      ),
    }));
    setEditingId(null);
    setEditDraft(null);
  };

  const handleRitualRemove = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      rituals: prev.rituals.filter((ritual) => ritual.id !== id),
    }));
    if (editingId === id) {
      setEditingId(null);
      setEditDraft(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onUpdate({
      ...formData,
      rituals: formData.rituals.map((ritual) => ({
        ...ritual,
        time: sanitizeClockTime(ritual.time),
      })),
    });
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
            <TimeField
              label="Morning Start"
              value={formData.morningStart}
              onChange={(value) => handleChange('morningStart', value)}
            />
            <TimeField
              label="Morning End"
              value={formData.morningEnd}
              onChange={(value) => handleChange('morningEnd', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimeField
              label="Evening Start"
              value={formData.eveningStart}
              onChange={(value) => handleChange('eveningStart', value)}
            />
            <TimeField
              label="Evening End"
              value={formData.eveningEnd}
              onChange={(value) => handleChange('eveningEnd', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B3C5D] mb-2">
              Daily Rituals
            </label>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_90px_auto] gap-2 mb-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleRitualAdd())}
                className={inputClass}
                placeholder="e.g. Mangala Aarti"
              />
              <input
                type="text"
                inputMode="numeric"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                onBlur={() => setNewTime(sanitizeClockTime(newTime || '7:30'))}
                className={inputClass}
                placeholder="7:30"
              />
              <select
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value as AmPm)}
                className={inputClass}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
              <button
                type="button"
                onClick={handleRitualAdd}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {formData.rituals.length === 0 ? (
              <p className="text-sm text-[#555555]">No daily rituals added yet.</p>
            ) : (
              <div className="space-y-2">
                {formData.rituals.map((ritual) => (
                  <div
                    key={ritual.id}
                    className="rounded-xl border border-[#E5E3DD]/50 bg-white/70 p-3"
                  >
                    {editingId === ritual.id && editDraft ? (
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_90px_auto] gap-2">
                        <input
                          type="text"
                          value={editDraft.name}
                          onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                          className={inputClass}
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editDraft.time}
                          onChange={(e) => setEditDraft({ ...editDraft, time: e.target.value })}
                          onBlur={() =>
                            setEditDraft((prev) =>
                              prev ? { ...prev, time: sanitizeClockTime(prev.time) } : prev
                            )
                          }
                          className={inputClass}
                          placeholder="7:30"
                        />
                        <select
                          value={editDraft.period}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, period: e.target.value as AmPm })
                          }
                          className={inputClass}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="p-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditDraft(null);
                            }}
                            className="p-2.5 rounded-xl border border-[#E5E3DD] text-[#555555] cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#0B3C5D]">{ritual.name}</p>
                          <p className="text-xs text-[#D4AF37] font-medium">
                            {sanitizeClockTime(ritual.time)} {ritual.period}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(ritual)}
                            className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRitualRemove(ritual.id)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
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
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold transition-all duration-200 hover:bg-[#E8C84A] hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Timings'}
          </button>
        </div>
      </div>
    </form>
  );
}
