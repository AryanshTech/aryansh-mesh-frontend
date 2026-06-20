export const easeOut = 'cubic-bezier(0.23, 1, 0.32, 1)';
export const easeInOut = 'cubic-bezier(0.77, 0, 0.175, 1)';

export const motion = {
  buttonPress: { duration: '160ms', easing: easeOut, scale: 0.97 },
  dropdown: { duration: '150ms', easing: easeOut },
  modalEnter: { duration: '200ms', easing: easeOut },
  modalExit: { duration: '150ms', easing: easeOut },
  toast: { duration: '200ms', easing: 'ease' },
  sidebar: { duration: '0ms' },
  commandPalette: { duration: '0ms' },
  themeTransition: { duration: '200ms', easing: easeOut },
  popoverEnter: { duration: '125ms', easing: easeOut, scale: 0.97 },
} as const;

export type MotionToken = keyof typeof motion;
