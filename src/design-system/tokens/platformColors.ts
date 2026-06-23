export type SocialPlatform =
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'LINKEDIN'
  | 'PRODUCT_HUNT'
  | 'X'
  | 'YOUTUBE'
  | 'THREADS'
  | 'BLUESKY'
  | 'MASTODON'
  | 'FACEBOOK'
  | 'PINTEREST'
  | 'REDDIT';

/** Third-party brand colors for platform badges (inline style only). */
export const platformColors: Record<SocialPlatform, string> = {
  INSTAGRAM: '#E4405F',
  TIKTOK: '#00F2EA',
  LINKEDIN: '#0A66C2',
  PRODUCT_HUNT: '#DA552F',
  X: '#ffffff',
  YOUTUBE: '#FF0000',
  THREADS: '#000000',
  BLUESKY: '#0085FF',
  MASTODON: '#6364FF',
  FACEBOOK: '#1877F2',
  PINTEREST: '#E60023',
  REDDIT: '#FF4500',
};
