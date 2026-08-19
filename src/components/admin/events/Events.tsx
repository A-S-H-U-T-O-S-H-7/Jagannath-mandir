// app/admin/events/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import {
  adminEventService,
  Event,
} from '@/lib/services/adminEventService';
import { ActivityActions, ActivityEntityTypes } from '@/lib/services/activityLogService';
import EventStats from '@/components/admin/events/EventStats';
import EventFilters from '@/components/admin/events/EventFilters';
import EventTable from '@/components/admin/events/EventTable';
import CreateEventModal from '@/components/admin/events/CreateEventModal';
import EventAttendeesModal from '@/components/admin/events/EventAttendeesModal';
import EventMediaModal from '@/components/admin/events/EventMediaModal';

export default function EventsPage() {
  const router = useRouter();
  const { log } = useActivityLogger();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, ongoing: 0, completed: 0, cancelled: 0, totalAttendees: 0 });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [statusFilter]);

  const checkAdminAccess = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/admin/login');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        router.push('/admin/login');
        return;
      }

      const data = userDoc.data();
      if (data.role !== 'super_admin' && data.role !== 'admin') {
        toast.error("You don't have permission to access this page");
        router.push('/admin/dashboard');
        return;
      }

      setIsAdmin(true);
      await fetchData();
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/admin/login');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await adminEventService.getAllEvents();
      if (result.success) {
        let filtered = result.events;
        if (statusFilter !== 'all') {
          filtered = filtered.filter(e => e.status === statusFilter);
        }
        setEvents(filtered);
        const statsResult = await adminEventService.getEventStats();
        setStats(statsResult);
      } else {
        toast.error(result.error || 'Failed to load events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      let result;

      if (editingEvent) {
        result = await adminEventService.updateEvent(editingEvent.id, formData);
        if (result.success) {
          toast.success('Event updated successfully ✅');
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.EVENT,
            entityId: editingEvent.id,
            entityTitle: formData.title,
            details: `Updated event: ${formData.title}`,
          });
        }
      } else {
        const createData = {
          ...formData,
          createdBy: auth.currentUser?.uid || '',
          createdByAdminName: auth.currentUser?.displayName || 'Admin',
        };
        result = await adminEventService.createEvent(createData);
        if (result.success) {
          toast.success('Event created successfully ✅');
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.EVENT,
            entityId: result.id,
            entityTitle: formData.title,
            details: `Created event: ${formData.title}`,
          });
        }
      }

      if (result.success) {
        setIsModalOpen(false);
        await fetchData();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error(error.message || 'Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (event: Event) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete event "${event.title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0B3C5D',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#F9F8F4',
      color: '#0B3C5D',
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await adminEventService.deleteEvent(event.id);
        if (deleteResult.success) {
          toast.success('Event deleted successfully 🗑️');
          await log({
            action: ActivityActions.DELETE,
            entityType: ActivityEntityTypes.EVENT,
            entityId: event.id,
            entityTitle: event.title,
            details: `Deleted event: ${event.title}`,
          });
          await fetchData();
        } else {
          toast.error(deleteResult.error || 'Failed to delete event');
        }
      } catch (error: any) {
        console.error('Error deleting event:', error);
        toast.error(error.message || 'Failed to delete event');
      }
    }
  };

  const handleViewAttendees = (event: Event) => {
    setSelectedEvent(event);
    setIsAttendeesModalOpen(true);
  };

  const handleManageMedia = (event: Event) => {
    setSelectedEvent(event);
    setIsMediaModalOpen(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Refreshed!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard')}
            className="mt-0.5 p-2 rounded-xl border-2 border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#0B3C5D]">
              📅 Events
            </h1>
            <p className="text-sm text-[#555555] mt-1">Manage all events</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E3DD]/50 bg-white/80 text-[#0B3C5D] text-sm font-medium hover:bg-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] transition-all duration-200 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <EventStats stats={stats} />

      {/* Filters */}
      <EventFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Table */}
      <EventTable
        events={events.filter((event) => {
          if (!searchTerm.trim()) return true;
          const term = searchTerm.toLowerCase();
          return (
            event.title.toLowerCase().includes(term) ||
            event.location.toLowerCase().includes(term) ||
            event.city.toLowerCase().includes(term)
          );
        })}
        loading={loading}
        onViewAttendees={handleViewAttendees}
        onManageMedia={handleManageMedia}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Modal */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSave}
        editingEvent={editingEvent}
        isSaving={isSaving}
        communities={[]}
      />

      {/* Attendees Modal */}
      <EventAttendeesModal
        isOpen={isAttendeesModalOpen}
        onClose={() => {
          setIsAttendeesModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />

      <EventMediaModal
        isOpen={isMediaModalOpen}
        event={selectedEvent}
        onClose={() => {
          setIsMediaModalOpen(false);
          if (!isAttendeesModalOpen) setSelectedEvent(null);
        }}
      />
    </div>
  );
}