"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: string | number;
  durationMs?: number;
};

export default function AnimatedCounter({
  value,
  durationMs = 700,
}: AnimatedCounterProps) {
  const numericValue = useMemo(() => {
    if (typeof value === "number") {
      return value;
    }

    const normalized = value.replace(/,/g, "");
    return /^-?\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : null;
  }, [value]);
  const [displayValue, setDisplayValue] = useState(numericValue ?? 0);
  const previousValueRef = useRef(numericValue ?? 0);

  useEffect(() => {
    if (numericValue === null) {
      return;
    }

    const targetValue = numericValue;
    let frame = 0;
    const start = performance.now();
    const from = previousValueRef.current;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (targetValue - from) * eased;
      setDisplayValue(Math.round(next));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        previousValueRef.current = targetValue;
      }
    }

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [durationMs, numericValue]);

  if (numericValue === null) {
    return <>{value}</>;
  }

  return <>{formatValue(displayValue)}</>;
}

function formatValue(value: string | number) {
  if (typeof value === "number") {
    return Intl.NumberFormat("en-US").format(value);
  }

  return value;
}
