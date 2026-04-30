import React, { useState, useEffect } from 'react';

type ProofStatus = 'idle' | 'generating' | 'done' | 'error';

interface ZKProofResult {
  proof: any;
  publicSignals: string[];
  nullifierHash: string;
  commitment: string;
}

interface ZKProofProps {
  voteChoice: number;
  nullifierSeed: bigint;
  voterAddress: string;
  proposalId: number;
  onProofReady: (result: ZKProofResult) => void;
  onError?: (msg: string) => void;
}

export default function ZKProof({
  voteChoice,
  nullifierSeed,
  voterAddress,
  proposalId,
  onProofReady,
  onError,
}: ZKProofProps) {
  const [status, setStatus] = useState<ProofStatus>('idle');
  const [step, setStep] = useState(1);

  async function runProof() {
    setStatus('generating');
    setStep(1);
    try {
      // Step 1: Compute signals
      setStep(1);
      const addr = BigInt(voterAddress);

      // Use circomlibjs for same Poseidon as circuit
      const { buildPoseidon } = await import('circomlibjs');
      const poseidon = await buildPoseidon();

      const F = poseidon.F;
      const toBigInt = (f: any) => F.toObject(f);

      const nullifierHash = toBigInt(poseidon([nullifierSeed]));
      const commitment = toBigInt(poseidon([nullifierSeed, addr]));

      // Step 2: Load circuit
      setStep(2);
      const [wasmResponse, zkeyResponse] = await Promise.all([
        fetch('/vote.wasm'),
        fetch('/vote_0001.zkey'),
      ]);
      if (!wasmResponse.ok || !zkeyResponse.ok) throw new Error('Failed to load circuit files');

      const wasmBuffer = await wasmResponse.arrayBuffer();
      const zkeyBuffer = await zkeyResponse.arrayBuffer();

  // Step 3: Generate proof
      setStep(3);
      const snarkjs = await import('snarkjs');
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        {
          proposal_id: proposalId,
          nullifier_hash: nullifierHash,
          commitment,
          vote_choice: voteChoice,
          nullifier_seed: nullifierSeed,
          voter_address: addr,
        },
        new Uint8Array(wasmBuffer),
        new Uint8Array(zkeyBuffer)
      );

      setStep(4);
      setStatus('done');

      onProofReady({ proof, publicSignals, nullifierHash: String(publicSignals[1]), commitment: String(publicSignals[2]) });
    } catch (e: any) {
      setStatus('error');
      onError?.(e.message || 'Proof generation failed');
    }
  }

  // Auto-run on mount
  useEffect(() => {
    runProof();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    { label: 'Computing commitments', desc: 'Poseidon hash of nullifier & address' },
    { label: 'Loading circuit', desc: 'WASM + proving key' },
    { label: 'Generating proof', desc: 'Witness computation + proof' },
    { label: 'Verifying', desc: 'SNARK verification' },
  ];

  return (
    <div className="zk-steps">
      {steps.map((s, i) => {
        const n = i + 1;
        const isDone = status === 'done' && n < step;
        const isActive = (status === 'generating' && n === step) || (status === 'done' && n === step);
        const cls = isDone ? 'done' : isActive ? 'active' : '';
        return (
          <div key={n} className={`zk-step ${cls}`}>
            <div className="zk-step-icon">
              {isDone ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.2)" />
                  <path d="M6 10l3 3 5-5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : isActive ? (
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" stroke="none" fill="none" />
                  <circle cx="10" cy="10" r="8" stroke="#F5A623" strokeWidth="2" fill="none" strokeDasharray="50" strokeDashoffset="25" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#64748B" strokeWidth="2" fill="rgba(100,116,139,0.2)" />
                </svg>
              )}
            </div>
            <div>
              <div className="zk-step-label">{s.label}</div>
              <div className="zk-step-desc">{s.desc}</div>
            </div>
            <div className="zk-step-status">
              {isDone ? '✓' : isActive ? '...' : ''}
            </div>
          </div>
        );
      })}

      {status === 'done' && (
        <div className="zk-complete">
          <div className="zk-check">✓</div>
          <div className="zk-complete-text">Proof generated</div>
        </div>
      )}

      {status === 'error' && (
        <div style={{ color: 'var(--red)', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Proof generation failed. Check console.
        </div>
      )}
    </div>
  );
}
