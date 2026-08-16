// app/admin/activity/page.tsx
'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Calendar, 
  User, 
  FileText, 
  Eye, 
  Trash2, 
  Edit, 
  PlusCircle,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  RefreshCw,
  Users,
  CalendarDays,
  Image as GalleryIcon,
  Clock,
  Mail,
  Heart,
  Settings,
  ArrowLeft,
  Shield
} from "lucide-react";
import { 
  getActivityLogs, 
  ActivityActions, 
  ActivityEntityTypes,
  ActivityLog 
} from "@/lib/services/activityLogService";

// Action Icons Mapping
const actionIcons: Record<string, { icon: any; color: string; bg: string }> = {
  [ActivityActions.CREATE]: { icon: PlusCircle, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
  [ActivityActions.UPDATE]: { icon: Edit, color: "text-blue-500", bg: "bg-blue-100" },
  [ActivityActions.DELETE]: { icon: Trash2, color: "text-red-500", bg: "bg-red-100" },
  [ActivityActions.PUBLISH]: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" },
  [ActivityActions.UNPUBLISH]: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-100" },
  [ActivityActions.LOGIN]: { icon: LogIn, color: "text-green-500", bg: "bg-green-100" },
  [ActivityActions.LOGOUT]: { icon: LogOut, color: "text-gray-500", bg: "bg-gray-100" },
  [ActivityActions.STATUS_CHANGE]: { icon: Eye, color: "text-purple-500", bg: "bg-purple-100" },
  [ActivityActions.VERIFY]: { icon: Shield, color: "text-emerald-500", bg: "bg-emerald-100" },
  [ActivityActions.REJECT]: { icon: XCircle, color: "text-red-500", bg: "bg-red-100" },
};

const getActionText = (action: string): string => {
  const texts: Record<string, string> = {
    [ActivityActions.CREATE]: "Created",
    [ActivityActions.UPDATE]: "Updated",
    [ActivityActions.DELETE]: "Deleted",
    [ActivityActions.PUBLISH]: "Published",
    [ActivityActions.UNPUBLISH]: "Unpublished",
    [ActivityActions.LOGIN]: "Logged In",
    [ActivityActions.LOGOUT]: "Logged Out",
    [ActivityActions.STATUS_CHANGE]: "Status Changed",
    [ActivityActions.VERIFY]: "Verified",
    [ActivityActions.REJECT]: "Rejected",
  };
  return texts[action] || action;
};

const actionOptions = [
  { value: 'all', label: 'All Actions' },
  { value: ActivityActions.CREATE, label: 'Create' },
  { value: ActivityActions.UPDATE, label: 'Update' },
  { value: ActivityActions.DELETE, label: 'Delete' },
  { value: ActivityActions.PUBLISH, label: 'Publish' },
  { value: ActivityActions.VERIFY, label: 'Verify' },
  { value: ActivityActions.REJECT, label: 'Reject' },
  { value: ActivityActions.LOGIN, label: 'Login' },
  { value: ActivityActions.LOGOUT, label: 'Logout' },
  { value: ActivityActions.STATUS_CHANGE, label: 'Status Change' },
];

const entityOptions = [
  { value: 'all', label: 'All Types' },
  { value: ActivityEntityTypes.USER, label: 'User' },
  { value: ActivityEntityTypes.ADMIN, label: 'Admin' },
  { value: ActivityEntityTypes.EVENT, label: 'Event' },
  { value: ActivityEntityTypes.GALLERY, label: 'Gallery' },
  { value: ActivityEntityTypes.TIMING, label: 'Darshan Timings' },
  { value: ActivityEntityTypes.SUBMISSION, label: 'Submission' },
  { value: ActivityEntityTypes.SETTINGS, label: 'Settings' },
  { value: ActivityEntityTypes.DONATION, label: 'Donation' },
  { value: ActivityEntityTypes.TESTIMONIAL, label: 'Testimonial' },
  { value: ActivityEntityTypes.CONTACT, label: 'Contact' },
  { value: ActivityEntityTypes.VOLUNTEER, label: 'Volunteer' },
];

const getEntityTypeLabel = (entityType: string): string => {
  const labels: Record<string, string> = {
    [ActivityEntityTypes.USER]: "User",
    [ActivityEntityTypes.ADMIN]: "Admin",
    [ActivityEntityTypes.EVENT]: "Event",
    [ActivityEntityTypes.GALLERY]: "Gallery",
    [ActivityEntityTypes.TIMING]: "Darshan Timing",
    [ActivityEntityTypes.SUBMISSION]: "Submission",
    [ActivityEntityTypes.SETTINGS]: "Settings",
    [ActivityEntityTypes.DONATION]: "Donation",
    [ActivityEntityTypes.TESTIMONIAL]: "Testimonial",
    [ActivityEntityTypes.CONTACT]: "Contact",
    [ActivityEntityTypes.VOLUNTEER]: "Volunteer",
  };
  return labels[entityType] || entityType;
};

const getEntityTypeColor = (entityType: string): string => {
  const colors: Record<string, string> = {
    [ActivityEntityTypes.USER]: "text-green-500",
    [ActivityEntityTypes.ADMIN]: "text-purple-500",
    [ActivityEntityTypes.EVENT]: "text-blue-500",
    [ActivityEntityTypes.GALLERY]: "text-pink-500",
    [ActivityEntityTypes.TIMING]: "text-amber-500",
    [ActivityEntityTypes.SUBMISSION]: "text-indigo-500",
    [ActivityEntityTypes.SETTINGS]: "text-gray-500",
    [ActivityEntityTypes.DONATION]: "text-emerald-500",
    [ActivityEntityTypes.TESTIMONIAL]: "text-orange-500",
    [ActivityEntityTypes.CONTACT]: "text-cyan-500",
    [ActivityEntityTypes.VOLUNTEER]: "text-rose-500",
  };
  return colors[entityType] || "text-gray-500";
};

const getEntityIcon = (entityType: string): any => {
  const icons: Record<string, any> = {
    [ActivityEntityTypes.USER]: Users,
    [ActivityEntityTypes.ADMIN]: Shield,
    [ActivityEntityTypes.EVENT]: CalendarDays,
    [ActivityEntityTypes.GALLERY]: GalleryIcon,
    [ActivityEntityTypes.TIMING]: Clock,
    [ActivityEntityTypes.SUBMISSION]: Mail,
    [ActivityEntityTypes.SETTINGS]: Settings,
    [ActivityEntityTypes.DONATION]: Heart,
  };
  return icons[entityType] || FileText;
};

export default function ActivityLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    action: "all",
    entityType: "all",
    search: "",
  });

  const fetchLogs = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await getActivityLogs(currentPage, filters);
      if (result.success) {
        setLogs(result.logs);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ action: "all", entityType: "all", search: "" });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchLogs(true);
  };

  const isValidEntityType = (type: string): boolean => {
    const validTypes = Object.values(ActivityEntityTypes);
    return validTypes.includes(type as any);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0B3C5D]">
            📋 Activity <span className="text-[#D4AF37]">Logs</span>
          </h1>
          <p className="text-sm text-[#555555] mt-1">
            Track all admin activities and changes across the platform
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-[#E5E3DD]/50 text-[#0B3C5D] text-sm font-medium hover:bg-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-5 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
            <input
              type="text"
              placeholder="Search by title or admin name..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 text-[#0B3C5D] placeholder:text-[#555555]/40"
            />
          </div>

          <select
            value={filters.action}
            onChange={(e) => handleFilterChange("action", e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 text-[#0B3C5D] cursor-pointer"
          >
            {actionOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={filters.entityType}
            onChange={(e) => handleFilterChange("entityType", e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 text-[#0B3C5D] cursor-pointer"
          >
            {entityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {(filters.search || filters.action !== 'all' || filters.entityType !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all duration-200 cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Total Records */}
      {!loading && logs.length > 0 && (
        <div className="text-sm text-[#555555]">
          Total: {totalItems} log{totalItems !== 1 ? 's' : ''}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-12 text-center shadow-sm">
          <p className="text-lg text-[#555555]">No activity logs found</p>
          <p className="text-sm text-[#555555]/60 mt-2">
            Activities will appear here as admins perform actions
          </p>
        </div>
      ) : (
        <>
          {/* Logs Timeline */}
          <div className="space-y-4">
            {logs.map((log, index) => {
              const ActionIcon = actionIcons[log.action]?.icon || FileText;
              const iconColor = actionIcons[log.action]?.color || "text-gray-500";
              const iconBg = actionIcons[log.action]?.bg || "bg-gray-100";
              
              const showEntityType = log.entityType && isValidEntityType(log.entityType);
              const entityColor = showEntityType ? getEntityTypeColor(log.entityType) : "text-gray-500";
              const EntityIcon = showEntityType ? getEntityIcon(log.entityType) : FileText;
              const entityLabel = showEntityType ? getEntityTypeLabel(log.entityType) : "";
              
              return (
                <div
                  key={log.id || index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E3DD]/50 p-5 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2.5 rounded-xl ${iconBg}`}>
                      <ActionIcon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#0B3C5D]">
                            {getActionText(log.action)}
                          </span>
                          {log.entityTitle && (
                            <span className="text-sm text-[#555555]">
                              <span className={`font-medium ${entityColor}`}>“{log.entityTitle}”</span>
                            </span>
                          )}
                          {showEntityType && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/10 flex items-center gap-1">
                              <EntityIcon className="w-3 h-3" />
                              {entityLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#555555] shrink-0">
                          <User className="w-3 h-3" />
                          <span className="font-medium">{log.adminName || "Unknown"}</span>
                          <span className="text-[#E5E3DD]">•</span>
                          <span className="capitalize">{log.adminRole === "super_admin" ? "Super Admin" : log.adminRole || "Admin"}</span>
                        </div>
                      </div>
                      
                      {log.details && (
                        <p className="text-sm text-[#555555] mt-1.5">
                          {log.details}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-[#555555]/60">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-[#E5E3DD]/50 text-[#555555] hover:bg-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <span className="text-sm text-[#555555]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-[#E5E3DD]/50 text-[#555555] hover:bg-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}