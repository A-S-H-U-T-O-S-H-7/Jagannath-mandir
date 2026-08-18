'use client';

import { Camera, Upload } from 'lucide-react';
import {
  BLOOD_GROUPS,
  MEMBERSHIP_GRADES,
  getSelectedGrade,
  type MembershipFormData,
  type MembershipGrade,
  type PaymentMethod,
  type TitleOption,
  type GenderOption,
} from '@/lib/constants/membership';

const inputClass =
  'w-full px-4 py-2.5 text-sm rounded-xl bg-white border border-[#E5E3DD]/50 text-[#0B3C5D] placeholder:text-[#555555]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200 uppercase';

const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5';

interface MembershipFormStepProps {
  data: MembershipFormData;
  onChange: (patch: Partial<MembershipFormData>) => void;
  onPhotoChange: (file: File) => void;
  onAadhaarChange: (file: File | null) => void;
  errors: Record<string, string>;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required ? <span className="text-[#D4AF37]">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export default function MembershipFormStep({
  data,
  onChange,
  onPhotoChange,
  onAadhaarChange,
  errors,
}: MembershipFormStepProps) {
  const selected = getSelectedGrade(data.membershipType);

  const set = (key: keyof MembershipFormData, value: string) => {
    onChange({ [key]: value });
  };

  return (
    <div className="space-y-7">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[180px_1fr]">
        <div>
          <label className={labelClass}>
            Passport Photo <span className="text-[#D4AF37]">*</span>
          </label>
          <label className="flex h-[210px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#D4AF37]/40 bg-[#F9F8F4] text-center transition hover:border-[#D4AF37]">
            {data.photoPreview ? (
              <img src={data.photoPreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 px-3 text-[#555555]">
                <Camera className="h-8 w-8 text-[#D4AF37]" />
                <span className="text-xs font-medium">Upload photo</span>
                <span className="text-[10px]">JPG or PNG, max 2MB</span>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPhotoChange(file);
              }}
            />
          </label>
          {errors.photoFile ? <p className="mt-1 text-xs text-red-500">{errors.photoFile}</p> : null}
        </div>

        <div className="space-y-4">
          <Field label="Grade of Membership" required error={errors.membershipType}>
            <select
              value={data.membershipType}
              onChange={(e) => set('membershipType', e.target.value as MembershipGrade)}
              className={`${inputClass} normal-case`}
            >
              <option value="">Select membership grade</option>
              {MEMBERSHIP_GRADES.map((grade) => (
                <option key={grade.sl} value={grade.grade}>
                  {grade.grade} — Rs. {grade.amountLabel}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Amount (Rs.)">
              <input
                value={selected?.amountLabel || ''}
                readOnly
                placeholder="Select grade first"
                className={`${inputClass} bg-[#F9F8F4]`}
              />
            </Field>
            <Field label="Payment Method" required error={errors.paymentMethod}>
              <select
                value={data.paymentMethod}
                onChange={(e) => set('paymentMethod', e.target.value as PaymentMethod)}
                className={`${inputClass} normal-case`}
              >
                <option value="">Select method</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="DD">Demand Draft (DD)</option>
              </select>
            </Field>
          </div>
          {data.paymentMethod && data.paymentMethod !== 'Cash' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label={`${data.paymentMethod} No.`} required error={errors.chequeOrDdNo}>
                <input
                  value={data.chequeOrDdNo}
                  onChange={(e) => set('chequeOrDdNo', e.target.value.toUpperCase())}
                  className={inputClass}
                />
              </Field>
              <Field label="Bank Name" required error={errors.bankName}>
                <input
                  value={data.bankName}
                  onChange={(e) => set('bankName', e.target.value.toUpperCase())}
                  className={inputClass}
                />
              </Field>
              <Field label="Dated" required error={errors.paymentDate}>
                <input
                  type="date"
                  value={data.paymentDate}
                  onChange={(e) => set('paymentDate', e.target.value)}
                  className={`${inputClass} normal-case`}
                />
              </Field>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-[#D4AF37]" />
          <h3 className="text-base font-semibold text-[#0B3C5D]">Personal Details</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" required error={errors.title}>
            <div className="flex gap-3">
              {(['Mr', 'Ms'] as TitleOption[]).map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => set('title', title)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                    data.title === title
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#0B3C5D]'
                      : 'border-[#E5E3DD] bg-white text-[#555555]'
                  }`}
                >
                  {title}.
                </button>
              ))}
            </div>
          </Field>
          <Field label="Gender" required error={errors.gender}>
            <div className="flex gap-3">
              {([
                { id: 'M', label: 'Male' },
                { id: 'F', label: 'Female' },
              ] as { id: GenderOption; label: string }[]).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => set('gender', item.id)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                    data.gender === item.id
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#0B3C5D]'
                      : 'border-[#E5E3DD] bg-white text-[#555555]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="First Name" required error={errors.firstName}>
            <input
              value={data.firstName}
              onChange={(e) => set('firstName', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
          <Field label="Middle Name">
            <input
              value={data.middleName}
              onChange={(e) => set('middleName', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
          <Field label="Last Name" required error={errors.lastName}>
            <input
              value={data.lastName}
              onChange={(e) => set('lastName', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Date of Birth" required error={errors.dateOfBirth}>
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
            className={`${inputClass} max-w-xs normal-case`}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-[#D4AF37]" />
          <h3 className="text-base font-semibold text-[#0B3C5D]">Parent Details</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Father First Name" required error={errors.fatherFirstName}>
            <input
              value={data.fatherFirstName}
              onChange={(e) => set('fatherFirstName', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
          <Field label="Father Middle Name">
            <input
              value={data.fatherMiddleName}
              onChange={(e) => set('fatherMiddleName', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
          <Field label="Father Last Name" required error={errors.fatherLastName}>
            <input
              value={data.fatherLastName}
              onChange={(e) => set('fatherLastName', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Mother First Name">
            <input
              value={data.motherFirstName}
              onChange={(e) => set('motherFirstName', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
          <Field label="Mother Middle Name">
            <input
              value={data.motherMiddleName}
              onChange={(e) => set('motherMiddleName', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
          <Field label="Mother Last Name">
            <input
              value={data.motherLastName}
              onChange={(e) => set('motherLastName', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-[#D4AF37]" />
          <h3 className="text-base font-semibold text-[#0B3C5D]">Address & Contact</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_160px]">
          <Field label="Address" required error={errors.address}>
            <textarea
              rows={3}
              value={data.address}
              onChange={(e) => set('address', e.target.value.toUpperCase())}
              className={`${inputClass} resize-none`}
            />
          </Field>
          <Field label="Pin Code" required error={errors.pinCode}>
            <input
              value={data.pinCode}
              maxLength={6}
              onChange={(e) => set('pinCode', e.target.value.replace(/\D/g, ''))}
              className={`${inputClass} normal-case`}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Aadhaar No." required error={errors.aadhaar}>
            <input
              value={data.aadhaar}
              maxLength={12}
              onChange={(e) => set('aadhaar', e.target.value.replace(/\D/g, ''))}
              className={`${inputClass} normal-case`}
            />
          </Field>
          <Field label="Blood Group">
            <select
              value={data.bloodGroup}
              onChange={(e) => set('bloodGroup', e.target.value)}
              className={`${inputClass} normal-case`}
            >
              <option value="">Select</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Contact No." required error={errors.contactNo}>
            <input
              value={data.contactNo}
              maxLength={10}
              onChange={(e) => set('contactNo', e.target.value.replace(/\D/g, ''))}
              className={`${inputClass} normal-case`}
            />
          </Field>
          <Field label="Email Id" required error={errors.email}>
            <input
              type="email"
              value={data.email}
              onChange={(e) => set('email', e.target.value)}
              className={`${inputClass} normal-case`}
            />
          </Field>
          <Field label="Qualification">
            <input
              value={data.qualification}
              onChange={(e) => set('qualification', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
          <Field label="Occupation">
            <input
              value={data.occupation}
              onChange={(e) => set('occupation', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Introducer Name & Details">
          <input
            value={data.introducer}
            onChange={(e) => set('introducer', e.target.value.toUpperCase())}
            className={inputClass}
          />
        </Field>
        <Field label="Aadhaar Copy (optional)">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E5E3DD] bg-white px-4 py-3 text-sm text-[#555555] hover:border-[#D4AF37]">
            <Upload className="h-4 w-4 text-[#D4AF37]" />
            <span>{data.aadhaarFile ? data.aadhaarFile.name : 'Upload Aadhaar PDF or image'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => onAadhaarChange(e.target.files?.[0] || null)}
            />
          </label>
        </Field>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-[#D4AF37]" />
          <h3 className="text-base font-semibold text-[#0B3C5D]">Declaration</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Place" required error={errors.place}>
            <input
              value={data.place}
              onChange={(e) => set('place', e.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>
          <Field label="Date" required error={errors.declarationDate}>
            <input
              type="date"
              value={data.declarationDate}
              onChange={(e) => set('declarationDate', e.target.value)}
              className={`${inputClass} normal-case`}
            />
          </Field>
        </div>
        <p className="text-sm leading-relaxed text-[#555555]">
          I hereby certify that the above information is correct and complete. If any information
          given is incorrect, I would be responsible for it.
        </p>
      </section>
    </div>
  );
}
