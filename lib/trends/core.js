// Server core for AI Wars Trends on this site. The AIWarsNFT contract on Vitruveo is the source of truth
// for bets, burns, credits and prizes; this module reads it, freezes each window's bucket edges, fits the
// window against the TrendPulse oracle and posts the result (or a void) as the result signer, then pushes
// settlement for any bettors result() did not cover. Shared state lives in the trends_kv table on Neon.
//
// Env: AIWARS_SERVICE_PRIVATE_KEY (the contract's `service`), falling back to OWNER_PRIVATE_KEY (the
// contract owner may post results too); VITRUVEO_RPC_URL optional.

import { createPublicClient, createWalletClient, getAddress, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import contracts from '@/data/aiwars-contracts.json';
import { vitruveo } from '@/lib/chains';
import {
  SOURCE,
  GAME_S,
  LOCK_S,
  SETTLE_DELAY_S,
  MIN_SETTLE_POINTS,
  gameStartFor,
  gameIdFor,
  parseGameId,
  tsOls,
  bLimitFor,
  phaseOf,
  bucketOf,
} from './gamemath';
import { fetchSeries, getCalibration } from './live';
import { kvDel, kvGet, kvSet } from './kv';

const RPC_URL = process.env.VITRUVEO_RPC_URL || vitruveo.rpcUrls.default.http[0];
const AIWARS_NFT = getAddress(contracts.vitruveo.AIWarsNFT);
const NFT_ABI = contracts.abi.AIWarsNFT;
const VNS_REGISTRAR = '0xD974784f0f87301Bdf92292CAee91dF5ff0a1394';
const VNS_ABI = [
  { type: 'function', name: 'namesOf', stateMutability: 'view', inputs: [{ name: 'wallet', type: 'address' }], outputs: [{ type: 'string[]' }] },
];
const GAME_TTL_MS = 86400 * 1000;
const VNS_TTL_MS = 86400 * 1000;
const LEADERBOARD_SIZE = 20;

const key = {
  thresholds: (start) => `trends:thr:${start}`, // bucket edges frozen for one window
  fit: (start) => `trends:fit:${start}`, // the window's final series and OLS fit
  resultJob: (start) => `trends:result:${start}`, // on-chain result()/voidGame() tx for a window
  resultLock: 'trends:resultlock',
  vns: (a) => `trends:vns:${a}`,
};

const chain = createPublicClient({ chain: vitruveo, transport: http(RPC_URL) });
const read = (functionName, args) => chain.readContract({ address: AIWARS_NFT, abi: NFT_ABI, functionName, args });
const nowS = () => Math.floor(Date.now() / 1000);

let serviceWallet = null;
function getServiceWallet() {
  const pk = process.env.AIWARS_SERVICE_PRIVATE_KEY || process.env.OWNER_PRIVATE_KEY;
  if (!pk) return null;
  serviceWallet ??= createWalletClient({
    account: privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`),
    chain: vitruveo,
    transport: http(RPC_URL),
  });
  return serviceWallet;
}

export function normAddress(a) {
  try {
    return getAddress(a);
  } catch (e) {
    return null;
  }
}

// ------------------------------------------------------------------ rules

let settingsMemo = null; // { value, expiresAt }
async function readGameSettings() {
  const now = nowS();
  if (settingsMemo && settingsMemo.expiresAt > now) return settingsMemo.value;
  const names = ['gameMin', 'gameMax', 'creditBps', 'creditsPerNft', 'freePlays', 'lockSeconds', 'totalBurned', 'service', 'PRIZE_CAP', 'prizesMinted', 'PRIZE_COOLDOWN'];
  const [gameMin, gameMax, creditBps, creditsPerNft, freePlays, lockSeconds, totalBurned, service, prizeCap, prizesMinted, prizeCooldown] = await Promise.all(names.map((n) => read(n)));
  const value = {
    gameMin: gameMin.toString(),
    gameMax: gameMax.toString(),
    creditBps: Number(creditBps),
    creditsPerNft: creditsPerNft.toString(),
    freePlays: Number(freePlays),
    lockSeconds: Number(lockSeconds),
    totalBurned: totalBurned.toString(),
    prizeCap: Number(prizeCap),
    prizesMinted: Number(prizesMinted),
    prizeCooldown: Number(prizeCooldown), // seconds between Tier 5 shards for one player
    service,
  };
  settingsMemo = { value, expiresAt: now + 60 };
  return value;
}

// The v3 rule getters revert on the v2 contract; the client treats creditsPerNft == 0 as "not live".
export async function gameConfig() {
  const game = await readGameSettings().catch(() => ({
    gameMin: '0', gameMax: '0', creditBps: 0, creditsPerNft: '0', freePlays: 5, lockSeconds: 240,
    totalBurned: '0', prizeCap: 750, prizesMinted: 0, prizeCooldown: 86400, service: null,
  }));
  return { nft: AIWARS_NFT, chainId: vitruveo.id, game: { ...game, serviceConfigured: !!getServiceWallet() } };
}

// ------------------------------------------------------------------ access

async function readHolding(address) {
  const balance = await read('balanceOf', [address]);
  if (balance < 1n) return { eligible: false, tokenId: null, balance: 0 };
  let tokenId = null;
  try {
    tokenId = Number(await read('tokenOfOwnerByIndex', [address, 0n]));
  } catch (e) {}
  return { eligible: true, tokenId, balance: Number(balance) };
}

// Who may bet: five plays without holding a Tier 1 shard, then a Tier 1 shard. The contract enforces it;
// this mirrors it for the UI with the player's record.
export async function handleEligibility(addressRaw) {
  const address = normAddress(addressRaw);
  if (!address) return [400, { error: 'bad address' }];
  const base = { nft: AIWARS_NFT, mintUrl: '/mint' };
  let player, freeLeft, tier1, balance;
  try {
    [player, freeLeft, tier1, balance] = await Promise.all([
      read('playerOf', [address]),
      read('freePlaysLeft', [address]),
      read('tierCount', [address, 1]),
      read('balanceOf', [address]),
    ]);
  } catch (e) {
    // v2 contract (not upgraded yet): plain holding
    const holding = await readHolding(address);
    return [200, { ...base, ...holding, legacy: true }];
  }
  const tier1Count = Number(tier1);
  const left = Number(freeLeft);
  return [
    200,
    {
      ...base,
      eligible: left > 0 || tier1Count > 0,
      freePlaysLeft: left,
      tier1Count,
      balance: Number(balance),
      plays: Number(player.plays),
      wins: Number(player.wins),
      credits: player.credits.toString(),
      creditsEarned: player.creditsEarned.toString(),
      tier5Won: Number(player.tier5Won),
      // earliest time (unix seconds) the next Tier 5 shard can mint for this wallet; 0 = no wait
      nextPrizeAt: Number(player.lastPrizeAt) ? Number(player.lastPrizeAt) + 86400 : 0,
    },
  ];
}

// ------------------------------------------------------------------ clock and windows

export async function handleLive() {
  const cal = await getCalibration();
  const now = nowS();
  const start = gameStartFor(now);
  return [
    200,
    {
      source: SOURCE,
      gameS: GAME_S,
      lockS: LOCK_S,
      settleDelayS: SETTLE_DELAY_S,
      serverNow: now,
      start,
      gameId: gameIdFor(start),
      phase: phaseOf(start, now),
      thresholds: cal.thresholds,
      bLimit: bLimitFor(cal.thresholds),
      calibration: { windows: cal.windows, calibratedAt: cal.calibratedAt, fallback: !!cal.fallback },
    },
  ];
}

// Bucket edges for one window, frozen the first time anyone asks so bettors and settlement agree even if
// the calibration moves mid-window.
async function windowThresholds(start) {
  const raw = await kvGet(key.thresholds(start));
  if (raw) return JSON.parse(raw);
  const cal = await getCalibration();
  await kvSet(key.thresholds(start), JSON.stringify(cal.thresholds), { ttlMs: GAME_TTL_MS, nx: true });
  return JSON.parse((await kvGet(key.thresholds(start))) || 'null') || cal.thresholds;
}

async function readChainResult(start) {
  const [resolved, bucket, voided] = await read('gameResult', [BigInt(start)]);
  return { resolved, voided, bucket: resolved && !voided ? Number(bucket) : null };
}

async function readGameInfo(start) {
  const [bettors, , settled] = await read('gameInfo', [BigInt(start)]);
  return { bettors: Number(bettors), settled: Number(settled) };
}

export async function handleWindow(startRaw) {
  const start = parseInt(startRaw, 10);
  if (!Number.isFinite(start) || start % GAME_S !== 0) return [400, { error: 'bad start' }];
  const now = nowS();
  const [thresholds, onchain] = await Promise.all([
    windowThresholds(start),
    readChainResult(start).catch(() => ({ resolved: false, voided: false, bucket: null })),
  ]);
  return [200, { start, gameId: gameIdFor(start), serverNow: now, phase: phaseOf(start, now), thresholds, bLimit: bLimitFor(thresholds), ...onchain }];
}

// The window's final series and OLS fit, fetched from the oracle once and shared.
async function settledFit(start) {
  const cached = await kvGet(key.fit(start));
  if (cached) return JSON.parse(cached);
  const series = await fetchSeries(start, start + GAME_S - 1);
  series.sort((x, y) => x[0] - y[0]);
  const fit = series.length >= MIN_SETTLE_POINTS ? tsOls(series, start) : null; // x from window start, as drawn
  const rec = { series, fit, void: !fit };
  await kvSet(key.fit(start), JSON.stringify(rec), { ttlMs: GAME_TTL_MS });
  return rec;
}

// ------------------------------------------------------------------ settlement

// Settle a closed window: fit it, map the trend to a bucket with the window's frozen edges and post
// result() (or voidGame() on an oracle gap). result() burns losing stakes and settles the first 25
// bettors; settle() covers the rest. Windows nobody bet on post nothing. Idempotent; safe from any
// client poll or the cron.
export async function handleSettle(gameId) {
  const start = parseGameId(gameId);
  if (start === null) return [400, { error: 'bad gameId' }];
  const now = nowS();
  const phase = phaseOf(start, now);
  if ((phase !== 'ended' && phase !== 'settling') || now < start + GAME_S + SETTLE_DELAY_S) {
    return [200, { start, gameId, phase, serverNow: now, settled: false }];
  }

  const thresholds = await windowThresholds(start);
  const fitRec = await settledFit(start);
  const bucket = fitRec.void ? null : bucketOf(fitRec.fit.trendAbs, thresholds);
  let onchain = await readChainResult(start).catch(() => ({ resolved: false, voided: false, bucket: null }));
  let info = await readGameInfo(start).catch(() => ({ bettors: 0, settled: 0 }));
  let job = JSON.parse((await kvGet(key.resultJob(start))) || 'null');
  const wallet = getServiceWallet();

  if (wallet && info.bettors > 0 && (!onchain.resolved || info.settled < info.bettors)) {
    const locked = await kvSet(key.resultLock, String(start), { ttlMs: 30000, nx: true });
    if (locked) {
      try {
        if (!onchain.resolved && !job?.txHash) {
          const hash = fitRec.void
            ? await wallet.writeContract({ address: AIWARS_NFT, abi: NFT_ABI, functionName: 'voidGame', args: [BigInt(start)] })
            : await wallet.writeContract({ address: AIWARS_NFT, abi: NFT_ABI, functionName: 'result', args: [BigInt(start), bucket] });
          job = { bucket, void: !!fitRec.void, txHash: hash, at: Date.now() };
          await kvSet(key.resultJob(start), JSON.stringify(job), { ttlMs: GAME_TTL_MS });
          await chain.waitForTransactionReceipt({ hash, timeout: 20000 }).catch(() => null);
          onchain = await readChainResult(start).catch(() => onchain);
          info = await readGameInfo(start).catch(() => info);
        }
        if (onchain.resolved && info.settled < info.bettors) {
          const hash = await wallet.writeContract({ address: AIWARS_NFT, abi: NFT_ABI, functionName: 'settle', args: [BigInt(start), 100n] });
          await chain.waitForTransactionReceipt({ hash, timeout: 20000 }).catch(() => null);
          info = await readGameInfo(start).catch(() => info);
        }
      } catch (e) {
        const msg = e.shortMessage || e.message;
        if (!/already resolved/.test(msg)) console.error('[trends] result/settle failed:', start, msg);
        onchain = await readChainResult(start).catch(() => onchain);
      } finally {
        await kvDel(key.resultLock);
      }
    }
  }

  return [
    200,
    {
      start,
      gameId,
      phase,
      serverNow: now,
      settled: true,
      void: !!fitRec.void,
      thresholds,
      bLimit: bLimitFor(thresholds),
      series: fitRec.series,
      fit: fitRec.fit,
      bucket,
      resolved: onchain.resolved,
      voided: !!onchain.voided,
      onchainBucket: onchain.bucket,
      bettors: info.bettors,
      settledBettors: info.settled,
      txHash: job?.txHash || null,
      serviceConfigured: !!wallet,
    },
  ];
}

// Settle the most recently closed window (cron or external pinger backstop).
export async function handleSettleLatest() {
  return handleSettle(gameIdFor(gameStartFor(nowS()) - GAME_S));
}

// ------------------------------------------------------------------ leaderboard

async function vnsName(address) {
  const cached = await kvGet(key.vns(address)).catch(() => null);
  if (cached !== null) return cached;
  let name = '';
  try {
    const names = await chain.readContract({ address: VNS_REGISTRAR, abi: VNS_ABI, functionName: 'namesOf', args: [address] });
    name = names?.[0] || '';
  } catch (e) {}
  await kvSet(key.vns(address), name, { ttlMs: VNS_TTL_MS }).catch(() => {});
  return name;
}

const wei2 = (w) => Number(BigInt(w) / 10n ** 16n) / 100;

// Player, VTRU spent (stake not returned), credits won, games played and won, Tier 1 shards held, Tier 5
// shards won. Sorted by credits won.
export async function getLeaderboard() {
  let addrs = [];
  let stats = [];
  try {
    const n = await read('playerCount');
    if (n === 0n) return [];
    [addrs, stats] = await read('players', [0n, n]);
  } catch (e) {
    return []; // contract not upgraded to v3 yet
  }
  const rows = addrs
    .map((address, i) => {
      const p = stats[i];
      return { address, spent: wei2(p.staked - p.returned), credits: wei2(p.creditsEarned), played: Number(p.plays), won: Number(p.wins), tier5: Number(p.tier5Won) };
    })
    .sort((a, b) => b.credits - a.credits || b.won - a.won || b.played - a.played)
    .slice(0, LEADERBOARD_SIZE);
  const [names, tier1] = await Promise.all([
    Promise.all(rows.map((row) => vnsName(row.address).catch(() => ''))),
    Promise.all(rows.map((row) => read('tierCount', [row.address, 1]).then(Number).catch(() => null))),
  ]);
  return rows.map((row, i) => ({ ...row, name: names[i], tier1: tier1[i] }));
}
