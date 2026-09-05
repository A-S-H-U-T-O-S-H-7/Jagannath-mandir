'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  BadgeCheck,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  Phone,
  User,
  FileText,
  IdCard,
  ExternalLink,
  Loader2,
  Pencil,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { adminAuth as auth, adminDb as db } from '@/lib/firebase/adminConfig';
import { doc, getDoc } from 'firebase/firestore';
import {
  getAllMembershipApplications,
  markMembershipVerificationEmailFailed,
  markMembershipVerificationEmailSent,
  updateMembershipStatus,
  type MembershipApplication,
  type MembershipStatus,
} from '@/lib/services/membershipService';
import { sendVerificationEmail } from '@/lib/services/emailService';
import MemberEditModal from '@/components/admin/members/MemberEditModal';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const paymentStatusStyles: Record<string, string> = {
  paid: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
};

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[#555555]/70">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-[#0B3C5D] break-words">{String(value)}</p>
    </div>
  );
}

export default function MembersPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | MembershipStatus>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<MembershipApplication | null>(null);

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

  const counts = useMemo(() => ({
    all: applications.length,
    pending: applications.filter((item) => (item.status || 'pending') === 'pending').length,
    approved: applications.filter((item) => item.status === 'approved').length,
    rejected: applications.filter((item) => item.status === 'rejected').length,
  }), [applications]);

  const visible = applications.filter((item) =>
    filter === 'all' ? true : (item.status || 'pending') === filter
  );

  const handleStatus = async (item: MembershipApplication, status: MembershipStatus) => {
    if (updatingId) return;
    const actionLabel = status === 'approved' ? 'Approve' : 'Reject';
    setUpdatingId(item.id);
    try {
      const result = await Swal.fire({
        title: `${actionLabel} this application?`,
        text:
          status === 'approved'
            ? `${item.fullName} will be marked as a temple member.`
            : `${item.fullName}'s application will be declined.`,
        icon: status === 'approved' ? 'question' : 'warning',
        showCancelButton: true,
        confirmButtonColor: status === 'approved' ? '#0B3C5D' : '#c2410c',
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Yes, ${actionLabel.toLowerCase()}`,
      });

      if (!result.isConfirmed) return;

      const updated = await updateMembershipStatus(item.id, status, auth.currentUser?.email || '');
      if (updated.success) {
        toast.success(`Application ${status}`);
        void fetchData();

        // Do not keep the admin waiting on the external email/PDF provider.
        // This is fired once after the member ID and approved status are saved.
        if (updated.shouldSendVerificationEmail) {
          void sendVerificationEmail({
            name: item.fullName,
            email: item.email,
            memberId: updated.memberId || item.memberId || item.id,
            memberSince: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
            membershipPlan: item.membershipType,
            bloodGroup: item.bloodGroup,
            location: [item.city, item.state].filter(Boolean).join(', '),
            photoUrl: item.photoUrl,
          }).then(async (emailSent) => {
            if (!emailSent) {
              await markMembershipVerificationEmailFailed(item.id);
              toast.error('Member approved, but the verification email could not be sent.');
              return;
            }
            const marked = await markMembershipVerificationEmailSent(item.id);
            if (!marked.success) console.error('Unable to record verification email:', marked.error);
          }).catch(async (error) => {
            await markMembershipVerificationEmailFailed(item.id);
            console.error('Verification email error:', error);
          });
        }
      } else {
        toast.error(updated.error || 'Unable to update application');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignMemberId = async (item: MembershipApplication) => {
    setUpdatingId(item.id);
    const updated = await updateMembershipStatus(item.id, 'approved', auth.currentUser?.email || '');
    setUpdatingId(null);
    if (updated.success) {
      toast.success('Member ID assigned');
      fetchData();
    } else {
      toast.error(updated.error || 'Unable to assign Member ID');
    }
  };

  return (
    <div className="py-4">
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#555555] hover:text-[#0B3C5D]"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-[#0B3C5D]">
            <BadgeCheck className="h-6 w-6 text-[#D4AF37]" />
            Membership Applications
          </h1>
          <p className="mt-1 text-sm text-[#555555]">
            Open a card to see full details. Pending applications can be approved or rejected here.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E5E3DD] bg-white px-4 py-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {([
          { id: 'pending', label: `Pending (${counts.pending})` },
          { id: 'approved', label: `Approved (${counts.approved})` },
          { id: 'rejected', label: `Rejected (${counts.rejected})` },
          { id: 'all', label: `All (${counts.all})` },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              filter === tab.id
                ? 'bg-[#0B3C5D] text-white'
                : 'border border-[#E5E3DD] bg-white text-[#555555] hover:bg-[#F9F8F4]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="rounded-2xl border border-[#E5E3DD] bg-white p-8 text-center text-sm text-[#555555]">
          Loading…
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-[#E5E3DD] bg-white p-8 text-center text-sm text-[#555555]">
          No {filter === 'all' ? '' : filter} applications.
        </p>
      ) : (
        <div className="space-y-4">
          {visible.map((item) => {
            const status = item.status || 'pending';
            const isOpen = expandedId === item.id;
            const canApprove = item.paymentMethod !== 'Online Payment' || item.paymentStatus === 'paid';
            const amount = item.membershipAmount
              ? `₹${Number(item.membershipAmount).toLocaleString('en-IN')}`
              : '';

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#E5E3DD] bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt=""
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#F5E6B8] text-[#0B3C5D]">
                      <User className="h-7 w-7" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#0B3C5D]">
                        {item.title ? `${item.title} ` : ''}
                        {item.fullName || '—'}
                      </h2>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${statusStyles[status] || statusStyles.pending}`}>
                        {status}
                      </span>
                      {item.paymentMethod === 'Online Payment' ? (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${paymentStatusStyles[item.paymentStatus || 'pending'] || paymentStatusStyles.pending}`}>
                          Payment: {item.paymentStatus || 'pending'}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#555555]">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> {item.email || '—'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {item.contactNo || '—'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#0B3C5D]">
                      {item.membershipType || '—'} {amount ? `· ${amount}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {status === 'pending' && (
                      <>
                        {canApprove ? (
                          <button
                            disabled={updatingId === item.id}
                            onClick={() => handleStatus(item, 'approved')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B3C5D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#062A42] disabled:opacity-50"
                          >
                            {updatingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} {updatingId === item.id ? 'Approving…' : 'Approve'}
                          </button>
                        ) : (
                          <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Awaiting payment</span>
                        )}
                        <button
                          disabled={updatingId === item.id}
                          onClick={() => handleStatus(item, 'rejected')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {updatingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />} {updatingId === item.id ? 'Updating…' : 'Reject'}
                        </button>
                      </>
                    )}
                    {status === 'rejected' && (
                      <button
                        disabled={updatingId === item.id}
                        onClick={() => handleStatus(item, 'approved')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B3C5D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#062A42] disabled:opacity-50"
                      >
                        {updatingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} {updatingId === item.id ? 'Approving…' : 'Approve'}
                      </button>
                    )}
                    {status === 'approved' && !item.memberId ? (
                      <button
                        disabled={updatingId === item.id}
                        onClick={() => handleAssignMemberId(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/50 bg-[#FFF8DE] px-3 py-2 text-xs font-semibold text-[#0B3C5D] disabled:opacity-50"
                      >
                        <IdCard className="h-3.5 w-3.5" /> Assign Member ID
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => setEditingMember(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/50 bg-[#FFF8DE] px-3 py-2 text-xs font-semibold text-[#0B3C5D] disabled:opacity-50"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setExpandedId(isOpen ? null : item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E3DD] px-3 py-2 text-xs font-semibold text-[#0B3C5D] hover:bg-[#F9F8F4]"
                    >
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {isOpen ? 'Hide details' : 'View all details'}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-[#E5E3DD] bg-[#F9F8F4] p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Detail label="Gender" value={item.gender} />
                      <Detail label="Member ID" value={item.memberId} />
                      <Detail label="Membership grade" value={item.membershipType} />
                      <Detail label="Membership amount" value={item.membershipAmount ? `₹${Number(item.membershipAmount).toLocaleString('en-IN')}` : ''} />
                      <Detail label="Full name" value={`${item.title || ''} ${item.fullName || ''}`.trim()} />
                      <Detail label="Email" value={item.email} />
                      <Detail label="Date of birth" value={item.dateOfBirth} />
                      <Detail label="Blood group" value={item.bloodGroup} />
                      <Detail label="Father's name" value={item.fatherName} />
                      <Detail label="Mother's name" value={item.motherName} />
                      <Detail label="Aadhaar" value={item.aadhaar} />
                      <Detail label="PAN" value={item.panNumber} />
                      <Detail label="Qualification" value={item.qualification} />
                      <Detail label="Occupation" value={item.occupation} />
                      <Detail label="Introducer" value={item.introducer} />
                      <Detail
                        label="Address"
                        value={[item.address, item.city, item.state, item.country, item.pinCode]
                          .filter(Boolean)
                          .join(', ')}
                      />
                      <Detail label="Payment method" value={item.paymentMethod} />
                      <Detail label="Payment status" value={item.paymentStatus} />
                      <Detail label="Transaction ID" value={item.transactionId} />
                      <Detail label="Cheque / DD no." value={item.chequeOrDdNo} />
                      <Detail label="Bank name" value={item.bankName} />
                      <Detail label="Payment date" value={item.paymentDate} />
                      <Detail label="Place" value={item.place} />
                      <Detail label="Declaration date" value={item.declarationDate} />
                    </div>

                    {(item.photoUrl || item.aadhaarFrontUrl || item.aadhaarBackUrl || item.aadhaarUrl || item.panUrl) && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        {item.photoUrl && (
                          <a
                            href={item.photoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E3DD] bg-white px-3 py-2 text-xs font-semibold text-[#0B3C5D]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Open photo
                          </a>
                        )}
                        {item.aadhaarFrontUrl && (
                          <a
                            href={item.aadhaarFrontUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E3DD] bg-white px-3 py-2 text-xs font-semibold text-[#0B3C5D]"
                          >
                            <FileText className="h-3.5 w-3.5" /> Open Aadhaar front
                          </a>
                        )}
                        {item.aadhaarBackUrl && (
                          <a
                            href={item.aadhaarBackUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E3DD] bg-white px-3 py-2 text-xs font-semibold text-[#0B3C5D]"
                          >
                            <FileText className="h-3.5 w-3.5" /> Open Aadhaar back
                          </a>
                        )}
                        {item.aadhaarUrl && (
                          <a
                            href={item.aadhaarUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E3DD] bg-white px-3 py-2 text-xs font-semibold text-[#0B3C5D]"
                          >
                            <FileText className="h-3.5 w-3.5" /> Open Aadhaar (legacy)
                          </a>
                        )}
                        {item.panUrl && (
                          <a
                            href={item.panUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E3DD] bg-white px-3 py-2 text-xs font-semibold text-[#0B3C5D]"
                          >
                            <FileText className="h-3.5 w-3.5" /> Open PAN
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {editingMember ? <MemberEditModal member={editingMember} onClose={() => setEditingMember(null)} onSaved={() => { setEditingMember(null); void fetchData(); }} /> : null}
    </div>
  );
}
