// components/admin/events/EventAttendeesModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Users, User, CheckCircle, XCircle } from 'lucide-react';
import { Event } from '@/lib/services/adminEventService';

interface EventAttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

interface Attendee {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  isVerified: boolean;
}

export default function EventAttendeesModal({
  isOpen,
  onClose,
  event,
}: EventAttendeesModalProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && event) {
      fetchAttendees();
    }
  }, [isOpen, event]);

  const fetchAttendees = async () => {
    if (!event) return;
    setLoading(true);
    try {
      // For now, use mock data since attendees might not exist
      // Replace with actual API call when ready
      setAttendees([
        {
          uid: '1',
          displayName: 'Devotee One',
          email: 'devotee1@example.com',
          photoURL: '',
          isVerified: true,
        },
        {
          uid: '2',
          displayName: 'Devotee Two',
          email: 'devotee2@example.com',
          photoURL: '',
          isVerified: false,
        },
      ]);
    } catch (error) {
      console.error('Error fetching attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E5E3DD]/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E3DD]/50 flex-shrink-0">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#0B3C5D]">👥 Event Attendees</h2>
            <p className="text-sm text-[#555555]">
              {event.title} • {event.city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#D4AF37]/5 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer text-[#555555]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#D4AF37] border-t-transparent" />
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-[#555555]/30 mx-auto" />
              <p className="text-[#555555] mt-3">No attendees for this event yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attendees.map((attendee) => (
                <div
                  key={attendee.uid}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-[#E5E3DD]/50 hover:border-[#D4AF37]/20 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center text-[#0B3C5D] font-bold text-sm">
                    {attendee.displayName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0B3C5D] truncate">
                      {attendee.displayName || 'Unknown User'}
                    </p>
                    <p className="text-xs text-[#555555] truncate">{attendee.email}</p>
                  </div>
                  <div>
                    {attendee.isVerified ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-xs text-[#555555] flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-[#E5E3DD]/50 flex-shrink-0">
          <div className="text-sm text-[#555555]">
            Total: {attendees.length} attendee{attendees.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer bg-[#0B3C5D] text-white hover:bg-[#062A42]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}