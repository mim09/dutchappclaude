"use client";
import { useRef, useState } from "react";

const cache = new Map<string, string>();

export default function AudioButton({
  text, voice = "fenna", label = "Afspelen", showSpeed = false,
}: { text: string; voice?: string; label?: string; showSpeed?: boolean }) {
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const audio = useRef<HTMLAudioElement | null>(null);

  async function play() {
    setState("loading");
    try {
      const key = `${voice}|${speed}|${text}`;
      let url = cache.get(key);
      if (!url) {
        const r = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice, speed }),
        });
        if (!r.ok) throw new Error(String(r.status));
        url = URL.createObjectURL(await r.blob());
        cache.set(key, url);
      }
      audio.current?.pause();
      audio.current = new Audio(url);
      await audio.current.play();
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={play} disabled={state === "loading"}
        className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-xs">
        {state === "loading" ? "Laden..." : label}
      </button>
      {showSpeed && (
        <select value={speed} onChange={(e) => setSpeed(e.target.value as typeof speed)}
          className="rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs p-1">
          <option value="slow">Langzaam</option>
          <option value="normal">Normaal</option>
          <option value="fast">Snel</option>
        </select>
      )}
      {state === "error" && <span className="text-xs text-red-600">Audio niet beschikbaar</span>}
    </span>
  );
}
