import { useNavigate } from "@tanstack/react-router";

/**
 * Invisible, non-tabbable stealth entry point rendered on every page.
 * Three rapid clicks in the extreme bottom-right corner open the hidden
 * internal login route. No text, no link, nothing for scrapers to find.
 */
export function StealthEntry() {
  const navigate = useNavigate();

  return (
    <div
      aria-hidden="true"
      tabIndex={-1}
      onDoubleClick={() => navigate({ to: "/stealth-admin-auth" })}
      className="fixed bottom-0 right-0 z-50 size-8 cursor-default opacity-0"
    />
  );
}
