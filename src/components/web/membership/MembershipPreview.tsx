'use client';

import { useEffect, useRef, useState } from 'react';
import { Printer, Send } from 'lucide-react';
import {
  MEMBERSHIP_GRADES,
  MEMBERSHIP_INFO_POINTS,
  formatDateParts,
  getSelectedGrade,
  type MembershipFormData,
} from '@/lib/constants/membership';

const LOGO = '/mandir-logo.png';
const SHEET_FONT = "'Times New Roman', Times, Georgia, serif";

function Tick({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex h-[13px] w-[13px] items-center justify-center rounded-full border border-[#0B3C5D] ${
        checked ? 'bg-[#0B3C5D]' : 'bg-white'
      }`}
    />
  );
}

function DottedValue({
  value,
  minWidth = '140px',
  className = 'uppercase',
}: {
  value: string;
  minWidth?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-block border-b border-dotted border-[#0B3C5D] px-1 text-[13px] font-semibold ${className}`}
      style={{ minWidth }}
    >
      {value || '\u00A0'}
    </span>
  );
}

// Scales the fixed-width document down to fit narrower screens (phones,
// tablets) while keeping the printed layout pixel-for-pixel intact.
// At print time the scale is neutralized so the real page size is used.
function ScaledDocument({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [boxSize, setBoxSize] = useState<{ width?: number; height?: number }>({});

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const compute = () => {
      const naturalWidth = inner.scrollWidth;
      const naturalHeight = inner.scrollHeight;
      const available = outer.clientWidth;
      if (!naturalWidth || !available) return;
      const nextScale = Math.min(1, available / naturalWidth);
      setScale(nextScale);
      // Shrink the wrapper's own box to match the scaled content so it can
      // be centered by its parent, instead of leaving a dead gap on the right.
      setBoxSize({ width: naturalWidth * nextScale, height: naturalHeight * nextScale });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(outer);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [children]);

  return (
    <div ref={outerRef} className="flex w-full justify-center">
      <div style={boxSize} className="print:!h-auto print:!w-auto">
        <div
          ref={innerRef}
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 'max-content' }}
          className="print:!scale-100"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Pill({ label, checked }: { label: string; checked: boolean }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
        checked
          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#0B3C5D]'
          : 'border-[#0B3C5D]/15 text-[#8a8a8a]'
      }`}
    >
      {label}
    </span>
  );
}

function DetailItem({
  label,
  value,
  span = 1,
  className = 'uppercase',
}: {
  label: string;
  value: string;
  span?: 1 | 2 | 4;
  className?: string;
}) {
  const spanClass = span === 4 ? 'col-span-4' : span === 2 ? 'col-span-2' : 'col-span-1';
  return (
    <div className={`${spanClass} px-4 py-3`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">{label}</p>
      <p className={`mt-0.5 text-[13px] font-semibold text-[#0B3C5D] ${className}`}>{value || '\u00A0'}</p>
    </div>
  );
}

function PageBadge({ label }: { label: string }) {
  return (
    <span className="no-print absolute -top-3 left-6 rounded-full bg-[#0B3C5D] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
      {label}
    </span>
  );
}

