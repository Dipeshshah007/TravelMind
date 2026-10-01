const API_BASE = "/api";

/**
 * Streams the multi-agent trip-planning pipeline via Server-Sent Events.
 * Calls onProgress(event) for every agent update and onResult(data) once
 * the final itinerary is ready. Returns an abort() function.
 *
 * NOTE: SSE chunks can arrive with \r\n line endings depending on the
 * server/proxy stack. We normalize to \n before splitting on the
 * blank-line message boundary, or messages silently never parse.
 */
export function streamTripPlan(payload, { onProgress, onResult, onError }) {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/trip/plan/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const lines = chunk.split("\n");
          let event = "message";
          let data = "";
          for (const line of lines) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            if (line.startsWith("data:")) data += line.slice(5).trim();
          }
          if (!data) continue;
          const parsed = JSON.parse(data);

          if (event === "progress") onProgress?.(parsed);
          else if (event === "result") onResult?.(parsed);
          else if (event === "error") onError?.(new Error(parsed.message));
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") onError?.(err);
    }
  })();

  return () => controller.abort();
}

export async function fetchWeather(city, startDate, endDate) {
  const params = new URLSearchParams({ city, start_date: startDate, end_date: endDate });
  const res = await fetch(`${API_BASE}/weather?${params.toString()}`);
  if (!res.ok) throw new Error("Weather lookup failed");
  return res.json();
}

export async function fetchCurrency(base, target) {
  const params = new URLSearchParams({ base, target });
  const res = await fetch(`${API_BASE}/currency?${params.toString()}`);
  if (!res.ok) throw new Error("Currency lookup failed");
  return res.json();
}
