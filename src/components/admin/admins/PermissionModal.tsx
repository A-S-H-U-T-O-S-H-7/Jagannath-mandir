// components/admin/admins/PermissionModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  Mail, 
  Shield, 
  CheckCircle,
  LayoutDashboard,
  CalendarDays,
  Image,
  Mail as MailIcon,
  Heart,
  Star,
  Users,
  UserCog,
  Eye,
  Settings,
  Loader2,
  HelpCircle,
} from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  editingAdmin?: any;
  isSuperAdmin: boolean;
}

const permissionGroups = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'View dashboard overview',
  },
  {
    id: 'events',
    label: 'Events',
    icon: CalendarDays,
    description: 'Manage events (add/edit/delete)',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: Image,
    description: 'Manage gallery images (upload/delete)',
  },
  {
    id: 'darshan',
    label: 'Darshan',
    icon: Eye,
    description: 'Manage darshan images, videos and rituals',
  },
  {
    id: 'contact',
    label: 'Contact Requests',
    icon: MailIcon,
    description: 'View and manage contact-form messages',
  },
  {
    id: 'donations',
    label: 'Donations',
    icon: Heart,
    description: 'View donation records',
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    icon: Star,
    description: 'Manage testimonials',
  },
  {
    id: 'faq',
    label: 'FAQs',
    icon: HelpCircle,
    description: 'Manage frequently asked questions',
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    description: 'View registered users',
  },
  {
    id: 'admins',
    label: 'Admins',
    icon: UserCog,
    description: 'Manage admin users',
  },
  {
    id: 'activity',
    label: 'Activity Logs',
    icon: Eye,
    description: 'View activity logs',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Manage site settings',
  },
];

export default function PermissionModal({
  isOpen,
  onClose,
  onSave,
  editingAdmin,
  isSuperAdmin,
}: PermissionModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    password: '',
    role: 'admin',
    permissions: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAdmin) {
      setFormData({
        email: editingAdmin.email || '',
        displayName: editingAdmin.displayName || '',
        password: '',
        role: editingAdmin.role || 'admin',
        permissions: editingAdmin.permissions || [],
      });
    } else {
      setFormData({
        email: '',
        displayName: '',
        password: '',
        role: 'admin',
        permissions: [],
      });
    }
  }, [editingAdmin]);

  if (!isOpen) return null;

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.displayName) newErrors.displayName = 'Name is required';
    if (!editingAdmin && !formData.password) newErrors.password = 'Password is required';
    if (formData.role === 'admin' && formData.permissions.length === 0) {
      newErrors.permissions = 'Please select at least one permission';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-[#0B3C5D] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#D4AF37]/20">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white">
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
              </h2>
              <p className="text-xs text-white/60">
                {editingAdmin ? 'Update admin details and permissions' : 'Create a new admin account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border ${
                      errors.displayName ? 'border-red-500' : 'border-[#E5E3DD]/50'
                    } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200`}
                    placeholder="Admin Name"
                  />
                </div>
                {errors.displayName && (
                  <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border ${
                      errors.email ? 'border-red-500' : 'border-[#E5E3DD]/50'
                    } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200`}
                    placeholder="admin@email.com"
                    disabled={!!editingAdmin}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
                {editingAdmin && (
                  <p className="text-xs text-[#555555]/60 mt-1">Email cannot be changed</p>
                )}
              </div>
            </div>

            {/* Password (only for new admins) */}
            {!editingAdmin && (
              <div>
                <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border ${
                      errors.password ? 'border-red-500' : 'border-[#E5E3DD]/50'
                    } bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200`}
                    placeholder="Create a secure password"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-[#0B3C5D] mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    formData.role === 'admin'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0B3C5D]'
                      : 'border-[#E5E3DD]/50 text-[#555555] hover:border-[#D4AF37]/50'
                  }`}
                >
                  <Shield className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium block">Admin</span>
                  <span className="text-xs text-[#555555]">Limited access</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'super_admin' })}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    formData.role === 'super_admin'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0B3C5D]'
                      : 'border-[#E5E3DD]/50 text-[#555555] hover:border-[#D4AF37]/50'
                  }`}
                >
                  <Shield className="w-5 h-5 mx-auto mb-1 text-[#D4AF37]" />
                  <span className="text-sm font-medium block">Super Admin</span>
                  <span className="text-xs text-[#555555]">Full access</span>
                </button>
              </div>
            </div>

            {/* Permissions (only for admin role) */}
            {formData.role === 'admin' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-[#0B3C5D]">
                    Permissions <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-[#555555]">
                    {formData.permissions.length} selected
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                  {permissionGroups.map((perm) => {
                    const isChecked = formData.permissions.includes(perm.id);
                    const Icon = perm.icon;
                    
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => handlePermissionToggle(perm.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                          isChecked
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-[#E5E3DD]/50 hover:border-[#D4AF37]/30'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${
                          isChecked ? 'bg-[#D4AF37] text-[#0B3C5D]' : 'bg-[#E5E3DD]/30 text-[#555555]'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            isChecked ? 'text-[#0B3C5D]' : 'text-[#555555]'
                          }`}>
                            {perm.label}
                          </p>
                          <p className="text-xs text-[#555555]/60">
                            {perm.description}
                          </p>
                        </div>
                        {isChecked && (
                          <CheckCircle className="w-4 h-4 text-[#D4AF37] ml-auto flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.permissions && (
                  <p className="text-red-500 text-xs mt-2">{errors.permissions}</p>
                )}
              </div>
            )}

            {formData.role === 'super_admin' && (
              <div className="p-4 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-center">
                <Shield className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                <p className="text-sm text-[#0B3C5D] font-medium">Super Admin</p>
                <p className="text-xs text-[#555555]">
                  Super admins have full access to all features and cannot have permissions restricted.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#E5E3DD]/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E3DD]/50 text-[#555555] hover:bg-[#F9F8F4] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] transition-all duration-200 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingAdmin ? 'Update Admin' : 'Create Admin'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