function SheetFrame({
  children,
  pageLabel,
  breakAfter,
}: {
  children: React.ReactNode;
  pageLabel: string;
  breakAfter?: boolean;
}) {
  return (
    <div className={`relative ${breakAfter ? 'print:break-after-page' : ''}`}>
      <PageBadge label={pageLabel} />
      <div
        className="mx-auto w-full max-w-[820px] overflow-hidden rounded-lg border border-[#E5E3DD] bg-white/95 px-6 py-5 text-[#0B3C5D] shadow-[0_8px_30px_rgba(11,60,93,0.08)] sm:px-8 sm:py-6 print:rounded-none print:border-0 print:shadow-none"
        style={{ fontFamily: SHEET_FONT }}
      >
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

export default function MembershipPreview({
  data,
  onSubmit,
  onOnlinePayment,
  submitting = false,
}: {
  data: MembershipFormData;
  onSubmit?: () => void | Promise<void>;
  onOnlinePayment?: () => void;
  submitting?: boolean;
}) {
  const grade = getSelectedGrade(data.membershipType);
  const dob = formatDateParts(data.dateOfBirth);
  const declared = formatDateParts(data.declarationDate);
  const payDate = formatDateParts(data.paymentDate);
  const amountLabel = grade ? `${grade.amount.toLocaleString('en-IN')}/-` : '';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      {/* On-screen context header — not printed */}
      <div className="no-print text-center sm:text-center">
        <h2 className="text-lg font-semibold text-[#0B3C5D]">Application Preview</h2>
        <p className="mt-1 text-sm text-[#555555]">
          Review the two pages below exactly as they will be printed, then submit your application.
        </p>
      </div>

      <div className="rounded-2xl bg-[#F4F1EA] p-4 sm:p-8">
        <ScaledDocument>
          <div className="w-[820px] space-y-8">
            {/* Page 1 - Application Form */}
            <SheetFrame pageLabel="Page 1 of 2" breakAfter>
              <div className="flex items-start gap-3">
                <img src={LOGO} alt="Sri Jagannath Samiti" className="h-[72px] w-[72px] flex-shrink-0 object-contain" />
                <div className="flex-1 pt-1 text-center">
                  <h2 className="text-[22px] font-bold text-[#0B3C5D] underline underline-offset-4">
                    Membership Application Form
                  </h2>
                  <p className="mt-1 text-[11px] text-[#555555] italic">
                    (All the information must be filled in Capital letter. Please read the information
                    overleaf. Tick whichever is applicable.)
                  </p>
                </div>
                <div className="h-[72px] w-[72px] flex-shrink-0 rounded-full bg-[#F9F8F4] overflow-hidden border border-[#E5E3DD]">
                  {data.photoPreview ? (
                    <img src={data.photoPreview} alt="Applicant" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-[#555555]">
                      Photo
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-start justify-between gap-6">
                <div className="text-[13px] leading-5 text-[#0B3C5D]">
                  <p>To</p>
                  <p className="font-bold">President,</p>
                  <p className="font-bold">Samudayik Vikas Samiti,</p>
                  <p>C-316 B&amp;C, Sector-10, Noida, G B Nagar, UP.</p>
                </div>
              </div>

              <p className="mt-5 text-[13px] text-[#0B3C5D]">Dear Sir/Madam,</p>
              <p className="mt-2 text-[13px] leading-7 text-[#0B3C5D]">
                I request you to enroll me as{' '}
                <DottedValue value={data.membershipType} minWidth="160px" /> member of Indian Sri
                Jagannath Samiti Society.
              </p>
              <p className="text-[13px] leading-7 text-[#0B3C5D]">
                I am enclosing/paying Rs. <DottedValue value={amountLabel} minWidth="110px" /> through{' '}
                <span className="inline-flex items-center gap-1">
                  <Tick checked={data.paymentMethod === 'Cash'} /> Cash
                </span>{' '}
                /{' '}
                <span className="inline-flex items-center gap-1">
                  <Tick checked={data.paymentMethod === 'Cheque'} /> Cheque
                </span>{' '}
                /{' '}
                <span className="inline-flex items-center gap-1">
                  <Tick checked={data.paymentMethod === 'DD'} /> DD No.
                </span>{' '}
                /{' '}
                <span className="inline-flex items-center gap-1">
                  <Tick checked={data.paymentMethod === 'Online Payment'} /> Online Payment
                </span>{' '}
                <DottedValue value={data.chequeOrDdNo} minWidth="90px" /> of{' '}
                <DottedValue value={data.bankName} minWidth="130px" /> bank, dated{' '}
                <DottedValue
                  value={payDate.dd ? `${payDate.dd}/${payDate.mm}/${payDate.yyyy}` : ''}
                  minWidth="90px"
                />
                .
              </p>
              <p className="mt-1 text-[13px] leading-6 text-[#0B3C5D]">
                I am enclosing two copies of passport size photograph and attested Xerox copy of my
                aadhaar card. Following are my details:
              </p>

              <div className="mt-4 space-y-3 text-[13px] text-[#0B3C5D]">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span>Title:</span>
                    <span className="inline-flex items-center gap-1.5">
                      Mr. <Tick checked={data.title === 'Mr'} />
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      Ms. <Tick checked={data.title === 'Ms'} />
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      Mrs. <Tick checked={data.title === 'Mrs'} />
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      Dr. <Tick checked={data.title === 'Dr'} />
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      Prof. <Tick checked={data.title === 'Prof'} />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Gender:</span>
                    <span className="inline-flex items-center gap-1.5">
                      Male <Tick checked={data.gender === 'Male'} />
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      Female <Tick checked={data.gender === 'Female'} />
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      Others <Tick checked={data.gender === 'Others'} />
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-[100px] flex-shrink-0">Name:</span>
                  <span className="flex-1 border-b border-dotted border-[#0B3C5D] px-2 text-[13px] font-semibold uppercase">
                    {data.fullName || '\u00A0'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-[100px] flex-shrink-0">Date of Birth:</span>
                  <span className="border-b border-dotted border-[#0B3C5D] px-2 text-[13px] font-semibold">
                    {dob.dd ? `${dob.dd}/${dob.mm}/${dob.yyyy}` : '\u00A0'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-[100px] flex-shrink-0">Father's Name:</span>
                  <span className="flex-1 border-b border-dotted border-[#0B3C5D] px-2 text-[13px] font-semibold uppercase">
                    {data.fatherName || '\u00A0'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-[100px] flex-shrink-0">Mother's Name:</span>
                  <span className="flex-1 border-b border-dotted border-[#0B3C5D] px-2 text-[13px] font-semibold uppercase">
                    {data.motherName || '\u00A0'}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <span className="w-[100px] flex-shrink-0 pt-1">Address:</span>
                  <div className="min-h-[48px] flex-1 border-b border-dotted border-[#0B3C5D] pb-1 text-[13px] font-semibold uppercase leading-6">
                    {data.address || '\u00A0'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    Country <DottedValue value={data.country} minWidth="170px" />
                  </div>
                  <div>
                    State <DottedValue value={data.state} minWidth="120px" />
                  </div>
                  <div>
                    City <DottedValue value={data.city} minWidth="170px" />
                  </div>
                  <div>
                    Pin Code <DottedValue value={data.pinCode} minWidth="120px" />
                  </div>
                  <div>
                    Aadhaar No. <DottedValue value={data.aadhaar} minWidth="170px" />
                  </div>
                  <div>
                    Blood Group <DottedValue value={data.bloodGroup} minWidth="80px" />
                  </div>
                  <div>
                    Contact No. <DottedValue value={data.contactNo} minWidth="150px" />
                  </div>
                  <div>
                    Email Id. <DottedValue value={data.email} minWidth="170px" className="normal-case" />
                  </div>
                  <div>
                    Qualification <DottedValue value={data.qualification} minWidth="140px" />
                  </div>
                  <div>
                    Occupation <DottedValue value={data.occupation} minWidth="140px" />
                  </div>
                </div>

                <div>
                  Introducer Name &amp; Details:{' '}
                  <DottedValue value={data.introducer} minWidth="70%" />
                </div>
              </div>

              <div className="mt-6 text-center">
                <h3 className="text-[15px] font-bold text-[#0B3C5D] underline underline-offset-4">DECLARATION</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#0B3C5D]">
                  I hereby certify that the above information is correct and complete. If any information
                  given is incorrect, I would be responsible for it.
                </p>
              </div>

              <div className="mt-8 flex items-end justify-between gap-4">
                <div className="flex items-end gap-2">
                  <span className="mb-4">Date:</span>
                  <span className="border-b border-dotted border-[#0B3C5D] px-2 text-[13px] font-semibold">
                    {declared.dd ? `${declared.dd}/${declared.mm}/${declared.yyyy}` : '\u00A0'}
                  </span>
                </div>
                <div className="w-[180px]">
                  <span>Place:</span>
                  <div className="mt-1 flex h-8 items-center border border-[#0B3C5D] px-2 text-[13px] font-semibold uppercase">
                    {data.place || '\u00A0'}
                  </div>
                </div>
                <div className="w-[180px] text-center">
                  <div className="flex h-10 items-end justify-center border-b border-[#0B3C5D] pb-1">
                    <span className="text-[16px] italic font-semibold uppercase tracking-wide text-[#0B3C5D]">
                      {data.fullName || '\u00A0'}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] font-semibold text-[#0B3C5D]">Signature</p>
                </div>
              </div>
            </SheetFrame>

            {/* Page 2 - Membership Information */}
            <SheetFrame pageLabel="Page 2 of 2">
              <div className="flex items-start gap-3">
                <img src={LOGO} alt="Sri Jagannath Samiti" className="h-[72px] w-[72px] flex-shrink-0 object-contain" />
                <div className="flex-1 pt-2 text-center">
                  <h2 className="text-[22px] font-bold text-[#0B3C5D] uppercase underline underline-offset-4">
                    Membership Information
                  </h2>
                </div>
                <div className="h-[72px] w-[72px] flex-shrink-0" />
              </div>

              <div className="mt-8 overflow-hidden">
                <table className="mx-auto w-[92%] border-collapse text-[14px]">
                  <thead>
                    <tr className="bg-[#F5F0EA]">
                      <th className="border border-[#0B3C5D] px-3 py-2 font-bold text-[#0B3C5D]">Sl.No.</th>
                      <th className="border border-[#0B3C5D] px-3 py-2 font-bold text-[#0B3C5D]">Grade of Membership</th>
                      <th className="border border-[#0B3C5D] px-3 py-2 font-bold text-[#0B3C5D]">Amount in Rs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEMBERSHIP_GRADES.map((row) => {
                      const selected = row.grade === data.membershipType;
                      return (
                        <tr key={row.sl} className={selected ? 'bg-[#D4AF37]/10' : undefined}>
                          <td className="border border-[#0B3C5D] px-3 py-2 text-center text-[#0B3C5D]">{row.sl}.</td>
                          <td className="border border-[#0B3C5D] px-3 py-2 text-[#0B3C5D]">
                            {row.grade}
                            {selected ? '  ✓' : ''}
                          </td>
                          <td className="border border-[#0B3C5D] px-3 py-2 text-right text-[#0B3C5D]">
                            {row.amount.toLocaleString('en-IN')}/-
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <ul className="mx-auto mt-8 w-[92%] space-y-3 text-[13px] leading-6 text-[#0B3C5D]">
                {MEMBERSHIP_INFO_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-block h-3.5 w-3.5 flex-shrink-0 border border-[#0B3C5D] bg-white" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mx-auto mt-10 w-[92%] border-t border-[#0B3C5D] pt-4">
                <p className="text-[14px] font-bold text-[#0B3C5D]">For office Use Only</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] text-[#0B3C5D]">
                  <span>Grade of Membership:</span>
                  <div className="h-8 min-w-[260px] flex-1 border border-[#0B3C5D]" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-6 text-[13px] text-[#0B3C5D]">
                  <div className="flex items-center gap-2">
                    <span>Date:</span>
                    <div className="flex h-8 items-center border border-[#0B3C5D] px-3 text-[#555555]">
                      DD \ MM \ YYYY
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 text-[13px] text-[#0B3C5D]">
                  <span>ID Card No. :</span>
                  <div className="h-8 min-w-[220px] flex-1 border border-[#0B3C5D]" />
                </div>
              </div>

              <div className="mt-16 flex items-end justify-between px-4">
                <div className="w-[180px] text-center">
                  <div className="h-10 border-b border-[#0B3C5D]" />
                  <p className="mt-1 text-[13px] font-bold leading-4 text-[#0B3C5D]">
                    Signature
                    <br />
                    Treasurer
                  </p>
                </div>
                <div className="w-[180px] text-center">
                  <div className="h-10 border-b border-[#0B3C5D]" />
                  <p className="mt-1 text-[13px] font-bold text-[#0B3C5D]">President</p>
                </div>
              </div>
            </SheetFrame>
          </div>
        </ScaledDocument>
      </div>

      {/* Actions — hidden when printing */}
      <div className="no-print sticky bottom-4 z-20 flex flex-col items-center gap-3 rounded-2xl border border-[#E5E3DD] bg-white/95 p-4 shadow-[0_8px_30px_rgba(11,60,93,0.12)] backdrop-blur sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0B3C5D]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B3C5D] transition hover:border-[#0B3C5D]/40 hover:bg-[#F9F8F4] sm:w-auto"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
        {data.paymentMethod === 'Online Payment' ? (
          <button
            type="button"
            onClick={onOnlinePayment}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37] bg-[#FFF8DE] px-5 py-2.5 text-sm font-semibold text-[#0B3C5D] transition hover:bg-[#FBEFC1] sm:w-auto"
          >
            <Send className="h-4 w-4" />
            Pay Online (Coming Soon)
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B3C5D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B3C5D]/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Send className="h-4 w-4" />
          {submitting ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
}
