export const formatImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Format 1: https://drive.google.com/file/d/FILE_ID/view...
  const driveRegex1 = /drive\.google\.com\/file\/d\/([^/]+)/;
  // Format 2: https://drive.google.com/open?id=FILE_ID
  const driveRegex2 = /drive\.google\.com\/open\?id=([^&]+)/;
  // Format 3: https://drive.google.com/uc?id=FILE_ID
  const driveRegex3 = /drive\.google\.com\/uc\?.*id=([^&]+)/;

  let fileId = null;

  const match1 = url.match(driveRegex1);
  if (match1 && match1[1]) {
    fileId = match1[1];
  } else {
    const match2 = url.match(driveRegex2);
    if (match2 && match2[1]) {
      fileId = match2[1];
    } else {
      const match3 = url.match(driveRegex3);
      if (match3 && match3[1]) {
        fileId = match3[1];
      }
    }
  }

  // Also support existing lh3.googleusercontent.com/d/FILE_ID just in case we need to normalize or it is already normalized
  // If it's already a direct Google drive link or lh3 link, we can just return it or leave it.

  if (fileId) {
    // Return direct link using lh3.googleusercontent.com which works better for image tags
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Not a Google Drive url, return as is
  return url;
};
