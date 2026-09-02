'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { type MembershipApplication, updateMembershipApplication } from '@/lib/services/membershipService';

const fields = [
  ['title', 'Title'], ['fullName', 'Full name'], ['gender', 'Gender'], ['dateOfBirth', 'Date of birth', 'date'],
  ['fatherName', "Father's name"], ['motherName', "Mother's name"], ['email', 'Email', 'email'], ['contactNo', 'Mobile'],
  ['address', 'Address', 'textarea'], ['city', 'City'], ['state', 'State'], ['country', 'Country'], ['pinCode', 'PIN code'],
  ['aadhaar', 'Aadhaar number'], ['panNumber', 'PAN number'], ['bloodGroup', 'Blood group'],
  ['qualification', 'Qualification'], ['occupation', 'Occupation'], ['introducer', 'Introducer'],
  ['membershipType', 'Membership grade'], ['membershipAmount', 'Membership amount', 'number'], ['paymentMethod', 'Payment method'],
  ['chequeOrDdNo', 'Cheque / DD no.'], ['bankName', 'Bank name'], ['paymentDate', 'Payment date', 'date'],
  ['place', 'Declaration place'], ['declarationDate', 'Declaration date', 'date'],
] as const;

type Props = { member: MembershipApplication; onClose: () => void; onSaved: () => void };

export default function MemberEditModal({ member, onClose, onSaved }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(Object.fromEntries(fields.map(([key]) => [key, String(member[key] ?? '')])));
  }, [member]);

  const save = async () => {
    if (!values.fullName.trim() || !values.email.trim()) {
      toast.error('Full name and email are required.');
      return;
    }
    setSaving(true);
    const result = await updateMembershipApplication(member.id, values, photo);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error || 'Unable to update member details.');
      return;
    }
    toast.success('Member details updated');
    onSaved();
  };

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0B3C5D]/45 p-4" role="dialog" aria-modal="true" aria-label="Edit member details">
    <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#E5E3DD] px-5 py-4">
        <div><h2 className="font-serif text-xl font-bold text-[#0B3C5D]">Edit member details</h2><p className="mt-0.5 text-xs text-[#555555]">Member ID, approval status, and payment status cannot be changed here.</p></div>
        <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-[#555555] hover:bg-[#F9F8F4]"><X className="h-5 w-5" /></button>
      </div>
      <div className="max-h-[calc(92vh-132px)] overflow-y-auto p-5">
        <div className="mb-5 flex items-center gap-4 rounded-xl bg-[#F9F8F4] p-3">
          {member.photoUrl ? <img src={member.photoUrl} alt="Current member" className="h-16 w-16 rounded-lg object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#E5E3DD] text-xs text-[#555555]">No photo</div>}
          <label className="text-sm font-medium text-[#0B3C5D]">Replace photo <input type="file" accept="image/*" className="mt-1 block text-xs text-[#555555]" onChange={(event) => setPhoto(event.target.files?.[0] || null)} /></label>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map(([key, label, type]) => <label key={key} className={type === 'textarea' ? 'sm:col-span-2' : ''}><span className="mb-1 block text-xs font-semibold text-[#555555]">{label}</span>{type === 'textarea' ? <textarea value={values[key] || ''} onChange={(event) => setValues((previous) => ({ ...previous, [key]: event.target.value }))} className="min-h-20 w-full rounded-lg border border-[#E5E3DD] px-3 py-2 text-sm text-[#0B3C5D] outline-none focus:border-[#D4AF37]" /> : <input type={type || 'text'} value={values[key] || ''} onChange={(event) => setValues((previous) => ({ ...previous, [key]: event.target.value }))} className="w-full rounded-lg border border-[#E5E3DD] px-3 py-2 text-sm text-[#0B3C5D] outline-none focus:border-[#D4AF37]" />}</label>)}
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-[#E5E3DD] px-5 py-4"><button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-[#E5E3DD] px-4 py-2 text-sm font-semibold text-[#555555]">Cancel</button><button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Saving…' : 'Save changes'}</button></div>
    </div>
  </div>;
}
