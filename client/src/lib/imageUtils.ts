const MAX_BASE64_SIZE = 200 * 1024;

export interface ImageInfo {
  isBase64: boolean;
  isLargeBase64: boolean;
  url: string | null;
  canRender: boolean;
}

export function analyzeImageUrl(value: string | undefined | null): ImageInfo {
  if (!value || typeof value !== "string") {
    return { isBase64: false, isLargeBase64: false, url: null, canRender: false };
  }

  const trimmed = value.trim();

  if (trimmed.startsWith("data:")) {
    const isLarge = trimmed.length > MAX_BASE64_SIZE;
    return {
      isBase64: true,
      isLargeBase64: isLarge,
      url: isLarge ? null : trimmed,
      canRender: !isLarge,
    };
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { isBase64: false, isLargeBase64: false, url: trimmed, canRender: true };
  }

  return { isBase64: false, isLargeBase64: false, url: null, canRender: false };
}

export function extractBestImageUrl(obj: Record<string, unknown>): string | null {
  const urlKeys = ["url", "uri", "photoUrl", "imageUrl", "src", "href"];
  
  for (const key of urlKeys) {
    const value = obj[key];
    if (typeof value === "string") {
      const info = analyzeImageUrl(value);
      if (info.canRender && info.url) {
        return info.url;
      }
    }
  }

  for (const value of Object.values(obj)) {
    if (typeof value === "string") {
      const info = analyzeImageUrl(value);
      if (info.canRender && info.url) {
        return info.url;
      }
    }
  }

  return null;
}
