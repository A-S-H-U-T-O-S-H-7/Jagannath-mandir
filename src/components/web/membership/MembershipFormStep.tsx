// components/join/MembershipFormStep.tsx

'use client';

import { Camera, Upload, Info } from 'lucide-react';
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
import { useLocationData } from '@/hooks/useLocationData';

const inputClass =
  'w-full px-4 py-2.5 text-sm rounded-xl bg-white/80 border border-[#E5E3DD]/50 text-[#0B3C5D] placeholder:text-[#555555]/40 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200';

const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5';

const selectClass = `${inputClass} appearance-none bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B5E5A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat pr-10`;

// ✅ Soft warm gradient card background
const cardClass =
  'rounded-2xl border border-[#E5E3DD]/60 bg-gradient-to-br from-white via-[#FDF8F2] to-[#FFF9F2] p-6 shadow-[0_1px_3px_rgba(11,60,93,0.06)]';

interface MembershipFormStepProps {
  data: MembershipFormData;
  onChange: (patch: Partial<MembershipFormData>) => void;
  onPhotoChange: (file: File) => void;
  onAadhaarFrontChange: (file: File | null) => void;
  onAadhaarBackChange: (file: File | null) => void;
  onPanChange: (file: File | null) => void; // ✅ NEW
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

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="mt-1 h-5 w-1 shrink-0 rounded-full bg-[#D4AF37]" />
      <div>
        <h3 className="text-base font-semibold text-[#0B3C5D]">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-[#555555]">{description}</p> : null}
      </div>
    </div>
  );
}

