import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import { getContract } from '../lib/ethereum';

export default function VerifyPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [result, setResult] = useState<{ valid: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const state = getContract();

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!jsonInput.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const data = JSON.parse(jsonInput);

      // Load snarkjs
      const snarkjs = await import('snarkjs');

      // Load zkey and verification key
      const zkeyResponse = await fetch('/vote_0001.zkey');
      if (!zkeyResponse.ok) throw new Error('Failed to load zkey');
      const zkeyBuffer = await zkeyResponse.arrayBuffer();
      const vKey = await snarkjs.zKeyVerificationKey(new Uint8Array(zkeyBuffer));

      // Parse proof from JSON
      const proof = data.proof;
      const publicSignals = data.publicSignals;

      // snarkjs expects pi_a, pi_b, pi_c
      // If input uses "a", "b", "c" format (Solidity format), convert
      let normalizedProof = proof;
      if (proof.a && proof.b && proof.c && !proof.pi_a) {
        normalizedProof = {
          pi_a: proof.a,
          pi_b: [
            [proof.b[0][1], proof.b[0][0]],
            [proof.b[1][1], proof.b[1][0]],
          ],
          pi_c: proof.c,
        };
      }

      const valid = await snarkjs.groth16.verify(vKey, publicSignals, normalizedProof);

      if (valid) {
        setResult({ valid: true, msg: 'Proof is valid' });
      } else {
        setResult({ valid: false, msg: 'Proof verification failed' });
      }
    } catch (err: any) {
      setResult({ valid: false, msg: err.message || 'Verification error' });
    } finally {
      setLoading(false);
    }
  }

  const exampleInput = JSON.stringify({
    proof: {
      pi_a: ["0", "0"],
      pi_b: [["0", "0"], ["0", "0"]],
      pi_c: ["0", "0"]
    },
    publicSignals: ["0", "0", "0"]
  }, null, 2);

  return (
    <div>
      <header className="header">
        <div className="header-top">
          <h1>Proof Verifier</h1>
          <nav className="header-nav">
            <a href="/">Voter Portal</a>
            <a href="/chair">Chair Dashboard</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="network">Sepolia</span>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="verify-container">
        <h2>Verify a ZK Proof</h2>
        <p>
          Paste a proof JSON (proof + publicSignals) generated off-chain to verify it
          without sending a transaction. Uses the Groth16 verifier loaded from the Sepolia
          deployment.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            Expected format:
          </p>
          <pre style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-btn)', padding: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--text-dim)', overflowX: 'auto' }}>
            {exampleInput}
          </pre>
        </div>

        <form className="verify-form" onSubmit={handleVerify}>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={'Paste proof JSON here...\n\n{\n  "proof": { "pi_a": [...], "pi_b": [...], "pi_c": [...] },\n  "publicSignals": [...]\n}'}
          />
          <button
            type="submit"
            className="connect-btn"
            disabled={loading || !jsonInput.trim()}
            style={{ width: '100%' }}
          >
            {loading ? 'Verifying...' : 'Verify Proof'}
          </button>
        </form>

        {result && (
          <div className={`verify-result ${result.valid ? 'valid' : 'invalid'}`}>
            {result.valid ? '✓ ' : '✗ '}
            {result.msg}
          </div>
        )}

        {/* On-chain verification */}
        {state && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', marginBottom: '1rem' }}>
              On-Chain Verification
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
              To verify a proof on-chain, submit it via the voter portal while connected
              with an eligible wallet. The Groth16VerifierV2 contract will automatically
              verify the proof before accepting the vote.
            </p>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--amber)', wordBreak: 'break-all' }}>
              Verifier: 0x02aa9654f33Aa73880460B4f286A430c4D56CAb6
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
