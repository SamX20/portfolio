export function getGoogleDriveFileId(url?: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (!hostname.includes('drive.google.com')) return null;

    const pathParts = parsed.pathname.split('/').filter(Boolean);

    if (pathParts[0] === 'file' && pathParts[1] === 'd' && pathParts[2]) {
      return pathParts[2];
    }

    if ((parsed.pathname === '/open' || parsed.pathname === '/uc') && parsed.searchParams.has('id')) {
      return parsed.searchParams.get('id');
    }

    return null;
  } catch {
    return null;
  }
}

export function getGoogleDriveThumbnail(url?: string): string | undefined {
  const id = getGoogleDriveFileId(url);
  return id ? `https://drive.google.com/thumbnail?authuser=0&sz=w640&id=${id}` : undefined;
}
