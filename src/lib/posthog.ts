import posthog from "posthog-js";

const POSTHOG_KEY_FALLBACK = "phc_yDs4HwJaYbqCrFqMyx8W3Vw4mMiwvtgEy3FLVsriQu8A";

export const initPosthog = () => {
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
};

export { posthog };
