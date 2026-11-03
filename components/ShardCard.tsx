import Logo from "@/components/Logo";
import Shard from "@/components/Shard";

// Square NFT card. Front: the AI Wars wordmark, glitching. Back: the shard over the NFT video.
// Rotates on its own; CSS only.
export default function ShardCard({ tier = 1, size = 320, serial = "001", tokenId }: { tier?: number; size?: number; serial?: string; tokenId?: number }) {
  // Everything inside scales with the card so nothing clips at small slot sizes.
  const k = size / 320;
  const label = { fontSize: Math.max(11, Math.round(14 * k)), letterSpacing: k < 0.8 ? "0.18em" : "0.3em", padding: `${Math.round(12 * k)}px ${Math.round(16 * k)}px` };
  return (
    <div className="flip-stage" style={{ width: size, height: size }}>
      <div className="flip-card h-full w-full">
        {/* front */}
        <div className="flip-face flex flex-col items-center justify-center bg-abyss">
          <div className="starfield" />
          <div className="scanline" />
          <div className="relative flex flex-1 items-center justify-center">
            <p className="glitch text-ink">
              <Logo className="text-[3.4rem]" style={{ fontSize: Math.round(54 * k) }} />
            </p>
          </div>
          <div className="relative flex w-full items-center justify-between border-t border-hairline/80 font-mono uppercase" style={label}>
            <span className="text-signal">{tier === 1 ? "Archive Shard" : "Shard"}</span>
            <span className="text-faint">{tokenId ? `#${tokenId}` : `No. ${serial}`}</span>
          </div>
        </div>

        {/* back */}
        <div className="flip-face flip-back bg-abyss">
          <video src="/aiwars_nft.mp4" poster="/aiwars_nft.jpg" autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss/30 via-transparent to-abyss/80" />
          <div className="relative flex h-full flex-col items-center justify-center">
            <Shard tier={tier} size={Math.round(size * 0.46)} float />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-signal/40 bg-abyss/70 font-mono uppercase" style={label}>
            <span className="text-ink">Tier {String(tier).padStart(2, "0")}</span>
            <span className="text-ember">{tokenId ? `#${tokenId}` : "1 of 125"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
