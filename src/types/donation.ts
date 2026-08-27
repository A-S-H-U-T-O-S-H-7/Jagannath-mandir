export interface DonorDetails {
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  donorType: 'indian' | 'foreign';
}

export interface TaxExemption {
  eligible: boolean;
  section: string;
  certificateRequired: boolean;
}

export interface Donation {
  id: string;
  donationId: string;
  userId?: string | null;
  donorDetails: DonorDetails;
  amount: number;
  currency: string;
  status: 'pending_payment' | 'completed' | 'failed' | 'cancelled';
  paymentGateway: string;
  purpose: string;
  donorType: 'indian' | 'foreign';
  taxExemption: TaxExemption;
  transactionId?: string;
  paymentDetails?: any;
  completedAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface DonationFormData {
  amount: string;
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
}

export interface DonationResponse {
  success: boolean;
  data?: Donation;
  error?: string;
}