// app/events/page.tsx
'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  CalendarDays, 
  Users, 
  Search,
  ArrowLeft,
  MapPin,
  Clock,
  Heart,
  ArrowRight
} from "lucide-react";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  city: string;
  description: string;
  category: 'festival' | 'ritual' | 'community';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image: string;
  month: string;
  day: string;
  attendeeCount: number;
  attendees?: string[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: 'Rath Yatra',
      date: 'July 7, 2026',
      time: '7:00 AM - 9:00 PM',
      location: 'Sector 93A',
      city: 'Noida',
      description: 'The grand chariot festival of Lord Jagannath, Balabhadra, and Subhadra. A spectacular procession with thousands of devotees pulling the chariots.',
      category: 'festival',
      status: 'upcoming',
      image: '/hero-desktop.png',
      month: 'JUL',
      day: '07',
      attendeeCount: 5000,
    },
    {
      id: 2,
      title: 'Janmashtami',
      date: 'August 15, 2026',
      time: '12:00 AM - 11:59 PM',
      location: 'Sector 93A',
      city: 'Noida',
      description: 'Celebration of Lord Krishna\'s birth with midnight aarti, devotional singing, and traditional festivities.',
      category: 'festival',
      status: 'upcoming',
      image: '/hero-desktop.png',
      month: 'AUG',
      day: '15',
      attendeeCount: 2000,
    },
    {
      id: 3,
      title: 'Snana Purnima',
      date: 'June 21, 2026',
      time: '8:00 AM - 12:00 PM',
      location: 'Sector 93A',
      city: 'Noida',
      description: 'The sacred bathing ceremony of Lord Jagannath on the full moon day. Special abhishekam with 108 pots of holy water.',
      category: 'festival',
      status: 'completed',
      image: '/hero-desktop.png',
      month: 'JUN',
      day: '21',
      attendeeCount: 1500,
    },
    {
      id: 4,
      title: 'Mangala Aarti',
      date: 'Every Day',
      time: '5:00 AM - 6:00 AM',
      location: 'Sector 93A',
      city: 'Noida',
      description: 'The early morning wake-up ceremony of Lord Jagannath. Start your day with the divine presence and blessings of the Lord.',
      category: 'ritual',
      status: 'ongoing',
      image: '/hero-desktop.png',
      month: 'Daily',
      day: '05',
      attendeeCount: 200,
    },
    {
      id: 5,
      title: 'Evening Aarti',
      date: 'Every Day',
      time: '7:00 PM - 8:00 PM',
      location: 'Sector 93A',
      city: 'Noida',
      description: 'The evening prayer ceremony with lamps, bhajans, and devotional singing. Experience the divine energy.',
      category: 'ritual',
      status: 'ongoing',
      image: '/hero-desktop.png',
      month: 'Daily',
      day: '19',
      attendeeCount: 300,
    },
    {
      id: 6,
      title: 'Community Bhajan',
      date: 'Every Sunday',
      time: '6:00 PM - 8:00 PM',
      location: 'Sector 93A',
      city: 'Noida',
      description: 'Join our weekly community bhajan session. Sing devotional songs and experience the joy of collective worship.',
      category: 'community',
      status: 'upcoming',
      image: '/hero-desktop.png',
      month: 'Sun',
      day: '18',
      attendeeCount: 200,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let filtered = events;
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term) ||
        e.city.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(e => e.status === statusFilter);
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, statusFilter, events]);

  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendeeCount, 0);

  const statusColors = {
    upcoming: 'bg-blue-500/10 text-blue-600 border-blue-200',
    ongoing: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20',
    completed: 'bg-green-500/10 text-green-600 border-green-200',
    cancelled: 'bg-red-500/10 text-red-600 border-red-200',
  };

  const statusLabels = {
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return (
    <div className=" min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-4 md:py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex cursor-pointer items-center gap-2 text-[#555555] hover:text-[#0B3C5D] transition-colors mb-4 md:mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs md:text-sm font-medium">Back</span>
        </button>

        {/* Hero with Banner */}
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-12">
          {/* Banner Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src={isMobile ? "/eventmob.png" : "/eventbg.png"}
              alt="Events Banner"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B3C5D]/80 via-[#0B3C5D]/50 to-[#0B3C5D]/30" />
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center py-16 md:py-24 lg:py-28 px-4"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">
              <span className="text-[#D4AF37]">Events</span> & Festivals
            </h1>
            <p className="text-sm md:text-lg text-white/80 mt-3 md:mt-4 max-w-2xl mx-auto px-2">
              Discover upcoming festivals, rituals, and community gatherings at Jagnanth Mandir
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">{totalEvents}</span> Total Events
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">{upcomingEvents}</span> Upcoming
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                <span className="text-xs md:text-sm text-white/80">
                  <span className="font-bold text-white">{totalAttendees}</span> Devotees
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-4xl mx-auto mb-6 md:mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#555555]/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-11 pr-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-sm md:text-base border border-[#E5E3DD]/50 bg-white/80 backdrop-blur-sm focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-300 outline-none text-[#0B3C5D] placeholder:text-[#555555]/40"
              placeholder="Search events by title, location..."
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#0B3C5D] text-white shadow-md shadow-[#0B3C5D]/20'
                  : 'bg-white/80 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                statusFilter === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white/80 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white'
              }`}
            >
              📅 Upcoming
            </button>
            <button
              onClick={() => setStatusFilter('ongoing')}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                statusFilter === 'ongoing'
                  ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md shadow-[#D4AF37]/20'
                  : 'bg-white/80 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white'
              }`}
            >
              🔄 Ongoing
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                  : 'bg-white/80 text-[#555555] border border-[#E5E3DD]/50 hover:bg-white'
              }`}
            >
              ✅ Completed
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-xs md:text-sm text-[#555555] mb-4 md:mb-6">
          Showing {filteredEvents.length} of {events.length} events
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#555555]">No events found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E5E3DD]/50 hover:border-[#D4AF37]/30 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C5D]/40 via-transparent to-transparent" />
                  
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-center shadow-lg border border-[#D4AF37]/20">
                    <p className="text-[10px] font-bold text-[#0B3C5D] uppercase tracking-wider">
                      {event.month}
                    </p>
                    <p className="text-xl font-bold text-[#D4AF37] leading-none">
                      {event.day}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full border text-[10px] font-medium uppercase backdrop-blur-sm ${statusColors[event.status]}`}>
                    {statusLabels[event.status]}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-[#0B3C5D] mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  
                  <div className="flex flex-col gap-1.5 text-xs text-[#555555] mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>{event.location}, {event.city}</span>
                    </div>
                  </div>

                  <p className="text-sm text-[#555555] leading-relaxed line-clamp-2 mb-4">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[#555555]">
                      <Users className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>{event.attendeeCount}+ devotees</span>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <button className="inline-flex items-center gap-1 text-[#D4AF37] font-semibold text-sm hover:text-[#B8962E] transition-colors group/btn">
                        Details
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}