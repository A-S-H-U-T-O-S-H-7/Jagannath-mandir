// lib/constants/membership.ts

export const MEMBERSHIP_GRADES = [
  { 
    sl: '1', 
    grade: 'Patron', 
    amountLabel: '5,00,000/-', 
    amount: 500000,
    details: [
      'Priority in Puja booking',
      'Information on all programmes',
      'Puja in the name of their family two times in a year',
      'Free Anniversary Puja',
      'Birthday Puja',
      'Puja for their parents Shradha (if dead)'
    ]
  },
  { 
    sl: '2', 
    grade: 'Life Time Member', 
    amountLabel: '1,01,000/-',
    amount: 101000,
    details: [
      'Priority in Puja booking',
      'Information on all programmes',
      'Puja in the name of their family once in a year',
      'Free Anniversary Puja',
      'Birthday Puja'
    ]
  },
  { 
    sl: '3', 
    grade: 'Life Associate', 
    amountLabel: '25,000/-', 
    amount: 25000,
    details: [
      'Priority in Puja booking',
      'Information on all programmes',
      'Puja in the name of their family once in a year'
    ]
  },
  { 
    sl: '4', 
    grade: 'Annual Associate', 
    amountLabel: '2,100/-',
    amount: 2100,
    details: [
      'Information on all programmes',
      'Puja in the name of their family'
    ]
  },
  { 
    sl: '5', 
    grade: 'Annual Member', 
    amountLabel: '1,100/-',
    amount: 1100,
    details: [
      'Information on all major programmes'
    ]
  },
] as const;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

export const MEMBERSHIP_INFO_POINTS = [
  'Anyone can become Samudayik Vikas Samiti member who has desire to improve Jagannath culture and believes in Sanatan Dharm.',
  'On becoming member in any grade of membership, the individual helps in rendering service to Mandir at the time of need through Samudayik Vikas Samiti.',
  'Association, Club, Firms, Societies and Organization etc. can take membership from serial no. 1 only.',
] as const;

export type MembershipGrade = (typeof MEMBERSHIP_GRADES)[number]['grade'];
export type PaymentMethod = 'Cash' | 'Cheque' | 'DD' | 'Online Payment';
export type TitleOption = 'Mr' | 'Ms' | 'Mrs' | 'Dr' | 'Prof';
export type GenderOption = 'Male' | 'Female' | 'Others';

export interface MembershipFormData {
  title: TitleOption | '';
  fullName: string;
  gender: GenderOption | '';
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  address: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  aadhaar: string;
  panNumber: string; // ✅ NEW
  bloodGroup: string;
  contactNo: string;
  email: string;
  qualification: string;
  occupation: string;
  introducer: string;
  membershipType: MembershipGrade | '';
  paymentMethod: PaymentMethod | '';
  chequeOrDdNo: string;
  bankName: string;
  paymentDate: string;
  place: string;
  declarationDate: string;
  photoPreview: string;
  photoFile: File | null;
  aadhaarFile: File | null;
  panFile: File | null; // ✅ NEW
}

export const emptyMembershipForm = (): MembershipFormData => ({
  title: '',
  fullName: '',
  gender: '',
  dateOfBirth: '',
  fatherName: '',
  motherName: '',
  address: '',
  country: '',
  state: '',
  city: '',
  pinCode: '',
  aadhaar: '',
  panNumber: '', // ✅ NEW
  bloodGroup: '',
  contactNo: '',
  email: '',
  qualification: '',
  occupation: '',
  introducer: '',
  membershipType: '',
  paymentMethod: '',
  chequeOrDdNo: '',
  bankName: '',
  paymentDate: '',
  place: '',
  declarationDate: new Date().toISOString().slice(0, 10),
  photoPreview: '',
  photoFile: null,
  aadhaarFile: null,
  panFile: null, 
});

export const getSelectedGrade = (type: string) =>
  MEMBERSHIP_GRADES.find((grade) => grade.grade === type);

export const formatDateParts = (isoDate: string) => {
  if (!isoDate) return { dd: '', mm: '', yyyy: '' };
  const [yyyy, mm, dd] = isoDate.split('-');
  return { dd: dd || '', mm: mm || '', yyyy: yyyy || '' };
};
