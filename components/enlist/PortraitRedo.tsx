"use client";

import { useEffect, useState } from "react";
import { useSignMessage } from "wagmi";
import { useMyShards } from "@/lib/useMyShards";
import { PORTRAIT_REGENS, portraitMessage } from "@/lib/enlist/profile";

// Shown only to the shard's holder: paint a new portrait, up to PORTRAIT_REGENS times.
export default function PortraitRedo({ tokenId, regens }: { tokenId: number; regens: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { address, tokenIds } = useMyShards();
  const { signMessageAsync } = useSignMessage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const left = PORTRAIT_REGENS - regens;
  if (!mounted || !address || !tokenIds.includes(tokenId)) return null;

  async function redo() {
    setBusy(true);
    setError(null);
    try {
      const ts = Date.now();
      const signature = await signMessageAsync({ message: portraitMessage(tokenId, ts) });
      const res = await fetch(`/api/enlist/portrait/${tokenId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ts, address, signature }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      window.location.reload();
    } catch (e) {
      const m = (e as { shortMessage?: string; message?: string })?.shortMessage || (e as Error)?.message || "failed";
      setError(m.length > 100 ? m.slice(0, 100) + "…" : m);
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={redo}
        disabled={busy || left <= 0}
        className="border border-hairline px-5 py-3 font-mono text-sm uppercase tracking-[0.25em] text-dim hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Painting… about 20 seconds" : "New portrait"}
      </button>
      <span className="text-base text-faint">{left > 0 ? `${left} left` : "No new portraits left"}</span>
      {error && <span className="text-base text-ember">{error}</span>}
    </div>
  );
}
