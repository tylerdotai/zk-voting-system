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
const CONTRACT_ADDRESS = '0xb3254AB74e5103F7374eEcDb57078eB10388CaC3';
const ALCHEMY_HTTP = 'https://eth-sepolia.g.alchemy.com/v2/sC-QFWsXNmQSRD5xmfSu3';

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

// Raw eth_getLogs poll
async function pollEvents() {
  try {
    const currentBlock = await provider.getBlockNumber();

    if (lastBlock === null) {
      // First run — just record the current block, don't backfill
      lastBlock = currentBlock;
      console.log(`[Poll] Starting from block ${currentBlock}`);
      return;
    }

    if (currentBlock <= lastBlock) return;

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

    if (!res.ok) {
      console.error('[Poll] HTTP error:', res.status);
      return;
    }

    const data = await res.json();
    const logs = data.result || data;

    if (!Array.isArray(logs) || logs.length === 0) {
      lastBlock = currentBlock;
      return;
    }

    console.log(`[Poll] ${logs.length} new event(s) block ${fromBlock}–${currentBlock}`);
    for (const log of logs) {
      const parsed = parseLog(log);
      emit(parsed);
      lastBlock = Math.max(lastBlock, parseInt(log.blockNumber, 16));
    }
  } catch (err) {
    console.error('[Poll] Error:', err.message);
  }
}

let lastBlock = null;
const clients = new Set();

function emit(data) {
  const payload = JSON.stringify(data);
  let sent = 0;
  for (const client of clients) {
    try {
      client.write(`data: ${payload}\n\n`);
      sent++;
    } catch {
      clients.delete(client);
    }
  }
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
  res.write(`data: ${JSON.stringify({ event: 'connected', data: { status: 'ok', contract: CONTRACT_ADDRESS, lastBlock } })}\n\n`);
  req.on('close', () => { clearInterval(ping); clients.delete(res); console.log(`[SSE-] -1 (total: ${clients.size})`); });
}

const server = http.createServer((req, res) => {
  if (req.url === '/events') { handleSSE(req, res); }
  else if (req.url === '/health') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ status: 'ok', clients: clients.size, lastBlock })); }
  else { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('ZK Voting SSE\n/events | /health'); }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SSE] http://0.0.0.0:${PORT}/events`);
  console.log(`[SSE] Contract: ${CONTRACT_ADDRESS}`);

  // Initialize lastBlock
  provider.getBlockNumber().then(b => { lastBlock = b; console.log(`[Init] Current block: ${b}`); });

  // Start polling every 3s
  setInterval(pollEvents, 3000);
  console.log('[Poll] Active (3s interval)');
});

process.on('SIGTERM', () => { server.close(); process.exit(0); });
process.on('SIGINT', () => { server.close(); process.exit(0); });
