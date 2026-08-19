import { db, storage } from '@/lib/firebase/config';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { MembershipFormData } from '@/lib/constants/membership';
import { getSelectedGrade } from '@/lib/constants/membership';

const COLLECTION = 'membershipApplications';

const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const submitMembershipApplication = async (data: MembershipFormData) => {
  try {
    const docRef = doc(collection(db, COLLECTION));
    const grade = getSelectedGrade(data.membershipType);

    let photoUrl = '';
    let aadhaarUrl = '';

    if (data.photoFile) {
      try {
        photoUrl = await uploadFile(data.photoFile, `membership/${docRef.id}/photo`);
      } catch (error) {
        console.error('Photo upload failed:', error);
      }
    }
    if (data.aadhaarFile) {
      try {
        aadhaarUrl = await uploadFile(data.aadhaarFile, `membership/${docRef.id}/aadhaar`);
      } catch (error) {
        console.error('Aadhaar upload failed:', error);
      }
    }

    const payload = {
      title: data.title,
      fullName: data.fullName,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      fatherName: data.fatherName,
      motherName: data.motherName,
      address: data.address,
      country: data.country,
      state: data.state,
      city: data.city,
      pinCode: data.pinCode,
      aadhaar: data.aadhaar,
      bloodGroup: data.bloodGroup,
      contactNo: data.contactNo,
      email: data.email,
      qualification: data.qualification,
      occupation: data.occupation,
      introducer: data.introducer,
      membershipType: data.membershipType,
      membershipAmount: grade?.amount || 0,
      paymentMethod: data.paymentMethod,
      chequeOrDdNo: data.chequeOrDdNo,
      bankName: data.bankName,
      paymentDate: data.paymentDate,
      place: data.place,
      declarationDate: data.declarationDate,
      photoUrl,
      aadhaarUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, payload);
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to submit application.';
    console.error('Error submitting membership application:', error);
    return { success: false, error: message };
  }
};

export interface MembershipApplication {
  id: string;
  fullName: string;
  membershipType: string;
  membershipAmount: number;
  email: string;
  contactNo: string;
  photoUrl?: string;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

export const getAllMembershipApplications = async () => {
  try {
    let snapshot;
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      snapshot = await getDocs(q);
    } catch {
      snapshot = await getDocs(collection(db, COLLECTION));
    }

    const applications: MembershipApplication[] = [];
    snapshot.forEach((docSnap) => {
      applications.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as MembershipApplication);
    });

    applications.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return { success: true, applications };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load applications.';
    return { success: false, error: message, applications: [] as MembershipApplication[] };
  }
};