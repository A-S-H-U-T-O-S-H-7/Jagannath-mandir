// app/join-as-member/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Printer,
  Users,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  emptyMembershipForm,
  type MembershipFormData,
} from '@/lib/constants/membership';
import { submitMembershipApplication } from '@/lib/services/membershipService';
import MembershipFormStep from './MembershipFormStep';
import MembershipPreview from './MembershipPreview';

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
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<MembershipFormData>(emptyMembershipForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitMembershipApplication(form);
      if (!result.success || !result.id) {
        throw new Error(result.error || 'Unable to submit application');
      }
      setSubmittedId(result.id);
      toast.success(
        form.paymentMethod === 'Online Payment'
          ? 'Application submitted. Online payment will be available soon.'
          : 'Application submitted successfully',
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to submit application';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOnlinePayment = () => {
    toast('Online payment integration will be available soon.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8]">
      <div className="fixed top-0 right-0 h-96 w-96 pointer-events-none rounded-full bg-[#D4AF37]/5 blur-3xl" />
      <div className="fixed bottom-0 left-0 h-80 w-80 pointer-events-none rounded-full bg-[#0B3C5D]/5 blur-3xl" />

      <div className="relative mx-auto max-w-8xl px-4 py-4 sm:px-6 md:py-8 lg:px-10">
        <div className="no-print mb-6">
          <button
            onClick={() => (step === 2 && !submittedId ? setStep(1) : router.back())}
            className="group flex items-center gap-2 rounded-xl border border-[#E5E3DD]/50 bg-white/80 px-4 py-2 text-[#555555] shadow-sm backdrop-blur-sm transition hover:border-[#D4AF37]/30 hover:text-[#0B3C5D]"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium">{step === 2 && !submittedId ? 'Back to form' : 'Back'}</span>
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

        {!submittedId ? (
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
            key={submittedId ? 'done' : step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {submittedId ? (
              <div className="no-print mx-auto mb-8 max-w-xl rounded-2xl border border-[#E5E3DD]/50 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#0B3C5D]/20">
                  <CheckCircle className="h-10 w-10 text-[#D4AF37]" />
                </div>
                <h3 className="mb-2 font-serif text-2xl font-bold text-[#0B3C5D]">
                  Application Submitted
                </h3>
                <p className="mb-2 text-sm leading-relaxed text-[#555555]">
                  Thank you for applying to Samudayik Vikas Samiti. Our office will review your
                  membership form and contact you.
                </p>
                <p className="mb-6 text-xs text-[#555555]">Reference ID: {submittedId}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E5E3DD] bg-white px-5 py-2.5 text-sm font-semibold text-[#0B3C5D]"
                  >
                    <Printer className="h-4 w-4" />
                    Print form
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="rounded-xl bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-[#0B3C5D]"
                  >
                    Back to home
                  </button>
                </div>
              </div>
            ) : null}

            {step === 1 && !submittedId ? (
              <div className="mx-auto max-w-4xl rounded-2xl border border-[#E5E3DD]/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl md:p-8">
                <MembershipFormStep
                  data={form}
                  errors={errors}
                  onChange={patchForm}
                  onPhotoChange={handlePhoto}
                  onAadhaarChange={(file) => patchForm({ aadhaarFile: file })}
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
            ) : (
              <MembershipPreview
                data={form}
                onSubmit={handleSubmit}
                onOnlinePayment={handleOnlinePayment}
                submitting={submitting}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
