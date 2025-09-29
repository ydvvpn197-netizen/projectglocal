/**
 * Layout Constants
 * Constants and types for layout context
 */

export const LAYOUT_CONSTANTS = {
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024
} as const;

export type LayoutConstants = typeof LAYOUT_CONSTANTS;
