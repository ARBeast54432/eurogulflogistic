import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-20 right-4 z-40 flex size-11 items-center justify-center rounded-full bg-navy text-navy-foreground shadow-lift transition-all hover:scale-110 hover:bg-navy-soft md:bottom-24 md:right-6"
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}
