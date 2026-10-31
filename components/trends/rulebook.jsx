'use client';

import { formatEther } from 'viem';

const FONT = 'var(--aw-mono), ui-monospace, monospace';
const n = (v) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 });
const vtru = (wei) => n(formatEther(BigInt(wei)));

// The rules of AIWars Trends as the AIWarsNFT contract enforces them. Numbers come from the chain when
// the game is live, else the launch defaults.
export function Rulebook({ game }) {
  const min = game ? vtru(game.gameMin) : '100';
  const max = game ? vtru(game.gameMax) : '1,000';
  const credit = game ? n(game.creditBps / 10000) : '0.5';
  const perNft = game ? vtru(game.creditsPerNft) : '100';
  const free = game?.freePlays ?? 5;
  const lock = game?.lockSeconds ?? 240;
  const cap = game?.prizeCap ?? 750;
  const minted = game?.prizesMinted ?? 0;

  const winsAtMax = Math.max(1, Math.ceil(Number(perNft.replace(/,/g, '')) / (Number(max.replace(/,/g, '')) * Number(credit))));
  const rules = [
    ['The game', `A new five-minute game opens on every five-minute mark, on the AI Wars Battle Momentum feed from the TrendPulse oracle. Bets close ${lock / 60 === Math.floor(lock / 60) ? `${lock / 60} minutes` : `${lock} seconds`} in; the rest of the window is a locked runout.`],
    ['The call', 'Pick one of five buckets, Crash, Bear, Flat, Bull or Moon, for where the window’s ordinary least squares trend settles. Bucket edges are frozen when the window opens.'],
    ['The stake', `Stake ${min} to ${max} VTRU on Vitruveo. One bet per wallet per game.`],
    ['Who can play', `You can play ${free} times without holding a Tier 1 Archive Shard. Every play stakes VTRU. From play ${free + 1} on, the wallet must hold a Tier 1 shard.`],
    ['A miss', 'Your stake is burned: sent to 0x…dEaD when the result is posted, gone for good.'],
    ['A hit', `Your stake comes back to your wallet automatically, plus ${credit}x of it in credits. Credits are not VTRU; they count toward shards.`],
    ['Credits to shards', `Every ${perNft} credits mint a Tier 5 Archive Shard straight to your wallet and are deducted from your balance. At most one shard per wallet in any 24 hours; credits beyond that carry over and mint on a later win. ${winsAtMax === 1 ? `One win at the ${max} VTRU maximum stake earns a shard.` : `At the ${max} VTRU maximum stake, a shard takes at least ${winsAtMax} wins.`}`],
    ['The cap', `At most ${n(cap)} Tier 5 shards can ever be won. ${n(minted)} won so far. After the last one, credits still count on the leaderboard but mint nothing.`],
    ['Voids and delays', 'If the oracle stores too few points, the game is voided and every stake is returned. If no result lands within 24 hours, every stake can be claimed back.'],
    ['Settlement', 'Everything settles on chain in the AIWarsNFT contract on Vitruveo. The AI Wars service posts each result from the TrendPulse oracle; the contract burns, returns and mints.'],
    ['Leaderboard', 'VTRU spent is every VTRU staked. VTRU 🔥 is stake burned on misses. Credits won is every credit ever earned. Tier 1 is shards held now; Tier 5 won is shards minted from credits.'],
  ];

  return (
    <div id="rulebook" className="aw-panel p-3 p-md-4 mt-4" style={{ scrollMarginTop: '5.5rem' }}>
      <h2 className="aw-kicker mb-3" style={{ fontSize: '0.95rem' }}>Rulebook</h2>
      <ol className="mb-0 ps-0" style={{ listStyle: 'none' }}>
        {rules.map(([k, v], i) => (
          <li key={k} className="d-flex gap-3 py-2" style={{ borderTop: i ? '1px solid rgba(143,160,186,0.15)' : 'none' }}>
            <span className="aw-faint" style={{ fontFamily: FONT, minWidth: '2rem' }}>{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className="aw-ink" style={{ fontFamily: FONT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
              <span className="d-block aw-dim" style={{ fontSize: '1.02rem' }}>{v}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