// ✅ Grade Details Component
function GradeDetails({ grade }: { grade: string }) {
  const selected = getSelectedGrade(grade);
  if (!selected) return null;

  return (
    <div className="mt-2 rounded-xl bg-amber-50/70 border border-amber-200/50 p-3">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-[#0B3C5D]">Benefits included:</p>
          <ul className="mt-1 space-y-0.5">
            {selected.details.map((detail, idx) => (
              <li key={idx} className="text-xs text-[#555555] flex items-start gap-1.5">
                <span className="text-[#D4AF37]">•</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function MembershipFormStep({
  data,
  onChange,
  onPhotoChange,
  onAadhaarFrontChange,
  onAadhaarBackChange,
  onPanChange,
  errors,
}: MembershipFormStepProps) {
  const { countries, states, cities, loading } = useLocationData({
    country: data.country,
    state: data.state,
  });

  const selected = getSelectedGrade(data.membershipType);

  const set = (key: keyof MembershipFormData, value: string) => {
    onChange({ [key]: value });
  };

  const setFromInput = (
    key: keyof MembershipFormData,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    transform: (value: string) => string = (value) => value,
  ) => {
    const input = event.currentTarget;
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;
    const value = transform(input.value);
    const nextSelectionStart = selectionStart === null
      ? null
      : transform(input.value.slice(0, selectionStart)).length;
    const nextSelectionEnd = selectionEnd === null
      ? null
      : transform(input.value.slice(0, selectionEnd)).length;

    set(key, value);

    // React may replace a transformed controlled value and move the caret to
    // the end. Restore it after the updated value has been committed.
    if (nextSelectionStart !== null && nextSelectionEnd !== null) {
      window.requestAnimationFrame(() => {
        if (document.activeElement === input) {
          input.setSelectionRange(nextSelectionStart, nextSelectionEnd);
        }
      });
    }
  };

  const uppercase = (value: string) => value.toUpperCase();
  const digitsOnly = (value: string) => value.replace(/\D/g, '');

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updates: Partial<MembershipFormData> = { [name]: value };

    if (name === 'country') {
      updates.state = '';
      updates.city = '';
    } else if (name === 'state') {
      updates.city = '';
    }

    onChange(updates);
  };

  return (
    <div className="space-y-6">
      {/* Membership & Payment */}
      <section className={cardClass}>
        <SectionHeader title="Membership & Payment" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[180px_1fr]">
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
                className={`${selectClass} normal-case`}
              >
                <option value="">Select membership grade</option>
                {MEMBERSHIP_GRADES.map((grade) => (
                  <option key={grade.sl} value={grade.grade}>
                    {grade.grade} — Rs. {grade.amount.toLocaleString('en-IN')}/-
                  </option>
                ))}
              </select>
            </Field>

            {/* ✅ Grade Details */}
            {data.membershipType && <GradeDetails grade={data.membershipType} />}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Amount (Rs.)">
                <input
                  value={selected ? `${selected.amount.toLocaleString('en-IN')}/-` : ''}
                  readOnly
                  placeholder="Select grade first"
                  className={`${inputClass} bg-[#F9F8F4] cursor-not-allowed`}
                />
              </Field>
              <Field label="Payment Method" required error={errors.paymentMethod}>
                <select
                  value={data.paymentMethod}
                  onChange={(e) => set('paymentMethod', e.target.value as PaymentMethod)}
                  className={`${selectClass} normal-case`}
                >
                  <option value="">Select method</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="DD">Demand Draft (DD)</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </Field>
            </div>

            {(data.paymentMethod === 'Cheque' || data.paymentMethod === 'DD') ? (
              <div className="grid grid-cols-1 gap-4 rounded-xl bg-[#F9F8F4] p-4 sm:grid-cols-3">
                <Field label={`${data.paymentMethod} No.`} required error={errors.chequeOrDdNo}>
                  <input
                    value={data.chequeOrDdNo}
                    onChange={(e) => setFromInput('chequeOrDdNo', e, uppercase)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Bank Name" required error={errors.bankName}>
                  <input
                    value={data.bankName}
                    onChange={(e) => setFromInput('bankName', e, uppercase)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Dated" required error={errors.paymentDate}>
                  <input
                    type="date"
                    value={data.paymentDate}
                    onChange={(e) => set('paymentDate', e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Personal Details - Updated Layout */}
      <section className={cardClass}>
        <SectionHeader title="Personal Details" />
        <div className="space-y-4">
          {/* Title + Full Name in one row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Field label="Title" required error={errors.title}>
              <select
                value={data.title}
                onChange={(e) => set('title', e.target.value as TitleOption)}
                className={selectClass}
              >
                <option value="">Select</option>
                <option value="Mr">Mr.</option>
                <option value="Ms">Ms.</option>
                <option value="Mrs">Mrs.</option>
                <option value="Dr">Dr.</option>
                <option value="Prof">Prof.</option>
              </select>
            </Field>
            <div className="sm:col-span-3">
              <Field label="Full Name (as per Aadhaar)" required error={errors.fullName}>
                <input
                  value={data.fullName}
                  onChange={(e) => setFromInput('fullName', e, uppercase)}
                  className={inputClass}
                  placeholder="Enter your full name as per Aadhaar"
                />
              </Field>
            </div>
          </div>

          {/* Gender + DOB in one row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Gender" required error={errors.gender}>
              <select
                value={data.gender}
                onChange={(e) => set('gender', e.target.value as GenderOption)}
                className={selectClass}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </Field>
            <Field label="Date of Birth" required error={errors.dateOfBirth}>
              <input
                type="date"
                value={data.dateOfBirth}
                onChange={(e) => set('dateOfBirth', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Father + Mother in one row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Father's Name" required error={errors.fatherName}>
              <input
                value={data.fatherName}
                onChange={(e) => setFromInput('fatherName', e, uppercase)}
                className={inputClass}
                placeholder="Enter father's full name"
              />
            </Field>
            <Field label="Mother's Name" required error={errors.motherName}>
              <input
                value={data.motherName}
                onChange={(e) => setFromInput('motherName', e, uppercase)}
                className={inputClass}
                placeholder="Enter mother's full name"
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Complete Address */}
      <section className={cardClass}>
        <SectionHeader title="Complete Address" />
        <div className="space-y-4">
          <Field label="Complete Address" required error={errors.address}>
            <textarea
              rows={3}
              value={data.address}
              onChange={(e) => setFromInput('address', e, uppercase)}
              className={`${inputClass} resize-none`}
              placeholder="Enter your complete address with House No., Street, Area, Landmark"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Country" required error={errors.country}>
              <select
                name="country"
                value={data.country}
                onChange={handleLocationChange}
                className={selectClass}
                disabled={loading.countries}
              >
                <option value="">Select</option>
                {countries.map((country) => (
                  <option key={country.iso2} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="State" required error={errors.state}>
              <select
                name="state"
                value={data.state}
                onChange={handleLocationChange}
                className={selectClass}
                disabled={!states.length || loading.states}
              >
                <option value="">Select</option>
                {states.map((state) => (
                  <option key={state.iso2} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="City" required error={errors.city}>
              <select
                name="city"
                value={data.city}
                onChange={handleLocationChange}
                className={selectClass}
                disabled={!cities.length || loading.cities}
              >
                <option value="">Select</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pin Code" required error={errors.pinCode}>
              <input
                value={data.pinCode}
                maxLength={6}
                onChange={(e) => setFromInput('pinCode', e, digitsOnly)}
                className={inputClass}
                placeholder="6-digit"
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Identity & Contact - Added PAN Number */}
      <section className={cardClass}>
        <SectionHeader title="Identity & Contact" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Aadhaar No." required error={errors.aadhaar}>
            <input
              value={data.aadhaar}
              maxLength={12}
              onChange={(e) => setFromInput('aadhaar', e, digitsOnly)}
              className={inputClass}
              placeholder="12-digit Aadhaar"
            />
          </Field>
          <Field label="PAN No." required error={errors.panNumber}>
            <input
              value={data.panNumber}
              onChange={(e) => setFromInput('panNumber', e, uppercase)}
              className={inputClass}
              placeholder="ABCDE1234F"
            />
          </Field>
          <Field label="Blood Group">
            <select
              value={data.bloodGroup}
              onChange={(e) => set('bloodGroup', e.target.value)}
              className={selectClass}
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
              onChange={(e) => setFromInput('contactNo', e, digitsOnly)}
              className={inputClass}
              placeholder="10-digit"
            />
          </Field>
          <Field label="Email Id" required error={errors.email}>
            <input
              type="email"
              value={data.email}
              onChange={(e) => set('email', e.target.value)}
              className={inputClass}
              placeholder="your@email.com"
            />
          </Field>
        </div>
      </section>

      {/* Additional Details - Added PAN Card Upload */}
      <section className={cardClass}>
        <SectionHeader title="Additional Details" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Qualification">
              <input
                value={data.qualification}
                onChange={(e) => setFromInput('qualification', e, uppercase)}
                className={inputClass}
                placeholder="e.g., B.Tech, M.A."
              />
            </Field>
            <Field label="Occupation">
              <input
                value={data.occupation}
                onChange={(e) => setFromInput('occupation', e, uppercase)}
                className={inputClass}
                placeholder="e.g., Engineer, Teacher"
              />
            </Field>
          </div>

          <Field label="Introducer Name & Details">
            <input
              value={data.introducer}
              onChange={(e) => setFromInput('introducer', e, uppercase)}
              className={inputClass}
              placeholder="Name and membership details of introducer"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Aadhaar Front (optional)">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E5E3DD] bg-white/80 px-4 py-3 text-sm text-[#555555] hover:border-[#D4AF37] transition-colors">
                <Upload className="h-4 w-4 text-[#D4AF37]" />
                <span>{data.aadhaarFrontFile ? data.aadhaarFrontFile.name : 'Upload Aadhaar front'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => onAadhaarFrontChange(e.target.files?.[0] || null)}
                />
              </label>
            </Field>
            <Field label="Aadhaar Back (optional)">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E5E3DD] bg-white/80 px-4 py-3 text-sm text-[#555555] hover:border-[#D4AF37] transition-colors">
                <Upload className="h-4 w-4 text-[#D4AF37]" />
                <span>{data.aadhaarBackFile ? data.aadhaarBackFile.name : 'Upload Aadhaar back'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => onAadhaarBackChange(e.target.files?.[0] || null)}
                />
              </label>
            </Field>
            <Field label="PAN Card Copy (optional)">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E5E3DD] bg-white/80 px-4 py-3 text-sm text-[#555555] hover:border-[#D4AF37] transition-colors">
                <Upload className="h-4 w-4 text-[#D4AF37]" />
                <span>{data.panFile ? data.panFile.name : 'Upload PAN Card'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => onPanChange(e.target.files?.[0] || null)}
                />
              </label>
            </Field>
          </div>
        </div>
      </section>

      {/* Declaration */}
      <section className={cardClass}>
        <SectionHeader
          title="Declaration"
          description="I hereby certify that the above information is correct and complete. If any information given is incorrect, I would be responsible for it."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Place" required error={errors.place}>
            <input
              value={data.place}
              onChange={(e) => setFromInput('place', e, uppercase)}
              className={inputClass}
              placeholder="City/Town"
            />
          </Field>
          <Field label="Date" required error={errors.declarationDate}>
            <input
              type="date"
              value={data.declarationDate}
              onChange={(e) => set('declarationDate', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}
