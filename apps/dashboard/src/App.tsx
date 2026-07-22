import { AnimatePresence } from "framer-motion";
import { AppProviders } from "./app/providers";
import { AppRouter } from "./app/router";

export function App() {
  return (
    <AppProviders>
      <AnimatePresence mode="wait">
        <AppRouter />
      </AnimatePresence>
    </AppProviders>
  );
}

export { useAuth } from "./app/providers";
export { SimpleShell as Shell } from "./app/AppShell";

