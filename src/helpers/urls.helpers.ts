export const ValidUrlCheck = (url: string): string => {
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      return url;
    }
    return '';
  } catch {
    return '';
  }
};
