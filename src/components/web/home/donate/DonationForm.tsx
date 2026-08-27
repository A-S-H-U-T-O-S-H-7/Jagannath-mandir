// components/donate/DonationForm.tsx
'use client';

import { useState } from 'react';
import { IndianRupee, User, Mail, Phone, MapPin, Heart, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocationData } from '@/hooks/useLocationData';
import useAuthStore from '@/lib/store/authStore';

interface DonationFormProps {
  donorType: string;
}

interface FormData {
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

interface FormErrors {
  amount?: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
}

function createDonationId() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DON${Date.now()}${rand}`.slice(0, 30);
}

function redirectToCCAvenue(paymentUrl: string, encRequest: string, accessCode: string) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;
  form.style.display = 'none';

  const encInput = document.createElement('input');
  encInput.type = 'hidden';
  encInput.name = 'encRequest';
  encInput.value = encRequest;
  form.appendChild(encInput);

  const accessInput = document.createElement('input');
  accessInput.type = 'hidden';
  accessInput.name = 'access_code';
  accessInput.value = accessCode;
  form.appendChild(accessInput);

  document.body.appendChild(form);
  form.submit();
}

export default function DonationForm({ donorType }: DonationFormProps) {
  const [processing, setProcessing] = useState(false);
  const { user } = useAuthStore();
  const isIndianDonor = donorType !== 'international';
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    fullName: '',
    email: '',
    mobile: '',
    address: '',
    country: 'India',
    state: '',
    city: '',
    pincode: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Use the location data hook
  const { countries, states, cities, loading } = useLocationData({
    country: formData.country,
    state: formData.state
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid donation amount';
    }
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    const digits = formData.mobile.replace(/\D/g, '');
    if (!formData.mobile || (isIndianDonor ? !/^[0-9]{10}$/.test(digits) : digits.length < 8 || digits.length > 15)) {
      newErrors.mobile = isIndianDonor
        ? 'Please enter a valid 10-digit mobile number'
        : 'Please enter a valid phone number';
    }
    if (!formData.address || formData.address.trim().length < 10) {
      newErrors.address = 'Please enter a complete address';
    }
    if (!formData.country) {
      newErrors.country = 'Please select your country';
    }
    if (!formData.state) {
      newErrors.state = 'Please select your state';
    }
    if (!formData.city) {
      newErrors.city = 'Please select your city';
    }
    if (
      !formData.pincode ||
      (isIndianDonor
        ? !/^[0-9]{6}$/.test(formData.pincode)
        : formData.pincode.trim().length < 3)
    ) {
      newErrors.pincode = isIndianDonor
        ? 'Please enter a valid 6-digit pincode'
        : 'Please enter a valid postal code';
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setProcessing(true);

    try {
      const donationId = createDonationId();
      const amount = parseFloat(formData.amount);
      const storedDonorType = isIndianDonor ? 'indian' : 'foreign';

      const createRes = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: donationId,
          userId: user?.uid || null,
          donorDetails: {
            name: formData.fullName.trim(),
            email: formData.email.trim(),
            mobile: formData.mobile.replace(/\D/g, ''),
            address: formData.address.trim(),
            city: formData.city,
            state: formData.state,
            country: formData.country,
            pincode: formData.pincode.trim(),
            donorType: storedDonorType,
          },
          amount,
          currency: 'INR',
          purpose: 'General Donation',
          donorType: storedDonorType,
          taxExemption: {
            eligible: true,
            section: '80G',
            certificateRequired: true,
          },
        }),
      });

      const created = await createRes.json();
      if (!createRes.ok || !created.success) {
        throw new Error(created.error || 'Unable to create donation');
      }

      const paymentRes = await fetch('/api/payment/ccavenue-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: donationId,
          purpose: 'General Donation',
          amount,
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.mobile.replace(/\D/g, ''),
          address: formData.address.trim(),
          donor_type: storedDonorType,
          country: formData.country,
        }),
      });

      const paymentJson = await paymentRes.json();
      if (!paymentRes.ok || !paymentJson.status || !paymentJson.encRequest || !paymentJson.access_code) {
        const message = paymentJson.errors?.[0] || 'Unable to start payment';
        throw new Error(message);
      }

      redirectToCCAvenue(paymentJson.paymentUrl, paymentJson.encRequest, paymentJson.access_code);
    } catch (error: any) {
      console.error('Donation submit error:', error);
      toast.error(error.message || 'Payment could not be started. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E5E3DD]/50 p-6">
      <h2 className="text-xl font-serif font-bold text-[#0B3C5D] mb-6 text-center">
        <span className="text-[#D4AF37]">💝</span> Make a Donation
      </h2>
      
      <div className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-[#555555] mb-1">
            Donation Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555555]" />
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="w-full pl-9 pr-4 py-2.5 border border-[#E5E3DD]/50 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200 outline-none text-sm"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex flex-wrap gap-2">
          {['500', '1000', '2100', '5000', '11000'].map((amount) => (
            <button
              key={amount}
              onClick={() => setFormData({ ...formData, amount })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                formData.amount === amount
                  ? 'bg-[#D4AF37] text-[#0B3C5D] shadow-md'
                  : 'bg-[#E5E3DD]/30 text-[#555555] hover:bg-[#D4AF37]/10 border border-[#E5E3DD]/50'
              }`}
            >
              ₹{amount}
            </button>
          ))}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-[#555555] mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555555]" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full pl-9 pr-4 py-2.5 border border-[#E5E3DD]/50 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200 outline-none text-sm"
            />
          </div>
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        {/* Email and Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#555555] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555555]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full pl-9 pr-4 py-2.5 border border-[#E5E3DD]/50 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200 outline-none text-sm"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555555] mb-1">
              Mobile <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555555]" />
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="9876543210"
                className="w-full pl-9 pr-4 py-2.5 border border-[#E5E3DD]/50 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200 outline-none text-sm"
              />
            </div>
            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-[#555555] mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#555555]" />
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your complete address"
              rows={2}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E5E3DD]/50 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200 outline-none text-sm resize-none"
            />
          </div>
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

        {/* Country, State, City, Pincode */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#555555] mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-[#E5E3DD]/50 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200 outline-none text-sm bg-white"
            >
              <option value="">Select Country</option>
              {loading.countries ? (
                <option disabled>Loading countries...</option>
              ) : (
                countries.map((country: any) => (
                  <option key={country.iso2} value={country.name}>
                    {country.name}
                  </option>
                ))
              )}
            </select>
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555555] mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-[#E5E3DD]/50 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200 outline-none text-sm bg-white"
              disabled={!formData.country}
            >
              <option value="">Select State</option>
              {loading.states ? (
                <option disabled>Loading states...</option>
              ) : (
                states.map((state: any) => (
                  <option key={state.iso2} value={state.name}>
                    {state.name}
                  </option>
                ))
              )}
            </select>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#555555] mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-[#E5E3DD]/50 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200 outline-none text-sm bg-white"
              disabled={!formData.state}
            >
              <option value="">Select City</option>
              {loading.cities ? (
                <option disabled>Loading cities...</option>
              ) : (
                cities.map((city: any) => (
                  <option key={city.id || city.name} value={city.name}>
                    {city.name}
                  </option>
                ))
              )}
            </select>
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555555] mb-1">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="110001"
              maxLength={6}
              className="w-full px-3 py-2.5 border border-[#E5E3DD]/50 rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-200 outline-none text-sm"
            />
            {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={processing}
          className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg mt-4 ${
            processing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#D4AF37] hover:bg-[#E8C84A] text-[#0B3C5D]'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4" />
                Donate Now
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </span>
        </button>

        <p className="text-center text-xs text-[#555555] mt-2">
          🔒 100% secure donation. 80G tax exemption available.
        </p>
      </div>
    </div>
  );
}