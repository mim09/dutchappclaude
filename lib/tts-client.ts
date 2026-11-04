const cache = new Map<string, string>();

export async function playTts(text: string, voice = "fenna", speed = "normal"): Promise<void> {
  const key = `${voice}|${speed}|${text}`;
  let url = cache.get(key);
  if (!url) {
    const r = await fetch("/api/tts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, speed }),
    });
    if (!r.ok) throw new Error(`tts ${r.status}`);
    url = URL.createObjectURL(await r.blob());
    cache.set(key, url);
  }
  const audio = new Audio(url);
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("playback failed"));
    audio.play().catch(reject);
  });
}
