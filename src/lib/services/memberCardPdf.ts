import { createMemberCardDocument, type MemberCardData } from '../memberCard';
import { generateMemberCardArtwork } from './memberCardArtwork';

export type { MemberCardData } from '../memberCard';

/** The email attachment uses the same artwork and PDF layout as the profile card. */
export async function generateMemberCardPdf(data: MemberCardData): Promise<Buffer> {
  const artwork = await generateMemberCardArtwork(data);
  const pdf = await createMemberCardDocument(artwork, data.memberId);
  return Buffer.from(pdf.output('arraybuffer'));
}
