const mapQuery = 'Swarna Kshetra Jagannath Dham, Royale Garden Estate, Sector 61, Noida';

export const TEMPLE_LOCATION = {
  name: 'Shree Swarna Kshetra Jagannath Mandir',
  address: 'Royale Garden Estate, Sector-61, Noida',
  // Keep the original location shared by the temple alongside the embedded map.
  shareUrl: 'https://share.google/WLWIWp92kffIq5LXI',
  embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`,
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`,
};
