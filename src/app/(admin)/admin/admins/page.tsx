// app/admin/admins/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  User,
  Mail,
  MoreVertical,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  adminAuth as auth,
  adminCreationAuth,
  adminDb as db,
} from '@/lib/firebase/config';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc 
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  inMemoryPersistence,
  onAuthStateChanged,
  setPersistence,
  signOut,
} from 'firebase/auth';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { ActivityActions, ActivityEntityTypes } from '@/lib/services/activityLogService';
import PermissionModal from '@/components/admin/admins/PermissionModal';

interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'super_admin' | 'admin';
  permissions: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export default function AdminsPage() {
  const router = useRouter();
  const { log } = useActivityLogger();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState('');

  useEffect(() => {
    let isMounted = true;

    const checkCurrentUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/admin/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!isMounted) return;

        if (!userDoc.exists()) {
          router.replace('/admin/login');
          return;
        }

        const data = userDoc.data();
        if (data.role !== 'super_admin') {
          toast.error('Only Super Admins can manage admins');
          router.replace('/admin/dashboard');
          return;
        }

        setCurrentUserRole('super_admin');
        setCurrentUser(user);
        await fetchAdmins(() => isMounted);
      } catch (error) {
        console.error('Error checking user:', error);
        if (isMounted) router.replace('/admin/login');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, () => {
      void checkCurrentUser();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  const fetchAdmins = async (canUpdate: () => boolean = () => true) => {
    if (canUpdate()) setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const snapshot = await getDocs(q);
      
      const adminList: AdminUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === 'admin' || data.role === 'super_admin') {
          adminList.push({
            uid: doc.id,
            email: data.email || '',
            displayName: data.displayName || 'Admin',
            photoURL: data.photoURL || null,
            role: data.role || 'admin',
            permissions: data.permissions || [],
            isActive: data.isActive !== false,
            createdBy: data.createdBy || '',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
            lastLogin: data.lastLogin || '',
          });
        }
      });
      
      if (canUpdate()) setAdmins(adminList);
    } catch (error) {
      console.error('Error fetching admins:', error);
      if (canUpdate()) toast.error('Failed to load admins');
    } finally {
      if (canUpdate()) setLoading(false);
    }
  };

  const handleCreateAdmin = async (data: any) => {
    try {
      // Create user in Firebase Auth
      await setPersistence(adminCreationAuth, inMemoryPersistence);
      const userCredential = await createUserWithEmailAndPassword(
        adminCreationAuth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // Create user document in Firestore
      const userData = {
        uid: user.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: null,
        role: data.role || 'admin',
        permissions: data.role === 'super_admin' ? [] : data.permissions,
        isActive: true,
        createdBy: currentUser?.uid || 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      await log({
        action: ActivityActions.CREATE,
        entityType: ActivityEntityTypes.ADMIN,
        entityId: user.uid,
        entityTitle: data.displayName,
        details: `Created new ${data.role} admin: ${data.displayName} (${data.email})`,
      });

      toast.success(`Admin ${data.displayName} created successfully!`);
      fetchAdmins();
      setModalOpen(false);
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin');
    } finally {
      if (adminCreationAuth.currentUser) {
        await signOut(adminCreationAuth);
      }
    }
  };

  const handleUpdateAdmin = async (data: any) => {
    if (!editingAdmin) return;

    try {
      const userRef = doc(db, 'users', editingAdmin.uid);
      
      const updateData: any = {
        displayName: data.displayName,
        role: data.role,
        permissions: data.role === 'super_admin' ? [] : data.permissions,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userRef, updateData);

      // Update password if provided
      if (data.password && data.password.length > 0) {
        // You would need to handle this via admin SDK or custom API
        toast('Password updates are not available in this version');
      }

      await log({
        action: ActivityActions.UPDATE,
        entityType: ActivityEntityTypes.ADMIN,
        entityId: editingAdmin.uid,
        entityTitle: data.displayName,
        details: `Updated admin: ${data.displayName} (${editingAdmin.email})`,
      });

      toast.success(`Admin ${data.displayName} updated successfully!`);
      fetchAdmins();
      setModalOpen(false);
      setEditingAdmin(null);
    } catch (error: any) {
      console.error('Error updating admin:', error);
      toast.error(error.message || 'Failed to update admin');
    }
  };

  const handleToggleActive = async (admin: AdminUser) => {
    try {
      const userRef = doc(db, 'users', admin.uid);
      await updateDoc(userRef, {
        isActive: !admin.isActive,
        updatedAt: new Date().toISOString(),
      });

      await log({
        action: ActivityActions.STATUS_CHANGE,
        entityType: ActivityEntityTypes.ADMIN,
        entityId: admin.uid,
        entityTitle: admin.displayName,
        details: `${admin.isActive ? 'Deactivated' : 'Activated'} admin: ${admin.displayName}`,
      });

      toast.success(`${admin.displayName} ${admin.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchAdmins();
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    const result = await Swal.fire({
      title: 'Delete this admin?',
      text: `${admin.displayName} will lose access to the admin panel. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete admin',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#0B3C5D',
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', admin.uid));

      // Delete from Firebase Auth (requires admin SDK - will be handled server-side)
      // For now, just remove from Firestore

      await log({
        action: ActivityActions.DELETE,
        entityType: ActivityEntityTypes.ADMIN,
        entityId: admin.uid,
        entityTitle: admin.displayName,
        details: `Deleted admin: ${admin.displayName} (${admin.email})`,
      });

      toast.success(`${admin.displayName} deleted successfully`);
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    }
  };

  const openCreateModal = () => {
    setEditingAdmin(null);
    setModalOpen(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setModalOpen(true);
  };

  const filteredAdmins = admins.filter(admin =>
    admin.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border-2 border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#0B3C5D]">
              Admin <span className="text-[#D4AF37]">Management</span>
            </h1>
            <p className="text-sm text-[#555555] mt-1">
              Manage administrators and their permissions
            </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B3C5D] font-semibold hover:bg-[#E8C84A] transition-all duration-200 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 rounded-xl p-4 border border-[#E5E3DD]/50">
          <p className="text-sm text-[#555555]">Total Admins</p>
          <p className="text-2xl font-bold text-[#0B3C5D]">{admins.length}</p>
        </div>
        <div className="bg-white/80 rounded-xl p-4 border border-[#E5E3DD]/50">
          <p className="text-sm text-[#555555]">Super Admins</p>
          <p className="text-2xl font-bold text-[#D4AF37]">
            {admins.filter(a => a.role === 'super_admin').length}
          </p>
        </div>
        <div className="bg-white/80 rounded-xl p-4 border border-[#E5E3DD]/50">
          <p className="text-sm text-[#555555]">Admins</p>
          <p className="text-2xl font-bold text-[#0B3C5D]">
            {admins.filter(a => a.role === 'admin').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search admins by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[#E5E3DD]/50 bg-white/50 text-[#0B3C5D] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 placeholder:text-[#555555]/40"
        />
      </div>

      {/* Table */}
      {filteredAdmins.length === 0 ? (
        <div className="bg-white/80 rounded-2xl p-12 text-center border border-[#E5E3DD]/50">
          <p className="text-lg text-[#555555]">No admins found</p>
          <p className="text-sm text-[#555555]/60 mt-2">
            {searchTerm ? 'Try adjusting your search' : 'Click "Add Admin" to create one'}
          </p>
        </div>
      ) : (
        <div className="bg-white/80 rounded-2xl border border-[#E5E3DD]/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E3DD]/50 bg-[#F9F8F4]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#555555] uppercase tracking-wider">Admin</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#555555] uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#555555] uppercase tracking-wider">Permissions</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#555555] uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#555555] uppercase tracking-wider">Created</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#555555] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E3DD]/30">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.uid} className="hover:bg-[#D4AF37]/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                          admin.role === 'super_admin' 
                            ? 'bg-[#D4AF37] text-[#0B3C5D]' 
                            : 'bg-[#0B3C5D] text-white'
                        }`}>
                          {admin.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0B3C5D]">{admin.displayName}</p>
                          <p className="text-xs text-[#555555]">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        admin.role === 'super_admin'
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                          : 'bg-[#0B3C5D]/10 text-[#0B3C5D]'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {admin.role === 'super_admin' ? (
                        <span className="text-xs text-[#555555]">Full Access</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.slice(0, 2).map((perm) => (
                            <span key={perm} className="text-[10px] px-1.5 py-0.5 rounded bg-[#E5E3DD]/30 text-[#555555] capitalize">
                              {perm}
                            </span>
                          ))}
                          {admin.permissions.length > 2 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E5E3DD]/30 text-[#555555]">
                              +{admin.permissions.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        admin.isActive ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {admin.isActive ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#555555]">
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-1.5 rounded-lg hover:bg-[#D4AF37]/10 text-[#555555] hover:text-[#D4AF37] transition-colors cursor-pointer"
                          title="Edit Admin"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(admin)}
                          className={`p-1.5 rounded-lg hover:bg-[#D4AF37]/10 transition-colors cursor-pointer ${
                            admin.isActive ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'
                          }`}
                          title={admin.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {admin.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#555555] hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Admin"
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
      )}

      {/* Permission Modal */}
      <PermissionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAdmin(null);
        }}
        onSave={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}
        editingAdmin={editingAdmin}
        isSuperAdmin={currentUserRole === 'super_admin'}
      />
    </div>
  );
}
