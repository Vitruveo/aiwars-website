import Logo from "@/components/Logo";
import Shard from "@/components/Shard";

// Square NFT card. Front: the AI Wars wordmark, glitching. Back: the shard over lightning.
// Rotates on its own; CSS only.
export default function ShardCard({ tier = 1, size = 320, serial = "001" }: { tier?: number; size?: number; serial?: string }) {
  return (
    <div className="flip-stage" style={{ width: size, height: size }}>
      <div className="flip-card h-full w-full">
        {/* front */}
        <div className="flip-face flex flex-col items-center justify-center bg-abyss">
          <div className="starfield" />
          <div className="scanline" />
          <div className="relative flex flex-1 items-center justify-center">
            <p className="glitch text-ink">
              <Logo className="text-[3.4rem]" />
            </p>
          </div>
          <div className="relative flex w-full items-center justify-between border-t border-hairline/80 px-4 py-3 font-mono text-sm uppercase tracking-[0.3em]">
            <span className="text-signal">Archive Shard</span>
            <span className="text-faint">No. {serial}</span>
          </div>
        </div>

        {/* back */}
        <div className="flip-face flip-back bg-abyss">
          <img src="/art/lightning.gif" alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss/30 via-transparent to-abyss/80" />
          <div className="relative flex h-full flex-col items-center justify-center">
            <Shard tier={tier} size={Math.round(size * 0.46)} float />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-signal/40 bg-abyss/70 px-4 py-3 font-mono text-sm uppercase tracking-[0.3em]">
            <span className="text-ink">Tier {String(tier).padStart(2, "0")}</span>
            <span className="text-ember">1 of 100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
