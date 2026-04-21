/**
 * sse-server.js — ZK Voting SSE Server
 * Polls Sepolia every 3 seconds for new contract events via eth_getLogs.
 * Broadcasts to all connected SSE clients.
 *
 * Run: PORT=3004 node sse-server.js
 */
const http = require('http');
const { ethers } = require('ethers');

const PORT = process.env.PORT || 3004;
const CONTRACT_ADDRESS = '0x198041e195b9e8c34B5371edF67Ec84DFa68bb74';
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || 'aOOAloL3fkKN1ecrK31ZO';
const ALCHEMY_HTTP = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

const provider = new ethers.JsonRpcProvider(ALCHEMY_HTTP);

// Known event signatures (keccak256)
const EVENT_SIGS = {
  '0xb2a607b7c707939945b018f56459d2b387e8de09eed2bfde0884ffca4ee1de70': 'MotionVoted',
  '0xc8c078bfee58e5822588f08b4509ed1eb5058e03f666cca84dd2d44bf5c288a8': 'ProposalCreated',
  '0x34a42c4ce0a88d16ad098de6406057747139a2a3dd8dd8616ee7bbabcecb768e': 'ProposalFinalized',
  '0xa636f4a11e2d3ba7f89d042ecb0a6b886716e98cd49d8fd876ee0f73bced42b8': 'VoterAdded',
  '0x666f86633c8687e8f686bbe922c920e22668adbb39ae228dece3b94405a5a649': 'VotingReopened',
  '0x32ec2e17a86e8c80f3d334fc8feba6b522c0e9a8b6dd7849e1c2230bfb85094c': 'AmendmentApproved',
};

// ── Voter count state (accumulates across all polls) ────────────────────────
let voterYes = 0;
let voterNo = 0;
let voterAbstain = 0;

// ── txHash dedup set (max 100 entries) ─────────────────────────────────────
const recentTxHashes = new Set();
const TX_DEDUP_MAX = 100;

// ── Backoff state ───────────────────────────────────────────────────────────
let backoffCount = 0;
const BACKOFF_CAP = 30000;   // 30s max
const BASE_POLL_INTERVAL = 3000; // 3s
let pollIntervalMs = BASE_POLL_INTERVAL;
let pollTimer = null;

// ── Race condition guard ────────────────────────────────────────────────────
let pollInFlight = false;

let lastBlock = null;
const clients = new Set();
let initialized = false;

// Parse a single log into an event object
function parseLog(log) {
  const topics = log.topics || [];
  const sig = topics[0];
  const eventName = EVENT_SIGS[sig] || 'UnknownEvent';

  const result = {
    event: eventName,
    blockNumber: log.blockNumber,
    txHash: log.transactionHash,
    _ts: Date.now(),
  };

  // Decode topics
  try {
    if (topics[1]) result.proposalId = BigInt(topics[1]).toString();
    if (topics[2]) result.voter = '0x' + topics[2].slice(26);
    if (topics[3]) result.address2 = '0x' + topics[3].slice(26);

    // Parse data (for non-indexed fields)
    if (log.data && log.data !== '0x') {
      const dataHex = log.data.slice(2);
      if (dataHex.length === 64) {
        // Single uint256 or address
        const val = BigInt('0x' + dataHex);
        if (!result.proposalId) result.value = val.toString();
        else if (!result.choice) result.choice = val.toString();
      }
    }
  } catch (e) {
    result.parseError = e.message;
  }

  return result;
}

// Update running voter counts from a parsed event
function updateVoterCount(parsed) {
  if (parsed.event === 'MotionVoted') {
    const choice = parsed.choice ?? parsed.address2 ?? null;
    if (choice !== null) {
      // choice 0 = abstain, 1 = yes, 2 = no (common ZK voting convention)
      if (choice === '1') voterYes++;
      else if (choice === '2') voterNo++;
      else voterAbstain++;
    }
  }
}

// Emit VoterCount event to all connected clients
function emitVoterCount() {
  const total = voterYes + voterNo + voterAbstain;
  const payload = JSON.stringify({
    event: 'VoterCount',
    data: { yes: voterYes, no: voterNo, abstain: voterAbstain, total },
    _ts: Date.now(),
  });
  let sent = 0;
  const dead = new Set();
  for (const client of clients) {
    try {
      client.write(`data: ${payload}\n\n`);
      sent++;
    } catch {
      dead.add(client);
    }
  }
  // ── Fix 3: delete after iteration ──────────────────────────────────────
  for (const client of dead) clients.delete(client);
  if (sent > 0) {
    console.log(`[→${sent}/${clients.size}] VoterCount { yes:${voterYes} no:${voterNo} abstain:${voterAbstain} total:${total} }`);
  }
}

