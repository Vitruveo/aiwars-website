"use client";

import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ShardCard from "@/components/ShardCard";
import { MAX_PER_WALLET } from "@/lib/shards";
import { useMyShards } from "@/lib/useMyShards";
import { usePlaces } from "@/lib/usePlaces";

// Three slots, one per shard a wallet may buy, plus one per shard won beyond that. A held shard fills its slot with the NFT card.
export default function MyShards({ size = 200 }: { size?: number }) {
  const [mounted, setMounted] = useState(false);
  const [slot, setSlot] = useState(size);
  useEffect(() => {
    setMounted(true);
    // Three slots must fit a phone width: page gutter 40px, two gaps of 12px.
    const fit = () => setSlot(Math.min(size, Math.floor((window.innerWidth - 40 - 24) / 3)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [size]);
  const { isConnected, tokenIds } = useMyShards();
  const { byToken } = usePlaces();
  const { openConnectModal } = useConnectModal();
  const connected = mounted && isConnected;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: Math.max(MAX_PER_WALLET, tokenIds.length) }, (_, i) => {
          const id = tokenIds[i];
          if (id) {
            const tier = byToken.get(id)?.tier;
            return (
              <div key={id} className="relative">
                <div className="absolute inset-0 -z-10 rounded-full bg-signal/25 blur-[50px]" />
                <ShardCard tier={tier ?? 5} size={slot} tokenId={id} />
              </div>
            );
          }
          return (
            <a
              key={`empty-${i}`}
              href={connected ? "/mint" : undefined}
              onClick={connected ? undefined : () => openConnectModal?.()}
              className="group flex cursor-pointer flex-col items-center justify-center border border-dashed border-hairline bg-abyss/60 transition-all hover:border-signal hover:bg-signal/5"
              style={{ width: slot, height: slot }}
            >
              <span className="display text-3xl text-faint transition-colors group-hover:text-signal">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-2 font-mono text-sm uppercase tracking-[0.3em] text-faint transition-colors group-hover:text-signal">
                {connected ? "Mint" : "Connect"}
              </span>
            </a>
          );
        })}
      </div>
      <p className="font-mono text-sm uppercase tracking-[0.25em] text-faint">
        {!connected ? "Connect a wallet to see your shards" : tokenIds.length === 0 ? "No shards yet · buy up to 3 per wallet" : `${tokenIds.length} held on Vitruveo`}
      </p>
    </div>
  );
}
