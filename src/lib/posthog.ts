import posthog from "posthog-js";

const POSTHOG_KEY_FALLBACK = "phc_yDs4HwJaYbqCrFqMyx8W3Vw4mMiwvtgEy3FLVsriQu8A";
const CONSENT_STORAGE_KEY = "blank-consent";

export type ConsentStatus = "accepted" | "declined" | "unknown";

let initialized = false;

const doInit = () => {
  if (initialized) return;
  const key = import.meta.env.VITE_POSTHOG_KEY || POSTHOG_KEY_FALLBACK;
  if (!key) return;

  posthog.init(key, {
    api_host: "https://eu.i.posthog.com",
    defaults: "2026-01-30",
    person_profiles: "identified_only",
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-ph-mask]",
    },
  });
  initialized = true;
};

export const getConsent = (): ConsentStatus => {
  if (typeof window === "undefined") return "unknown";
  const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return v === "accepted" || v === "declined" ? v : "unknown";
};

export const acceptConsent = () => {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
  doInit();
};

export const declineConsent = () => {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, "declined");
};

export const initPosthogIfConsented = () => {
  if (getConsent() === "accepted") doInit();
};

export { posthog };
