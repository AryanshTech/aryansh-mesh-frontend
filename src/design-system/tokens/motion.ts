export const motion = {
  buttonPress: { duration: '160ms', easing: 'ease-out', scale: 0.97 },
  dropdown: { duration: '150ms', easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
  modalEnter: { duration: '200ms', easing: 'ease-out' },
  modalExit: { duration: '150ms', easing: 'ease-out' },
  toast: { duration: '200ms', easing: 'ease' },
  sidebar: { duration: '0ms' },
  commandPalette: { duration: '0ms' },
} as const;

export type MotionToken = keyof typeof motion;
