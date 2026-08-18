'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, BadgeCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import {
  getAllMembershipApplications,
  type MembershipApplication,
} from '@/lib/services/membershipService';

export default function MembersPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/admin/login');
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists() || !['admin', 'super_admin'].includes(userDoc.data().role)) {
        router.push('/admin/login');
        return;
      }
      await fetchData();
    };
    load();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    const result = await getAllMembershipApplications();
    if (result.success) {
      setApplications(result.applications);
    } else {
      toast.error(result.error || 'Failed to load applications');
    }
    setLoading(false);
  };

  return (
    <div className="py-4">
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#555555] hover:text-[#0B3C5D]"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-[#0B3C5D]">
            <BadgeCheck className="h-6 w-6 text-[#D4AF37]" />
            Membership Applications
          </h1>
          <p className="mt-1 text-sm text-[#555555]">{applications.length} received</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E5E3DD] bg-white px-4 py-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E3DD] bg-white">
        {loading ? (
          <p className="p-8 text-center text-sm text-[#555555]">Loading…</p>
        ) : applications.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#555555]">No applications yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F9F8F4] text-xs uppercase tracking-wider text-[#555555]">
                <tr>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item.id} className="border-t border-[#E5E3DD]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-[#F5E6B8]" />
                        )}
                        <div>
                          <p className="font-semibold text-[#0B3C5D]">{item.fullName || '—'}</p>
                          <p className="text-xs text-[#555555]">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#0B3C5D]">{item.membershipType}</td>
                    <td className="px-4 py-3 text-[#0B3C5D]">{item.contactNo}</td>
                    <td className="px-4 py-3 text-[#555555]">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#D4AF37]/20 px-2 py-1 text-xs font-semibold text-[#0B3C5D]">
                        {item.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
