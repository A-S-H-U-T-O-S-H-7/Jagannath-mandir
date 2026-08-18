'use client';

import {
  MEMBERSHIP_GRADES,
  MEMBERSHIP_INFO_POINTS,
  formatDateParts,
  getSelectedGrade,
  type MembershipFormData,
} from '@/lib/constants/membership';

const LOGO = '/jagannath-samiti-logo.svg';
const SHEET_FONT = "'Times New Roman', Times, Georgia, serif";

function Tick({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex h-[13px] w-[13px] items-center justify-center rounded-full border border-black ${
        checked ? 'bg-black' : 'bg-white'
      }`}
    />
  );
}

function NameBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-8 items-center border border-black px-2 text-[13px] font-semibold uppercase tracking-wide">
        {value || '\u00A0'}
      </div>
      <span className="mt-0.5 text-center text-[9px] tracking-widest text-gray-500">{label}</span>
    </div>
  );
}

function DateBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-7 min-w-[42px] items-center justify-center border border-black px-1.5 text-[12px] font-semibold">
        {value || '\u00A0'}
      </div>
      <span className="mt-0.5 text-[9px] tracking-widest text-gray-500">{label}</span>
    </div>
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
      className={`inline-block border-b border-dotted border-black px-1 text-[13px] font-semibold ${className}`}
      style={{ minWidth }}
    >
      {value || '\u00A0'}
    </span>
  );
}

function SheetFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="membership-sheet relative mx-auto w-full max-w-[820px] overflow-hidden border border-black bg-white px-6 py-5 text-black shadow-xl sm:px-8 sm:py-6"
      style={{ fontFamily: SHEET_FONT }}
    >
      <img
        src={LOGO}
        alt=""
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function MembershipPreview({ data }: { data: MembershipFormData }) {
  const grade = getSelectedGrade(data.membershipType);
  const dob = formatDateParts(data.dateOfBirth);
  const declared = formatDateParts(data.declarationDate);
  const payDate = formatDateParts(data.paymentDate);
  const amountLabel = grade?.amountLabel || '';

  return (
    <div className="space-y-8 overflow-x-auto pb-2">
      <div className="min-w-[720px] space-y-8">
      <SheetFrame>
        <div className="flex items-start gap-3">
          <img src={LOGO} alt="Sri Jagannath Samiti" className="h-[72px] w-[72px] flex-shrink-0" />
          <div className="flex-1 pt-1 text-center">
            <h2 className="text-[22px] font-bold underline underline-offset-4">
              Membership Application Form
            </h2>
            <p className="mt-1 text-[11px] italic">
              (All the information must be filled in Capital letter. Please read the information
              overleaf. Tick whichever is applicable.)
            </p>
          </div>
          <div className="h-[72px] w-[72px] flex-shrink-0" />
        </div>

        <div className="mt-4 flex items-start justify-between gap-6">
          <div className="text-[13px] leading-5">
            <p>To</p>
            <p>The General Secretary</p>
            <p className="font-bold">SRI JAGANNATH SAMITI,</p>
            <p>Sector-121, Noida, G B Nagar, Uttar Pradesh.</p>
          </div>
          <div className="flex h-[118px] w-[92px] flex-col items-center justify-center overflow-hidden border border-black bg-white">
            {data.photoPreview ? (
              <img src={data.photoPreview} alt="Applicant" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[12px] italic text-gray-500">Photo</span>
            )}
          </div>
        </div>

        <p className="mt-5 text-[13px]">Dear Sir/Madam,</p>
        <p className="mt-2 text-[13px] leading-7">
          I request you to enroll me as{' '}
          <DottedValue value={data.membershipType} minWidth="160px" /> member of Indian Sri
          Jagannath Samiti Society.
        </p>
        <p className="text-[13px] leading-7">
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
          <DottedValue value={data.chequeOrDdNo} minWidth="90px" /> of{' '}
          <DottedValue value={data.bankName} minWidth="130px" /> bank, dated{' '}
          <DottedValue
            value={payDate.dd ? `${payDate.dd}/${payDate.mm}/${payDate.yyyy}` : ''}
            minWidth="90px"
          />
          .
        </p>
        <p className="mt-1 text-[13px] leading-6">
          I am enclosing two copies of passport size photograph and attested Xerox copy of my
          aadhaar card. Following are my details:
        </p>

        <div className="mt-4 space-y-3 text-[13px]">
          <div className="flex flex-wrap items-center gap-4">
            <span>Title:</span>
            <span className="inline-flex items-center gap-1.5">
              Mr. <Tick checked={data.title === 'Mr'} />
            </span>
            <span className="inline-flex items-center gap-1.5">
              Ms. <Tick checked={data.title === 'Ms'} />
            </span>
          </div>

          <div className="flex items-end gap-2">
            <span className="mb-4 w-[92px] flex-shrink-0">Name:</span>
            <NameBox value={data.firstName} label="FIRST NAME" />
            <NameBox value={data.middleName} label="MIDDLE NAME" />
            <NameBox value={data.lastName} label="LAST NAME" />
          </div>

          <div className="flex flex-wrap items-end gap-6">
            <div className="flex items-center gap-3">
              <span>Gender:</span>
              <span className="inline-flex items-center gap-1.5">
                M <Tick checked={data.gender === 'M'} />
              </span>
              <span className="inline-flex items-center gap-1.5">
                F <Tick checked={data.gender === 'F'} />
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="mb-4">Date of Birth:</span>
              <DateBox value={dob.dd} label="DD" />
              <DateBox value={dob.mm} label="MM" />
              <DateBox value={dob.yyyy} label="YYYY" />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="mb-4 w-[92px] flex-shrink-0">Father&apos;s Name:</span>
            <NameBox value={data.fatherFirstName} label="FIRST NAME" />
            <NameBox value={data.fatherMiddleName} label="MIDDLE NAME" />
            <NameBox value={data.fatherLastName} label="LAST NAME" />
          </div>

          <div className="flex items-end gap-2">
            <span className="mb-4 w-[92px] flex-shrink-0">Mother&apos;s Name:</span>
            <NameBox value={data.motherFirstName} label="FIRST NAME" />
            <NameBox value={data.motherMiddleName} label="MIDDLE NAME" />
            <NameBox value={data.motherLastName} label="LAST NAME" />
          </div>

          <div className="flex items-start gap-3">
            <span className="w-[92px] flex-shrink-0 pt-1">Address:</span>
            <div className="min-h-[48px] flex-1 border-b border-dotted border-black pb-1 text-[13px] font-semibold uppercase leading-6">
              {data.address || '\u00A0'}
            </div>
            <div className="w-[150px] flex-shrink-0">
              <span>Pin Code:</span>
              <div className="mt-1 border-b border-dotted border-black pb-0.5 text-[13px] font-semibold">
                {data.pinCode || '\u00A0'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              Aadhaar No.{' '}
              <DottedValue value={data.aadhaar} minWidth="170px" />
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
          <h3 className="text-[15px] font-bold underline underline-offset-4">DECLARATION</h3>
          <p className="mt-2 text-[13px] leading-6">
            I hereby certify that the above information is correct and complete. If any information
            given is incorrect, I would be responsible for it.
          </p>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div className="flex items-end gap-2">
            <span className="mb-4">Date:</span>
            <DateBox value={declared.dd} label="DD" />
            <span className="mb-4">/</span>
            <DateBox value={declared.mm} label="MM" />
            <span className="mb-4">/</span>
            <DateBox value={declared.yyyy} label="YYYY" />
          </div>
          <div className="w-[180px]">
            <span>Place:</span>
            <div className="mt-1 flex h-8 items-center border border-black px-2 text-[13px] font-semibold uppercase">
              {data.place || '\u00A0'}
            </div>
          </div>
          <div className="w-[160px] text-center">
            <div className="h-10 border-b border-black" />
            <p className="mt-1 text-[13px] font-semibold">Signature</p>
          </div>
        </div>
      </SheetFrame>

      <SheetFrame>
        <div className="flex items-start gap-3">
          <img src={LOGO} alt="Sri Jagannath Samiti" className="h-[72px] w-[72px] flex-shrink-0" />
          <div className="flex-1 pt-2 text-center">
            <h2 className="text-[22px] font-bold uppercase underline underline-offset-4">
              Membership Information
            </h2>
          </div>
          <div className="h-[72px] w-[72px] flex-shrink-0" />
        </div>

        <div className="mt-8 overflow-hidden">
          <table className="mx-auto w-[92%] border-collapse text-[14px]">
            <thead>
              <tr>
                <th className="border border-black px-3 py-2 font-bold">Sl.No.</th>
                <th className="border border-black px-3 py-2 font-bold">Grade of Membership</th>
                <th className="border border-black px-3 py-2 font-bold">Amount in Rs.</th>
              </tr>
            </thead>
            <tbody>
              {MEMBERSHIP_GRADES.map((row) => {
                const selected = row.grade === data.membershipType;
                return (
                  <tr key={row.sl} className={selected ? 'bg-[#f5e6b8]/80' : undefined}>
                    <td className="border border-black px-3 py-2 text-center">{row.sl}.</td>
                    <td className="border border-black px-3 py-2">
                      {row.grade}
                      {selected ? '  ✓' : ''}
                    </td>
                    <td className="border border-black px-3 py-2 text-right">{row.amountLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className="mx-auto mt-8 w-[92%] space-y-3 text-[13px] leading-6">
          {MEMBERSHIP_INFO_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <span className="mt-0.5 inline-block h-3.5 w-3.5 flex-shrink-0 border border-black bg-white" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-10 w-[92%] border-t border-black pt-4">
          <p className="text-[14px] font-bold">For office Use Only</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px]">
            <span>Grade of Membership:</span>
            <div className="h-8 min-w-[260px] flex-1 border border-black" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-[13px]">
            <div className="flex items-center gap-2">
              <span>Date:</span>
              <div className="flex h-8 items-center border border-black px-3 tracking-[0.3em] text-gray-400">
                DD \ MM \ YYYY
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-[13px]">
            <span>ID Card No. :</span>
            <div className="h-8 min-w-[220px] flex-1 border border-black" />
          </div>
        </div>

        <div className="mt-16 flex items-end justify-between px-4">
          <div className="w-[180px] text-center">
            <div className="h-10 border-b border-black" />
            <p className="mt-1 text-[13px] font-bold leading-4">
              Signature
              <br />
              Treasurer
            </p>
          </div>
          <div className="w-[180px] text-center">
            <div className="h-10 border-b border-black" />
            <p className="mt-1 text-[13px] font-bold">President</p>
          </div>
        </div>
      </SheetFrame>
      </div>
    </div>
  );
}
