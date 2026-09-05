import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { MEMBER_CARD_HEIGHT, MEMBER_CARD_WIDTH, type MemberCardArtwork, type MemberCardData } from '../memberCard';

const C = { maroon: '#530E1C', deep: '#300A13', gold: '#C99A45', paleGold: '#F0D99A', ivory: '#FFF8E9', ink: '#421724', muted: '#826A59' };
const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);
const shorten = (value: string, limit: number) => value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value;
const text = (x: number, y: number, value: string, size = 18, color = C.ink, extra = '') => `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, sans-serif" font-size="${size}" ${extra}>${escape(value)}</text>`;
const image = (source: string, x: number, y: number, width: number, height: number, extra = '') => `<image href="${escape(source)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" ${extra}/>`;
const dataUrl = (buffer: Buffer) => `data:image/png;base64,${buffer.toString('base64')}`;

async function fittedText(x: number, y: number, value: string, width: number, size: number, color = C.ink, bold = false) {
  const { width: measured = 0 } = await sharp({ text: { text: escape(value), font: `Arial ${bold ? 'Bold ' : ''}${size}`, dpi: 72 } }).metadata();
  const fittedSize = measured > width ? size * width / (measured + 4) : size;
  return text(x, y, value, fittedSize, color, bold ? 'font-weight="bold"' : '');
}

let assetsPromise: Promise<{ hindi: string; odia: string; jagannath: string }> | undefined;
function getAssets() {
  // Embed local assets so PDF/email rendering never depends on public image URLs.
  assetsPromise ??= Promise.all(['swarnakshetra-h.png', 'swarnakshetra-o.png', 'memberjaga.png'].map(async (file) => {
    const source = await readFile(path.join(process.cwd(), 'public', file));
    return dataUrl(await sharp(source).resize({ width: file === 'memberjaga.png' ? 1000 : 360 }).png().toBuffer());
  })).then(([hindi, odia, jagannath]) => ({ hindi, odia, jagannath })).catch((error) => {
    assetsPromise = undefined;
    throw error;
  });
  return assetsPromise;
}

async function getPhoto(url?: string) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !['firebasestorage.googleapis.com', 'storage.googleapis.com', 'lh3.googleusercontent.com'].includes(parsed.hostname)) return '';
    const response = await fetch(parsed, { redirect: 'error', signal: AbortSignal.timeout(8000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) return '';
    return dataUrl(await sharp(Buffer.from(await response.arrayBuffer()), { limitInputPixels: 25000000 }).rotate().resize(240, 280, { fit: 'cover', position: 'attention' }).png().toBuffer());
  } catch {
    return '';
  }
}

function memberDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return shorten(value || '—', 22);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date);
}

