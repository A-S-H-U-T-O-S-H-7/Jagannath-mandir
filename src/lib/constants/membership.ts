export const MEMBERSHIP_GRADES = [
  { sl: '1', grade: 'Patron', amountLabel: '5,00,000/-', amount: 500000 },
  { sl: '4', grade: 'Life Member', amountLabel: '1,01,000/-', amount: 101000 },
  { sl: '5', grade: 'Life Associate', amountLabel: '25,000/-', amount: 25000 },
  { sl: '6', grade: 'Annual Member', amountLabel: '2,100/-', amount: 2100 },
  { sl: '7', grade: 'Annual Associate', amountLabel: '1,100/-', amount: 1100 },
] as const;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

export const MEMBERSHIP_INFO_POINTS = [
  'Anyone can become Sri Jagannath Samiti member who has desire to improve Jagannath culture and believes in Sanatan Dharm.',
  'On becoming member in any grade of membership, the individual helps in rendering service to Mandir at the time of need through Jagannath Samiti.',
  'Association, Club, Firms, Societies and Organization etc. can take membership from serial no. 1 only.',
] as const;

export type MembershipGrade = (typeof MEMBERSHIP_GRADES)[number]['grade'];
export type PaymentMethod = 'Cash' | 'Cheque' | 'DD';
export type TitleOption = 'Mr' | 'Ms';
export type GenderOption = 'M' | 'F';

export interface MembershipFormData {
  title: TitleOption | '';
  firstName: string;
  middleName: string;
  lastName: string;
  gender: GenderOption | '';
  dateOfBirth: string;
  fatherFirstName: string;
  fatherMiddleName: string;
  fatherLastName: string;
  motherFirstName: string;
  motherMiddleName: string;
  motherLastName: string;
  address: string;
  pinCode: string;
  aadhaar: string;
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
}

export const emptyMembershipForm = (): MembershipFormData => ({
  title: '',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  fatherFirstName: '',
  fatherMiddleName: '',
  fatherLastName: '',
  motherFirstName: '',
  motherMiddleName: '',
  motherLastName: '',
  address: '',
  pinCode: '',
  aadhaar: '',
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
});

export const getSelectedGrade = (type: string) =>
  MEMBERSHIP_GRADES.find((grade) => grade.grade === type);

export const formatDateParts = (isoDate: string) => {
  if (!isoDate) return { dd: '', mm: '', yyyy: '' };
  const [yyyy, mm, dd] = isoDate.split('-');
  return { dd: dd || '', mm: mm || '', yyyy: yyyy || '' };
};

export const formatAmount = (amount: number) =>
  amount.toLocaleString('en-IN');
