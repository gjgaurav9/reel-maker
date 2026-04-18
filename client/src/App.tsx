import { useEffect, useRef, useState } from 'react';

const STYLES = ['educational', 'storytelling', 'listicle', 'motivational'] as const;
const VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'] as const;
const ASPECTS = ['9:16', '1:1', '16:9'] as const;

type Style = (typeof STYLES)[number];
type Voice = (typeof VOICES)[number];
type Aspect = (typeof ASPECTS)[number];

type StatusResponse =
  | { id: string; status: 'queued' | 'processing'; progress: number; current_step: string; created_at: string }
  | { id: string; status: 'completed'; progress: 100; download_url: string; script?: unknown; video_url?: string; created_at: string; completed_at?: string }
  | { id: string; status: 'failed'; error: string; failed_step?: string; created_at: string };

export function App() {
  const [content, setContent] = useState('');
  const [style, setStyle] = useState<Style>('educational');
  const [voice, setVoice] = useState<Voice>('nova');
  const [durationTarget, setDurationTarget] = useState(30);
  const [aspectRatio, setAspectRatio] = useState<Aspect>('9:16');

  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!jobId) return;
    if (status?.status === 'completed' || status?.status === 'failed') return;

    const tick = async () => {
      try {
        const res = await fetch(`/api/reels/${jobId}/status`);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as StatusResponse;
        setStatus(data);
      } catch (e) {
        setError((e as Error).message);
      }
    };

    tick();
    pollRef.current = window.setInterval(tick, 2000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [jobId, status?.status]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          style,
          voice,
          duration_target: durationTarget,
          aspect_ratio: aspectRatio,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`POST /reels failed (${res.status}): ${body}`);
      }
      const data = (await res.json()) as { id: string };
      setJobId(data.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setJobId(null);
    setStatus(null);
    setError(null);
  };

  const busy = !!jobId && status?.status !== 'completed' && status?.status !== 'failed';

  return (
    <main className="app">
      <header>
        <h1>Reel Maker</h1>
        <p className="sub">Content → script → voiceover → video</p>
      </header>

      <form onSubmit={submit}>
        <label>
          Content / topic
          <textarea
            rows={4}
            minLength={3}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. Three counterintuitive lessons from James Clear on habits"
            disabled={busy || submitting}
          />
        </label>

        <div className="row">
          <label>
            Style
            <select value={style} onChange={(e) => setStyle(e.target.value as Style)} disabled={busy || submitting}>
              {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label>
            Voice
            <select value={voice} onChange={(e) => setVoice(e.target.value as Voice)} disabled={busy || submitting}>
              {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        </div>

        <div className="row">
          <label>
            Duration (s)
            <input
              type="number"
              min={15}
              max={60}
              value={durationTarget}
              onChange={(e) => setDurationTarget(Number(e.target.value))}
              disabled={busy || submitting}
            />
          </label>

          <label>
            Aspect ratio
            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as Aspect)} disabled={busy || submitting}>
              {ASPECTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
        </div>

        <div className="actions">
          <button type="submit" disabled={busy || submitting}>
            {submitting ? 'Submitting…' : busy ? 'Working…' : 'Generate reel'}
          </button>
          {jobId && !busy && (
            <button type="button" onClick={reset}>New reel</button>
          )}
        </div>
      </form>

      {error && <div className="error">Error: {error}</div>}

      {status && (
        <section className="status">
          <h2>Job {status.id}</h2>
          <p>Status: <strong>{status.status}</strong></p>

          {(status.status === 'queued' || status.status === 'processing') && (
            <>
              <p>Step: {status.current_step}</p>
              <progress value={status.progress} max={100} /> {status.progress}%
            </>
          )}

          {status.status === 'failed' && (
            <p className="error">
              {status.error}{status.failed_step ? ` (at: ${status.failed_step})` : ''}
            </p>
          )}

          {status.status === 'completed' && (
            <>
              <p>
                <a href={status.download_url} download>Download MP4</a>
              </p>
              {status.video_url && (
                <video src={status.video_url} controls style={{ maxWidth: '100%' }} />
              )}
              {status.script !== undefined && (
                <details>
                  <summary>Script</summary>
                  <pre>{typeof status.script === 'string' ? status.script : JSON.stringify(status.script, null, 2)}</pre>
                </details>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
