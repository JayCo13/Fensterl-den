import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPosthogIfConsented } from "./lib/posthog";

initPosthogIfConsented();

createRoot(document.getElementById("root")!).render(<App />);
