/// <reference types="vite/client" />

declare global {
  interface Window {
    __SPA_INITIAL_PATH__?: string;
  }
}

export {};
