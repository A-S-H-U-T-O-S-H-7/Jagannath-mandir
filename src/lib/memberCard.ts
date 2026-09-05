export type MemberCardData = {
  name: string;
  memberId: string;
  memberSince: string;
  membershipPlan?: string;
  bloodGroup?: string;
  location?: string;
  photoUrl?: string;
};

export type MemberCardArtwork = { front: string; back: string };
export const MEMBER_CARD_WIDTH = 1000;
export const MEMBER_CARD_HEIGHT = 600;

/** Both the profile download and verification email use these exact page images. */
export async function createMemberCardDocument(artwork: MemberCardArtwork, memberId: string) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [160, 96], compress: true });
  pdf.setProperties({ title: `Shree Swarna Kshetra - Member Card - ${memberId}`, author: 'Samudayik Vikas Samiti' });
  pdf.addImage(artwork.front, 'PNG', 0, 0, 160, 96);
  pdf.addPage([160, 96], 'landscape');
  pdf.addImage(artwork.back, 'PNG', 0, 0, 160, 96);
  return pdf;
}
