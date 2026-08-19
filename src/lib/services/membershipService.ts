import { auth, db, storage } from '@/lib/firebase/config';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { MembershipFormData } from '@/lib/constants/membership';
import { getSelectedGrade } from '@/lib/constants/membership';

const COLLECTION = 'membershipApplications';

const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export type MembershipStatus = 'pending' | 'approved' | 'rejected';

export interface MembershipApplication {
  id: string;
  title?: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  aadhaar?: string;
  bloodGroup?: string;
  contactNo: string;
  email: string;
  qualification?: string;
  occupation?: string;
  introducer?: string;
  membershipType: string;
  membershipAmount: number;
  paymentMethod?: string;
  chequeOrDdNo?: string;
  bankName?: string;
  paymentDate?: string;
  place?: string;
  declarationDate?: string;
  photoUrl?: string;
  aadhaarUrl?: string;
  userId?: string;
  status: MembershipStatus | string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export const submitMembershipApplication = async (data: MembershipFormData) => {
  try {
    const docRef = doc(collection(db, COLLECTION));
    const grade = getSelectedGrade(data.membershipType);
    const currentUser = auth.currentUser;

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
      userId: currentUser?.uid || '',
      status: 'pending' as MembershipStatus,
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

const mapApplication = (id: string, data: Record<string, unknown>): MembershipApplication =>
  ({
    id,
    ...data,
    fullName: (data.fullName as string) || '',
    email: (data.email as string) || '',
    contactNo: (data.contactNo as string) || '',
    membershipType: (data.membershipType as string) || '',
    membershipAmount: (data.membershipAmount as number) || 0,
    status: (data.status as string) || 'pending',
    createdAt: (data.createdAt as string) || '',
  }) as MembershipApplication;

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
      applications.push(mapApplication(docSnap.id, docSnap.data()));
    });

    applications.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return { success: true, applications };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load applications.';
    return { success: false, error: message, applications: [] as MembershipApplication[] };
  }
};

export const updateMembershipStatus = async (
  applicationId: string,
  status: MembershipStatus,
  reviewedBy?: string
) => {
  try {
    const applicationRef = doc(db, COLLECTION, applicationId);
    const now = new Date().toISOString();
    await updateDoc(applicationRef, {
      status,
      reviewedAt: now,
      reviewedBy: reviewedBy || '',
      updatedAt: now,
    });

    const snap = await getDoc(applicationRef);
    const application = snap.exists()
      ? mapApplication(snap.id, snap.data() as Record<string, unknown>)
      : null;

    if (application?.userId) {
      const userRef = doc(db, 'users', application.userId);
      await updateDoc(userRef, {
        isMember: status === 'approved',
        membershipStatus: status,
        membershipType: application.membershipType || '',
        membershipApplicationId: applicationId,
        updatedAt: now,
      }).catch(() => undefined);
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update application.';
    return { success: false, error: message };
  }
};

export const getMembershipByUser = async (email?: string | null, userId?: string | null) => {
  try {
    const result = await getAllMembershipApplications();
    if (!result.success) {
      return { success: false, error: result.error, application: null };
    }

    const normalizedEmail = email?.trim().toLowerCase() || '';
    const matches = result.applications.filter((item) => {
      const sameEmail = normalizedEmail && item.email?.trim().toLowerCase() === normalizedEmail;
      const sameUser = userId && item.userId === userId;
      return Boolean(sameEmail || sameUser);
    });

    const application =
      matches.find((item) => item.status === 'approved') ||
      matches.find((item) => item.status === 'pending') ||
      matches[0] ||
      null;

    return { success: true, application };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load membership.';
    return { success: false, error: message, application: null };
  }
};
