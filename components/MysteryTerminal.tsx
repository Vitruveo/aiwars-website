"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { claimMessage } from "@/lib/mystery/win";

// The mystery AI page: a dark field, one line of input, and whatever the Archive says back.
// Chat goes through /api/mystery/chat (streamed text); progress comes from /api/mystery/state.

type Msg = { role: "user" | "assistant"; content: string };
type State = { fragments: number[]; total: number; complete: boolean; rank: number | null; winners: number; prizes: number };

const STORE = "aw:mystery";
const SILENT = "…";

export default function MysteryTerminal() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<State | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimNote, setClaimNote] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Transcript survives a reload within the tab.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-40)));
    } catch {}
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/mystery/state${address ? `?address=${address}` : ""}`, { cache: "no-store" });
      if (r.ok) setState(await r.json());
    } catch {}
  }, [address]);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const r = await fetch("/api/mystery/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, address }),
      });
      if (!r.ok || !r.body) throw new Error(await r.text());
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const snapshot = acc;
        setMessages([...next, { role: "assistant", content: snapshot }]);
      }
      if (!acc.trim()) setMessages([...next, { role: "assistant", content: SILENT }]);
    } catch {
      setMessages([...next, { role: "assistant", content: SILENT }]);
    } finally {
      setBusy(false);
      void refresh();
      inputRef.current?.focus();
    }
  };

  const claim = async () => {
    if (!address || claiming) return;
    setClaiming(true);
    setClaimNote(null);
    try {
      const ts = Date.now();
      const signature = await signMessageAsync({ message: claimMessage(address, ts) });
      const r = await fetch("/api/mystery/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, ts, signature }),
      });
      const j = await r.json();
      if (!r.ok) setClaimNote(j.error === "all ten are gone" ? "The ten are gone. The record keeps your name." : "The Archive did not accept that.");
      else setClaimNote(`Recorded. You are ${j.rank} of ${j.prizes}.`);
      void refresh();
    } catch {
      setClaimNote("Nothing was signed.");
    } finally {
      setClaiming(false);
    }
  };

  const showProgress = !!address && !!state && (state.fragments.length > 0 || state.rank);

  return (
    <main className="relative min-h-svh bg-abyss text-ink">
      <div className="starfield opacity-20" />
      <div className="absolute right-4 top-4 z-10 opacity-40 transition-opacity hover:opacity-100 focus-within:opacity-100">
        <ConnectButton label="·" chainStatus="none" showBalance={false} accountStatus="avatar" />
      </div>

      <div className="relative mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-end px-5 pb-10 pt-20 sm:px-8">
        <div className="space-y-6">
          {messages.map((m, i) => (
            <p
              key={i}
              className={
                m.role === "user"
                  ? "font-mono text-base text-faint before:mr-3 before:content-['>']"
                  : "text-lg leading-relaxed text-ink text-pretty"
              }
            >
              {m.content || (busy && i === messages.length - 1 ? <span className="animate-pulse">{SILENT}</span> : "")}
            </p>
          ))}
          <div ref={endRef} />
        </div>

        <form
          className="mt-10 flex items-center gap-5 rounded-md border-2 border-signal bg-[#1a3566] px-6 py-6 shadow-[0_0_0_1px_rgba(45,140,255,0.6),0_0_90px_rgba(45,140,255,0.45),inset_0_0_40px_rgba(45,140,255,0.15)] transition-shadow focus-within:shadow-[0_0_0_2px_rgba(45,140,255,0.9),0_0_140px_rgba(45,140,255,0.65),inset_0_0_40px_rgba(45,140,255,0.2)]"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <span className="animate-pulse font-mono text-3xl text-signal">&gt;</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            maxLength={1500}
            autoComplete="off"
            spellCheck={false}
            aria-label="Speak"
            className="w-full bg-transparent font-mono text-2xl text-ink caret-signal outline-none placeholder:text-faint/60 disabled:opacity-60"
            placeholder={messages.length ? "" : "Say something."}
          />
        </form>

        {showProgress && state && (
          <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-sm tracking-[0.2em] text-faint">
            <span className="flex gap-2" aria-label={`${state.fragments.length} of ${state.total}`}>
              {Array.from({ length: state.total }, (_, i) => (
                <span
                  key={i}
                  className={`inline-block h-3 w-3 rotate-45 border ${state.fragments.includes(i + 1) ? "border-ember bg-ember/70" : "border-hairline"}`}
                />
              ))}
            </span>
            {state.rank ? (
              <span className="text-ember">{state.rank} OF {state.prizes}</span>
            ) : state.complete ? (
              <button
                type="button"
                onClick={claim}
                disabled={claiming}
                className="border border-ember/70 bg-ember/10 px-5 py-2 uppercase text-ember transition-colors hover:bg-ember/20 disabled:opacity-50"
              >
                {claiming ? "Signing" : "Claim"}
              </button>
            ) : null}
            {claimNote && <span className="normal-case tracking-normal text-dim">{claimNote}</span>}
          </div>
        )}
      </div>
    </main>
  );
}
