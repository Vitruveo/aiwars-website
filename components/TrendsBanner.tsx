// Home hero call to action for AI Wars Trends on pretrend.ai. Same ember treatment as the hero promos.

export const TRENDS_URL = "https://www.pretrend.ai/market/aiwars/";

export default function TrendsBanner() {
  return (
    <a
      href={TRENDS_URL}
      className="ember-fire group relative mt-8 flex w-full flex-col gap-4 overflow-hidden border border-ember/70 bg-[#1a0d06]/90 px-6 py-5 backdrop-blur-sm transition-colors hover:bg-[#241108]/95 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="ember-haze" aria-hidden="true" />
      <span className="relative min-w-0">
        <span className="block font-mono text-sm font-bold uppercase tracking-[0.4em] text-ember">
          <span className="ember-dot mr-3 inline-block h-2 w-2 rounded-full bg-ember align-middle" />
          AI Wars Trends · Live
        </span>
        <span className="grad-ember mt-2 block text-balance font-display text-xl font-bold sm:text-2xl">
          Call the battle every five minutes. Win credits toward a Tier 5 shard.
        </span>
      </span>
      <span className="relative shrink-0 border border-ember bg-ember px-6 py-3 text-center font-mono text-base font-bold uppercase tracking-[0.3em] text-abyss shadow-[0_0_30px_rgba(240,149,79,0.55)] transition-all group-hover:border-ink group-hover:bg-ink">
        Play Trends
      </span>
    </a>
  );
}
