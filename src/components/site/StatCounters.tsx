import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

import { STATS } from "@/lib/site";
import { cn } from "@/lib/utils";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref} className="mono-num">
      {display}
      {suffix}
    </span>
  );
}

export function StatCounters({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-6 lg:grid-cols-4", className)}>
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="border-l-2 border-amber pl-4"
        >
          <p className="text-3xl font-black text-navy-foreground sm:text-4xl">
            <Counter value={stat.value} suffix={stat.suffix} />
          </p>
          <p className="label-caps mt-2 text-navy-muted">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