// Raw eth_getLogs poll
async function pollEvents() {
  // ── Fix 1: race condition guard ─────────────────────────────────────────
  if (pollInFlight) {
    console.log('[Poll] Skipping — previous poll still in flight');
    return;
  }
  pollInFlight = true;

  try {
    const currentBlock = await provider.getBlockNumber();

    if (lastBlock === null) {
      // First run — just record the current block, emit initial VoterCount
      lastBlock = currentBlock;
      console.log(`[Poll] Starting from block ${currentBlock}`);
      emitVoterCount();
      return;
    }

    if (currentBlock <= lastBlock) {
      // No new blocks — still emit VoterCount so frontend stays fresh
      emitVoterCount();
      return;
    }

    const fromBlock = lastBlock + 1;

    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getLogs',
      params: [{
        address: CONTRACT_ADDRESS,
        fromBlock: '0x' + fromBlock.toString(16),
        toBlock: '0x' + currentBlock.toString(16),
      }]
    });

    const res = await fetch(ALCHEMY_HTTP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    // ── Fix 4: 429 backoff ─────────────────────────────────────────────────
    if (res.status === 429) {
      backoffCount++;
      pollIntervalMs = Math.min(pollIntervalMs * 2, BACKOFF_CAP);
      console.warn(`[Poll] 429 rate-limited — backoff ×${backoffCount}, interval → ${pollIntervalMs}ms`);
      res.body?.cancel?.(); // discard body to free the connection
      emitVoterCount();
      reschedulePoll();
      return;
    }

    if (!res.ok) {
      console.error('[Poll] HTTP error:', res.status);
      emitVoterCount();
      return;
    }

    let data;
    try {
      data = await res.json();
    } catch {
      console.error('[Poll] Failed to parse JSON response');
      emitVoterCount();
      return;
    }

    const logs = data.result || data;

    if (!Array.isArray(logs) || logs.length === 0) {
      // ── Fix 4: reset backoff on success ──────────────────────────────────
      if (backoffCount > 0) {
        backoffCount = 0;
        pollIntervalMs = BASE_POLL_INTERVAL;
        console.log('[Poll] Backoff reset to 3s');
      }
      lastBlock = currentBlock;
      emitVoterCount();
      return;
    }

    // Reset backoff on successful log fetch with results
    if (backoffCount > 0) {
      backoffCount = 0;
      pollIntervalMs = BASE_POLL_INTERVAL;
      console.log('[Poll] Backoff reset to 3s');
    }

    console.log(`[Poll] ${logs.length} new event(s) block ${fromBlock}–${currentBlock}`);

    // ── Fix 5: txHash dedup ─────────────────────────────────────────────────
    for (const log of logs) {
      const txHash = log.transactionHash;
      if (recentTxHashes.has(txHash)) {
        console.log(`[Poll] Deduping duplicate txHash: ${txHash}`);
        lastBlock = Math.max(lastBlock, parseInt(log.blockNumber, 16));
        continue;
      }

      if (recentTxHashes.size >= TX_DEDUP_MAX) {
        // Evict oldest entry (first inserted)
        const oldest = recentTxHashes.values().next().value;
        recentTxHashes.delete(oldest);
      }
      recentTxHashes.add(txHash);

      const parsed = parseLog(log);
      updateVoterCount(parsed);
      emit(parsed);
      lastBlock = Math.max(lastBlock, parseInt(log.blockNumber, 16));
    }

    // Emit updated voter counts after processing all logs
    emitVoterCount();
  } catch (err) {
    console.error('[Poll] Error:', err.message);
    emitVoterCount();
  } finally {
    pollInFlight = false;
    reschedulePoll();
  }
}

// Reschedule the poll timer with the current (possibly backoff-adjusted) interval
function reschedulePoll() {
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = setTimeout(pollEvents, pollIntervalMs);
}

// ── Fix 2: emit() with dead-client Set (delete after iteration) ─────────────
function emit(data) {
  const payload = JSON.stringify(data);
  let sent = 0;
  // ── Fix 3: collect dead clients, delete after ───────────────────────────
  const dead = new Set();
  for (const client of clients) {
    try {
      client.write(`data: ${payload}\n\n`);
      sent++;
    } catch {
      dead.add(client);
    }
  }
  for (const client of dead) clients.delete(client);
  console.log(`[→${sent}/${clients.size}] ${data.event} (block ${data.blockNumber})`);
}

function handleSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch { clearInterval(ping); } }, 25000);
  clients.add(res);
  console.log(`[SSE+] +1 (total: ${clients.size})`);

  // ── Fix 2: only send "connected" once lastBlock is populated ───────────
  if (lastBlock !== null) {
    res.write(`data: ${JSON.stringify({ event: 'connected', data: { status: 'ok', contract: CONTRACT_ADDRESS, lastBlock } })}\n\n`);
  }
  // Otherwise the first poll will send connected once initialized

  req.on('close', () => { clearInterval(ping); clients.delete(res); console.log(`[SSE-] -1 (total: ${clients.size})`); });
}

const server = http.createServer((req, res) => {
  if (req.url === '/events') { handleSSE(req, res); }
  else if (req.url === '/health') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ status: 'ok', clients: clients.size, lastBlock, pollIntervalMs })); }
  else { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('ZK Voting SSE\n/events | /health'); }
});

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`[SSE] http://0.0.0.0:${PORT}/events`);
  console.log(`[SSE] Contract: ${CONTRACT_ADDRESS}`);

  // ── Fix 2: await initial block before starting poll ─────────────────────
  const b = await provider.getBlockNumber();
  lastBlock = b;
  initialized = true;
  console.log(`[Init] Current block: ${b}`);

  // Send connected event to any clients that connected before lastBlock was set
  const connectedPayload = JSON.stringify({ event: 'connected', data: { status: 'ok', contract: CONTRACT_ADDRESS, lastBlock: b } });
  for (const client of clients) {
    try { client.write(`data: ${connectedPayload}\n\n`); } catch { /* client already dead */ }
  }

  // Emit initial voter count
  emitVoterCount();

  // Start polling
  pollTimer = setTimeout(pollEvents, pollIntervalMs);
  console.log(`[Poll] Active (${pollIntervalMs}ms interval)`);
});

process.on('SIGTERM', () => { if (pollTimer) clearTimeout(pollTimer); server.close(); process.exit(0); });
process.on('SIGINT', () => { if (pollTimer) clearTimeout(pollTimer); server.close(); process.exit(0); });