function svg(body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${MEMBER_CARD_WIDTH}" height="${MEMBER_CARD_HEIGHT}" viewBox="0 0 1000 600">
    <defs>
      <linearGradient id="wine" x2="1" y2="1"><stop stop-color="${C.maroon}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>
      <linearGradient id="gold"><stop stop-color="#AC772E"/><stop offset=".48" stop-color="#F4DFA4"/><stop offset="1" stop-color="#BD8735"/></linearGradient>
      <radialGradient id="halo"><stop stop-color="#C99A45" stop-opacity=".3"/><stop offset="1" stop-color="#C99A45" stop-opacity="0"/></radialGradient>
      <pattern id="pattern" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M12 8L16 12L12 16L8 12Z" fill="none" stroke="${C.gold}" stroke-opacity=".13" stroke-width=".7"/></pattern>
      <clipPath id="portrait"><rect x="839" y="227" width="112" height="132" rx="10"/></clipPath>
    </defs>${body}
    <rect x="10" y="10" width="980" height="580" rx="16" fill="none" stroke="url(#gold)" stroke-width="1.5"/>
    <path d="M24 48V24H48M952 24H976V48M24 552V576H48M952 576H976V552" fill="none" stroke="${C.gold}" stroke-width="2"/>
  </svg>`;
}

/** One server-rendered artwork source keeps profile, download and email pixel-identical. */
export async function generateMemberCardArtwork(data: MemberCardData): Promise<MemberCardArtwork> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://jagannathmandirnoida.svsamiti.com').replace(/\/$/, '');
  const [assets, photo, qr] = await Promise.all([
    getAssets(), getPhoto(data.photoUrl),
    QRCode.toDataURL(`${baseUrl}/member/${encodeURIComponent(data.memberId)}`, { width: 360, margin: 2, errorCorrectionLevel: 'M', color: { dark: C.deep, light: '#FFFFFF' } }),
  ]);
  const name = data.name.trim() || 'Member';
  const words = name.split(/\s+/);
  let firstLine = '';
  while (words.length && (firstLine.length + words[0].length < 27 || !firstLine)) firstLine += `${firstLine ? ' ' : ''}${words.shift()}`;
  const secondLine = words.join(' ');
  const [nameLine1, nameLine2, planText, memberIdText, locationText] = await Promise.all([
    fittedText(332, 247, shorten(firstLine, 28), 475, 32, C.ink, true),
    secondLine ? fittedText(332, 283, shorten(secondLine, 30), 475, 29, C.ink, true) : Promise.resolve(''),
    fittedText(332, secondLine ? 313 : 281, shorten(data.membershipPlan || 'Temple Member', 50), 475, 17, '#99691F'),
    fittedText(332, 381, data.memberId, 475, 23, C.maroon, true),
    fittedText(332, 501, shorten(data.location || 'Noida', 55), 475, 17),
  ]);
  const nameMarkup = nameLine1 + nameLine2;
  const front = svg(`
    <rect width="1000" height="600" fill="${C.ivory}"/>
    <rect width="294" height="600" fill="url(#wine)"/>
    <rect width="294" height="600" fill="url(#pattern)"/>
    <rect x="294" width="3" height="600" fill="url(#gold)"/>
    ${text(147, 64, 'JAI JAGANNATH', 17, C.paleGold, 'text-anchor="middle" letter-spacing="3"')}
    <path d="M76 85H127M167 85H218M147 79L153 85L147 91L141 85Z" stroke="${C.gold}" fill="none"/>
    <ellipse cx="147" cy="290" rx="143" ry="205" fill="url(#halo)"/>
    <path d="M38 454V250A109 145 0 0 1 256 250V454" fill="none" stroke="${C.gold}" stroke-opacity=".5"/>
    <path d="M46 449V252A101 136 0 0 1 248 252V449" fill="none" stroke="${C.gold}" stroke-opacity=".22"/>
    ${image(assets.jagannath, -64, 112, 423, 423)}
    ${text(147, 555, 'A BOND OF FAITH & SERVICE', 10, C.paleGold, 'text-anchor="middle" letter-spacing="1.5"')}
    ${image(assets.hindi, 329, 37, 116, 98)}
    ${image(assets.odia, 837, 37, 116, 98)}
    ${text(640, 72, 'SHREE SWARNA', 25, C.maroon, 'text-anchor="middle" font-weight="bold" letter-spacing="1"')}
    ${text(640, 105, 'KSHETRA', 29, C.maroon, 'text-anchor="middle" font-weight="bold" letter-spacing="5"')}
    ${text(640, 131, 'JAGANNATH MANDIR · NOIDA', 11, C.muted, 'text-anchor="middle" letter-spacing="1.5"')}
    ${text(640, 149, 'Royale Garden Estate, Sector-61, Noida', 11, C.muted, 'text-anchor="middle"')}
    <path d="M332 162H953" stroke="${C.gold}" stroke-opacity=".6"/>
    ${text(332, 191, 'MEMBERSHIP CARD', 12, C.maroon, 'font-weight="bold" letter-spacing="3"')}
    <rect x="801" y="172" width="152" height="27" rx="13.5" fill="#E8EDDF"/>
    <circle cx="817" cy="185.5" r="3" fill="#42623F"/>
    ${text(829, 190, 'ACTIVE & VERIFIED', 10, '#355236', 'font-weight="bold" letter-spacing=".6"')}
    ${nameMarkup}
    ${planText}
    <rect x="835" y="223" width="120" height="140" rx="13" fill="#F1E5CE" stroke="${C.gold}"/>
    ${photo ? image(photo, 839, 227, 112, 132, 'clip-path="url(#portrait)"') : `<circle cx="895" cy="270" r="22" fill="#C9B697"/><path d="M856 339V328A39 34 0 0 1 934 328V339Z" fill="#C9B697"/>`}
    ${text(332, 353, 'MEMBER ID', 10, C.muted, 'letter-spacing="1.7"')}
    ${memberIdText}
    ${text(332, 416, 'MEMBER SINCE', 10, C.muted, 'letter-spacing="1.5"')}
    ${text(332, 441, memberDate(data.memberSince), 17)}
    ${text(574, 416, 'BLOOD GROUP', 10, C.muted, 'letter-spacing="1.5"')}
    ${text(574, 441, shorten(data.bloodGroup || '—', 12), 17)}
    ${text(332, 476, 'LOCATION', 10, C.muted, 'letter-spacing="1.5"')}
    ${locationText}
    <rect x="838" y="384" width="115" height="115" rx="10" fill="white" stroke="#E2D5BE"/>
    ${image(qr, 843, 389, 105, 105)}
    ${text(895, 518, 'SCAN TO VERIFY', 9, C.muted, 'text-anchor="middle" letter-spacing="1"')}
    <path d="M332 537H953" stroke="${C.gold}" stroke-opacity=".6"/>
    ${text(332, 561, 'ISSUED BY', 9, C.muted, 'letter-spacing="1.4"')}
    ${text(417, 561, 'Samudayik Vikas Samiti', 13, C.maroon, 'font-weight="bold"')}
    ${text(953, 561, 'FAITH · SERVICE · COMMUNITY', 8, C.muted, 'text-anchor="end" letter-spacing=".7"')}
  `);
  const terms = [
    ['Personal to you', 'This card is valid only for the named member and is not transferable.'],
    ['Keep it with you', 'Present this card when requested for temple and member services.'],
    ['Keep it safe', 'Report a lost, stolen or misused card to Samudayik Vikas Samiti.'],
    ['Our shared commitment', 'Membership remains subject to the Samiti rules and approval.'],
  ];
  const back = svg(`
    <rect width="1000" height="600" fill="url(#wine)"/>
    <rect width="1000" height="600" fill="url(#pattern)"/>
    ${image(assets.hindi, 44, 35, 100, 85)}${image(assets.odia, 856, 35, 100, 85)}
    ${text(500, 66, 'SAMUDAYIK VIKAS SAMITI', 13, C.paleGold, 'text-anchor="middle" letter-spacing="3"')}
    ${text(500, 103, 'A community united in devotion.', 27, C.ivory, 'text-anchor="middle"')}
    <path d="M48 142H952" stroke="${C.gold}" stroke-opacity=".5"/>
    ${text(52, 182, 'MEMBERSHIP GUIDELINES', 11, C.paleGold, 'letter-spacing="2.5"')}
    ${terms.map(([title, detail], index) => {
      const y = 222 + index * 68;
      return `<circle cx="65" cy="${y - 4}" r="13" fill="none" stroke="${C.gold}" stroke-opacity=".6"/>${text(65, y, `0${index + 1}`, 9, C.paleGold, 'text-anchor="middle"')}${text(93, y, title, 17, C.ivory, 'font-weight="bold"')}${text(93, y + 25, detail, 13, '#DFCCBD')}`;
    }).join('')}
    <path d="M780 175V466" stroke="${C.gold}" stroke-opacity=".3"/>
    ${image(assets.jagannath, 771, 184, 200, 224)}
    ${text(871, 428, 'JAI JAGANNATH', 11, C.paleGold, 'text-anchor="middle" letter-spacing="1.5"')}
    ${text(871, 450, 'In faith. In service.', 11, '#DFCCBD', 'text-anchor="middle"')}
    <path d="M48 492H952" stroke="${C.gold}" stroke-opacity=".5"/>
    ${text(52, 523, `MEMBER ID  ${shorten(data.memberId, 40)}`, 12, C.paleGold, 'letter-spacing=".6"')}
    ${text(52, 551, 'Shree Swarna Kshetra · Jagannath Mandir, Noida', 12, C.ivory)}
    ${text(952, 523, 'ISSUED BY SAMUDAYIK VIKAS SAMITI', 10, C.paleGold, 'text-anchor="end" letter-spacing=".7"')}
    ${text(952, 551, 'C-316 B&C, Sector-10, Noida, G B Nagar, UP', 11, '#DFCCBD', 'text-anchor="end"')}
  `);
  const render = async (source: string) => dataUrl(await sharp(Buffer.from(source), { density: 144 }).png().toBuffer());
  const [frontImage, backImage] = await Promise.all([render(front), render(back)]);
  return { front: frontImage, back: backImage };
}
