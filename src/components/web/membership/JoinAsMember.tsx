// app/join-as-member/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  Users,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  emptyMembershipForm,
  getMembershipRenewalDetails,
  getSelectedGrade,
  type MembershipFormData,
} from '@/lib/constants/membership';
import {
  createMembershipRenewal,
  getMembershipApplicationById,
  getLatestMembershipByUser,
  submitMembershipApplication,
  type MembershipApplication,
} from '@/lib/services/membershipService';
import useAuthStore from '@/lib/store/authStore';
import MembershipFormStep from './MembershipFormStep';
import MembershipPreview from './MembershipPreview';

function redirectToCCAvenue(paymentUrl: string, encRequest: string, accessCode: string) {
  const paymentForm = document.createElement('form');
  paymentForm.method = 'POST';
  paymentForm.action = paymentUrl;
  paymentForm.style.display = 'none';

  for (const [name, value] of Object.entries({ encRequest, access_code: accessCode })) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    paymentForm.appendChild(input);
  }

  document.body.appendChild(paymentForm);
  paymentForm.submit();
}

function validateForm(data: MembershipFormData) {
  const errors: Record<string, string> = {};
  if (!data.photoFile) errors.photoFile = 'Please upload your passport photo';
  if (!data.membershipType) errors.membershipType = 'Please select a membership grade';
  if (!data.paymentMethod) errors.paymentMethod = 'Please select a payment method';
  if (data.paymentMethod === 'Cheque' || data.paymentMethod === 'DD') {
    if (!data.chequeOrDdNo) errors.chequeOrDdNo = 'Required';
    if (!data.bankName) errors.bankName = 'Required';
    if (!data.paymentDate) errors.paymentDate = 'Required';
  }
  if (!data.title) errors.title = 'Required';
  if (!data.gender) errors.gender = 'Required';
  if (!data.fullName.trim()) errors.fullName = 'Required';
  if (!data.dateOfBirth) errors.dateOfBirth = 'Required';
  else if (new Date(data.dateOfBirth) >= new Date()) errors.dateOfBirth = 'Date of birth must be in the past';
  if (!data.fatherName.trim()) errors.fatherName = 'Required';
  if (!data.motherName.trim()) errors.motherName = 'Required';
  if (!data.address.trim()) errors.address = 'Required';
  else if (data.address.trim().length < 10) errors.address = 'Enter a complete address';
  if (!data.country) errors.country = 'Required';
  if (!data.state) errors.state = 'Required';
  if (!data.city) errors.city = 'Required';
  if (!/^\d{6}$/.test(data.pinCode)) errors.pinCode = 'Enter a valid 6-digit pin code';
  if (!/^\d{12}$/.test(data.aadhaar)) errors.aadhaar = 'Enter a valid 12-digit Aadhaar number';
  // ✅ PAN Number validation
  if (!data.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber)) {
    errors.panNumber = 'Enter a valid PAN number (e.g., ABCDE1234F)';
  }
  if (!/^\d{10}$/.test(data.contactNo)) errors.contactNo = 'Enter a valid 10-digit mobile number';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email';
  if (!data.place.trim()) errors.place = 'Required';
  if (!data.declarationDate) errors.declarationDate = 'Required';
  else if (new Date(data.declarationDate) > new Date()) errors.declarationDate = 'Declaration date cannot be in the future';
  return errors;
}

