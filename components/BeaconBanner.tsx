import Reveal from "@/components/Reveal";
import Shard from "@/components/Shard";

// Mint page banner: every shard owns a sector of the Scape and its holder can plant a beacon there.
export default function BeaconBanner() {
  return (
    <div className="mt-6">
        <Reveal>
          <a href="/scape" className="panel panel-flat sweep group flex flex-col items-start gap-6 p-7 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
            <div className="shrink-0">
              <Shard tier={1} size={84} float />
            </div>
            <div className="flex-1">
              <p className="font-mono text-base uppercase tracking-[0.35em] text-ember">Plant your beacon</p>
              <p className="display mt-2 text-2xl text-ink sm:text-3xl">Every shard owns a sector of the Scape</p>
              <p className="mt-2 max-w-2xl text-lg text-dim">
                Five thousand sectors spiral out from the Archive, one per shard. Fly yours, pick a place in it and name it. Your beacon lights your tile on the world map for everyone to see.
              </p>
            </div>
            <span className="shrink-0 border border-signal bg-signal/15 px-6 py-4 font-mono text-base uppercase tracking-[0.3em] text-signal transition-all group-hover:bg-signal/25">
              Open the Scape
            </span>
          </a>
        </Reveal>
    </div>
  );
}
