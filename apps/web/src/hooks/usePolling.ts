import { useEffect, useRef } from "react";

export function usePolling(
  callback: () => Promise<void> | void,
  intervalMs: number,
  enabled = true
) {
  const callbackRef = useRef(callback);
  const isRunningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (isRunningRef.current) {
        return;
      }

      isRunningRef.current = true;

      Promise.resolve()
        .then(() => callbackRef.current())
        .finally(() => {
          isRunningRef.current = false;
        });
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs]);
}