export default function JoinAsMember() {
  const router = useRouter();
  const { user, loading: authLoading, initialize } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<MembershipFormData>(emptyMembershipForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState('');
  const [existingMembership, setExistingMembership] = useState<MembershipApplication | null>(null);
  const [loadingExistingMembership, setLoadingExistingMembership] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/signup');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    let cancelled = false;

    const loadMembership = async () => {
      if (authLoading) return;

      // This legacy key was shared by every account in the browser and could
      // expose the previous user's membership after logout.
      window.localStorage.removeItem('membershipApplicationId');

      if (!user) {
        setExistingMembership(null);
        setLoadingExistingMembership(false);
        return;
      }

      setLoadingExistingMembership(true);
      const storageKey = `membershipApplicationId:${user.uid}`;
      const storedApplicationId = window.localStorage.getItem(storageKey);
      if (storedApplicationId) {
        const stored = await getMembershipApplicationById(storedApplicationId);
        const storedBelongsToUser = Boolean(
          stored.application
          && (
            stored.application.userId === user.uid
            || (user.email && stored.application.email?.trim().toLowerCase() === user.email.trim().toLowerCase())
          ),
        );
        if (!cancelled && stored.success && stored.application && storedBelongsToUser) {
          setExistingMembership(stored.application);
          setLoadingExistingMembership(false);
          return;
        }
        window.localStorage.removeItem(storageKey);
      }
      const result = await getLatestMembershipByUser(user.email, user.uid);
      if (!cancelled) {
        setExistingMembership(result.application);
        setLoadingExistingMembership(false);
      }
    };
    void loadMembership();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  useEffect(() => {
    return () => {
      if (form.photoPreview) URL.revokeObjectURL(form.photoPreview);
    };
  }, [form.photoPreview]);

  const patchForm = (patch: Partial<MembershipFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handlePhoto = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be under 2MB');
      return;
    }
    if (form.photoPreview) URL.revokeObjectURL(form.photoPreview);
    patchForm({ photoFile: file, photoPreview: URL.createObjectURL(file) });
    setErrors((prev) => ({ ...prev, photoFile: '' }));
  };

  // ✅ NEW: Handle PAN Card upload
  const handlePanChange = (file: File | null) => {
    patchForm({ panFile: file });
  };

  const handleAadhaarFrontChange = (file: File | null) => {
    patchForm({ aadhaarFrontFile: file });
  };

  const handleAadhaarBackChange = (file: File | null) => {
    patchForm({ aadhaarBackFile: file });
  };

  const goNext = () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error('Please fill all required fields');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startOnlinePayment = async (application: {
    id: string; amount: number; membershipType: string; fullName: string; email: string; contactNo: string;
    address: string; city: string; state: string; pinCode: string; country: string;
  }) => {
    const paymentResponse = await fetch('/api/payment/ccavenue-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: application.id,
        purpose: `Membership: ${application.membershipType}`,
        amount: application.amount,
        name: application.fullName.trim(),
        email: application.email.trim(),
        phone: application.contactNo.replace(/\D/g, ''),
        address: application.address.trim(),
        city: application.city,
        state: application.state,
        pincode: application.pinCode.trim(),
        country: application.country,
        donor_type: 'indian',
      }),
    });
    const paymentResponseText = await paymentResponse.text();
    let payment: { status?: boolean; encRequest?: string; access_code?: string; paymentUrl?: string; errors?: string[] };
    try {
      payment = JSON.parse(paymentResponseText);
    } catch {
      throw new Error('Unable to start payment. Please try again.');
    }
    if (!paymentResponse.ok || !payment.status || !payment.encRequest || !payment.access_code || !payment.paymentUrl) {
      throw new Error(payment.errors?.[0] || 'Unable to start payment');
    }
    redirectToCCAvenue(payment.paymentUrl, payment.encRequest, payment.access_code);
  };

  const handleRenewal = async () => {
    if (!existingMembership) return;
    setRenewing(true);
    try {
      const renewal = await createMembershipRenewal(existingMembership);
      if (!renewal.success || !renewal.id || !renewal.amount) throw new Error(renewal.error || 'Unable to start renewal');
      if (user) {
        window.localStorage.setItem(`membershipApplicationId:${user.uid}`, renewal.id);
      }
      await startOnlinePayment({
        id: renewal.id,
        amount: renewal.amount,
        membershipType: existingMembership.membershipType,
        fullName: existingMembership.fullName,
        email: existingMembership.email,
        contactNo: existingMembership.contactNo,
        address: existingMembership.address || '',
        city: existingMembership.city || '',
        state: existingMembership.state || '',
        pinCode: existingMembership.pinCode || '',
        country: existingMembership.country || 'India',
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unable to start renewal');
      setRenewing(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let applicationId = pendingPaymentId;

      if (!applicationId) {
        const result = await submitMembershipApplication(form);
        if (!result.success || !result.id) {
          throw new Error(result.error || 'Unable to submit application');
        }
        applicationId = result.id;
        if (user) {
          window.localStorage.setItem(`membershipApplicationId:${user.uid}`, applicationId);
        }
        if (form.paymentMethod === 'Online Payment') {
          setPendingPaymentId(applicationId);
        }
      }

      if (form.paymentMethod === 'Online Payment') {
        await startOnlinePayment({
          id: applicationId,
          amount: getSelectedGrade(form.membershipType)?.amount || 0,
          membershipType: form.membershipType,
          fullName: form.fullName,
          email: form.email,
          contactNo: form.contactNo,
          address: form.address,
          city: form.city,
          state: form.state,
          pinCode: form.pinCode,
          country: form.country,
        });
        return;
      }

      setExistingMembership({
        ...form,
        id: applicationId,
        fullName: form.fullName,
        email: form.email,
        contactNo: form.contactNo,
        membershipType: form.membershipType,
        membershipAmount: getSelectedGrade(form.membershipType)?.amount || 0,
        status: 'pending',
        paymentStatus: 'not_applicable',
        createdAt: new Date().toISOString(),
      });
      toast.success('Application submitted successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to submit application';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renewalDetails = existingMembership ? getMembershipRenewalDetails(existingMembership.membershipType) : null;
  const renewalAvailableAt = renewalDetails && existingMembership
    ? new Date(new Date(existingMembership.createdAt).getTime() + renewalDetails.intervalMs)
    : null;
  const renewalAvailable = Boolean(
    existingMembership?.status === 'approved' && renewalDetails && renewalAvailableAt && now >= renewalAvailableAt.getTime(),
  );
  const membershipPlan = existingMembership ? getSelectedGrade(existingMembership.membershipType) : null;

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]">
      <div className="fixed top-0 right-0 h-96 w-96 pointer-events-none rounded-full bg-[#D4AF37]/5 blur-3xl" />
      <div className="fixed bottom-0 left-0 h-80 w-80 pointer-events-none rounded-full bg-[#0B3C5D]/5 blur-3xl" />

      <div className="relative mx-auto max-w-8xl px-4 py-4 sm:px-6 md:py-8 lg:px-10">
        <div className="no-print mb-6">
          <button
            onClick={() => (step === 2 && !existingMembership ? setStep(1) : router.back())}
            className="group flex items-center gap-2 rounded-xl border border-[#E5E3DD]/50 bg-white/80 px-4 py-2 text-[#555555] shadow-sm backdrop-blur-sm transition hover:border-[#D4AF37]/30 hover:text-[#0B3C5D]"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium">{step === 2 && !existingMembership ? 'Back to form' : 'Back'}</span>
          </button>
        </div>

        <div className="no-print mb-8 text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#0B3C5D] shadow-sm backdrop-blur-sm">
            <Users className="h-3.5 w-3.5 text-[#D4AF37]" />
            Samudayik Vikas Samiti
          </span>
          <h1 className="mb-3 font-serif text-3xl font-bold leading-tight text-[#0B3C5D] md:text-5xl">
            Join as <span className="text-[#D4AF37]">Member</span>
          </h1>
          <p className="mb-3 font-serif text-xl font-semibold tracking-wide text-[#D4AF37] md:text-2xl">
            Shree Swarna Khetra
          </p>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-[#555555]">
            Fill your details in step 1. On Next, your photo and information will appear on the
            official membership application form.
          </p>
          <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-[#D4AF37]" />
        </div>

        {!existingMembership && !loadingExistingMembership ? (
          <div className="no-print mx-auto mb-8 flex max-w-md items-center gap-3">
            {[
              { id: 1, label: 'Fill Details' },
              { id: 2, label: 'Preview Form' },
            ].map((item, index) => (
              <div key={item.id} className="flex flex-1 items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      step === item.id
                        ? 'bg-[#D4AF37] text-[#0B3C5D]'
                        : step > item.id
                          ? 'bg-[#0B3C5D] text-white'
                          : 'bg-white text-[#555555] border border-[#E5E3DD]'
                    }`}
                  >
                    {step > item.id ? <CheckCircle className="h-4 w-4" /> : item.id}
                  </div>
                  <span className="text-sm font-medium text-[#0B3C5D]">{item.label}</span>
                </div>
                {index === 0 ? <div className="h-px flex-1 bg-[#E5E3DD]" /> : null}
              </div>
            ))}
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={existingMembership ? 'membership' : step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {loadingExistingMembership ? (
              <div className="mx-auto flex max-w-xl justify-center rounded-2xl border border-[#E5E3DD] bg-white/80 p-8"><span className="text-sm text-[#555555]">Loading membership details…</span></div>
            ) : existingMembership ? (
              <div className="mx-auto max-w-3xl rounded-2xl border border-[#D4AF37]/30 bg-white/90 p-6 shadow-xl backdrop-blur-xl md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">Your membership</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#0B3C5D]">{existingMembership.membershipType}</h2><p className="mt-1 text-sm text-[#555555]">Application reference: {existingMembership.id}</p></div>
                  <span className="rounded-full bg-[#0B3C5D]/10 px-3 py-1 text-xs font-semibold uppercase text-[#0B3C5D]">{existingMembership.status}</span>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#F9F8F4] p-3"><p className="text-[11px] uppercase text-[#555555]">Plan amount</p><p className="mt-1 font-semibold text-[#0B3C5D]">₹{Number(existingMembership.membershipAmount).toLocaleString('en-IN')}</p></div><div className="rounded-xl bg-[#F9F8F4] p-3"><p className="text-[11px] uppercase text-[#555555]">Payment</p><p className="mt-1 font-semibold text-[#0B3C5D]">{existingMembership.paymentStatus || 'not applicable'}</p></div><div className="rounded-xl bg-[#F9F8F4] p-3"><p className="text-[11px] uppercase text-[#555555]">Member ID</p><p className="mt-1 font-semibold text-[#0B3C5D]">{existingMembership.memberId || 'Issued after approval'}</p></div></div>
                {membershipPlan?.details?.length ? <ul className="mt-5 space-y-1 text-sm text-[#555555]">{membershipPlan.details.map((detail) => <li key={detail}>• {detail}</li>)}</ul> : null}
                {renewalDetails ? <div className="mt-6 rounded-xl border border-[#D4AF37]/25 bg-[#FFF8DE] p-4"><p className="font-semibold text-[#0B3C5D]">Renewal</p><p className="mt-1 text-sm text-[#555555]">{renewalDetails.label}. {renewalAvailableAt ? `Available ${renewalAvailable ? 'now' : `on ${renewalAvailableAt.toLocaleString('en-IN')}`}.` : ''}</p><button type="button" onClick={handleRenewal} disabled={!renewalAvailable || renewing} className="mt-3 rounded-xl bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{renewing ? 'Opening payment…' : `Renew for ₹${renewalDetails.amount.toLocaleString('en-IN')}`}</button></div> : null}
                {existingMembership.status !== 'approved' ? <p className="mt-5 text-sm text-amber-700">Your application must be approved before renewal becomes available.</p> : null}
              </div>
            ) : null}

            {!existingMembership && !loadingExistingMembership && step === 1 ? (
              <div className="mx-auto max-w-4xl rounded-2xl border border-[#E5E3DD]/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl md:p-8">
                <MembershipFormStep
                  data={form}
                  errors={errors}
                  onChange={patchForm}
                  onPhotoChange={handlePhoto}
                  onAadhaarFrontChange={handleAadhaarFrontChange}
                  onAadhaarBackChange={handleAadhaarBackChange}
                  onPanChange={handlePanChange} // ✅ Added missing prop
                />
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3 text-sm font-bold text-[#0B3C5D] shadow-md transition hover:bg-[#E8C84A]"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : !existingMembership && !loadingExistingMembership ? (
                <MembershipPreview
                  data={form}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
