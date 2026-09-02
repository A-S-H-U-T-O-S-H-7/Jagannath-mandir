import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export type MemberCardData = {
  name: string;
  memberId: string;
  memberSince: string;
  membershipPlan?: string;
  bloodGroup?: string;
  location?: string;
  photoUrl?: string;
};

async function getPhotoDataUrl(url?: string) {
  if (!url) return '';
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) return '';
    const image = Buffer.from(await response.arrayBuffer()).toString('base64');
    return `data:${response.headers.get('content-type')!.split(';')[0]};base64,${image}`;
  } catch {
    return '';
  }
}

/** Creates the same verified member pass that is delivered as the email attachment. */
export async function generateMemberCardPdf(data: MemberCardData): Promise<Buffer> {
  const verificationUrl = `${(process.env.NEXT_PUBLIC_BASE_URL || 'https://jagannathmandirnoida.svsamiti.com').replace(/\/$/, '')}/member/${encodeURIComponent(data.memberId)}`;
  const [qrCode, photo] = await Promise.all([
    QRCode.toDataURL(verificationUrl, { width: 320, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0B3C5D', light: '#FFFFFF' } }),
    getPhotoDataUrl(data.photoUrl),
  ]);

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [160, 90] });
  pdf.setProperties({ title: `Jagannath Mandir Member Card - ${data.memberId}` });
  pdf.setFillColor(249, 248, 244);
  pdf.rect(0, 0, 160, 90, 'F');
  pdf.setFillColor(11, 60, 93);
  pdf.rect(0, 0, 160, 18, 'F');
  pdf.setFillColor(212, 175, 55);
  pdf.rect(0, 18, 160, 2, 'F');
  pdf.setFillColor(212, 175, 55);
  pdf.circle(146, 69, 32, 'F');
  pdf.setFillColor(245, 240, 234);
  pdf.circle(146, 69, 25, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(15);
  pdf.text('SHREE SWARNA KHETRA', 8, 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text('JAGANNATH MANDIR, NOIDA', 8, 13);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.text('VERIFIED MEMBER CARD', 152, 11, { align: 'right' });

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(8, 27, 31, 41, 3, 3, 'F');
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(8, 27, 31, 41, 3, 3, 'S');
  if (photo) {
    try { pdf.addImage(photo, 'JPEG', 10, 29, 27, 33); } catch { /* Use the fallback avatar below. */ }
  }
  if (!photo) {
    pdf.setFillColor(229, 229, 229);
    pdf.circle(23.5, 42, 7, 'F');
    pdf.ellipse(23.5, 54, 10, 7, 'F');
  }
  pdf.setFillColor(222, 247, 235);
  pdf.roundedRect(12, 63, 23, 4, 1.5, 1.5, 'F');
  pdf.setTextColor(5, 110, 67);
  pdf.setFontSize(5.5);
  pdf.text('ACTIVE & VERIFIED', 23.5, 65.8, { align: 'center' });

  const name = data.name || 'Member';
  pdf.setTextColor(11, 60, 93);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(name.length > 28 ? 13 : 16);
  pdf.text(name.slice(0, 42), 46, 34);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(154, 101, 11);
  pdf.setFontSize(8);
  pdf.text(data.membershipPlan || 'Temple Member', 46, 40);
  const details = [
    ['MEMBER ID', data.memberId],
    ['MEMBER SINCE', data.memberSince],
    ['BLOOD GROUP', data.bloodGroup || '-'],
    ['LOCATION', data.location || 'Noida'],
  ];
  details.forEach(([label, value], index) => {
    const y = 48 + index * 6;
    pdf.setTextColor(85, 85, 85);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.text(label, 46, y);
    pdf.setTextColor(11, 60, 93);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text(value, 74, y);
  });

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(123, 34, 27, 33, 2, 2, 'F');
  pdf.addImage(qrCode, 'PNG', 126, 37, 21, 21);
  pdf.setTextColor(11, 60, 93);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5.5);
  pdf.text('SCAN TO VERIFY', 136.5, 62, { align: 'center' });
  pdf.setTextColor(85, 85, 85);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5);
  pdf.text('Issued by Samudayik Vikas Samiti', 80, 83, { align: 'center' });

  return Buffer.from(pdf.output('arraybuffer'));
}
