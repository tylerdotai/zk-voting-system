import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import { getContract, shortenAddress } from '../lib/ethereum';
import { STATES } from '../lib/constants';
import { CONTRACT_ADDRESS } from '../lib/constants';

export default function VerifyPage() {
  const [proposalInput, setProposalInput] = useState('');
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!proposalInput.trim()) return;
    setLoading(true);
    setError('');
    setProposal(null);

    try {
      const id = parseInt(proposalInput, 10);
      if (isNaN(id) || id < 0) throw new Error('Invalid proposal ID');

      const s = getContract();
      if (!s) throw new Error('Connect wallet to query chain');

      const raw = await s.contract.getProposal(id);
      setProposal({
        id,
        description: raw[0],
        proposer: raw[1],
        chair: raw[2],
        state: Number(raw[3]),
        yesVotes: Number(raw[9]),
        noVotes: Number(raw[10]),
        abstainVotes: Number(raw[11]),
        votingEndsAt: Number(raw[8]),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch proposal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="header">
        <div className="header-top">
          <h1>Verify Proposal</h1>
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

      <main className="main" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{
          padding: '1.25rem',
          background: 'var(--card)',
          border: '2px solid var(--fw-border)',
          borderRadius: '12px',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fw-gray)', marginBottom: '0.75rem' }}>
            Rob&apos;s Rules Voting Contract
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--fw-gray)', fontSize: '0.8rem' }}>Contract</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text)' }}>{CONTRACT_ADDRESS}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--fw-gray)', fontSize: '0.8rem' }}>Network</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Sepolia (testnet)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--fw-gray)', fontSize: '0.8rem' }}>ZK Privacy</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--fw-orange)' }}>Phase 2 Roadmap</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleLookup} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="number"
              value={proposalInput}
              onChange={(e) => setProposalInput(e.target.value)}
              placeholder="Enter proposal ID (0, 1, 2…)"
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '2px solid var(--fw-border)',
                background: 'var(--fw-light)',
                color: 'var(--text)',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
              }}
            />
            <button type="submit" className="connect-btn" disabled={loading || !proposalInput.trim()}>
              {loading ? 'Loading...' : 'Lookup'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ padding: '1rem', background: 'var(--card)', border: '2px solid var(--state-created)', borderRadius: '12px', color: 'var(--state-created)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {proposal && (
          <div style={{ padding: '1.5rem', background: 'var(--card)', border: '2px solid var(--fw-border)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--fw-gray)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Proposal #{proposal.id}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                  {proposal.description}
                </div>
              </div>
              <span className={`state-badge state-${proposal.state}`} style={{ fontSize: '0.7rem' }}>
                {STATES[proposal.state]}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--fw-light)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--state-voting)' }}>{proposal.yesVotes}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--fw-gray)', textTransform: 'uppercase' }}>Yes</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--fw-light)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--state-created)' }}>{proposal.noVotes}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--fw-gray)', textTransform: 'uppercase' }}>No</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--fw-light)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--fw-gray)' }}>{proposal.abstainVotes}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--fw-gray)', textTransform: 'uppercase' }}>Abstain</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--fw-gray)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>Proposer: <span style={{ fontFamily: 'monospace' }}>{shortenAddress(proposal.proposer)}</span></div>
              <div>Chair: <span style={{ fontFamily: 'monospace' }}>{shortenAddress(proposal.chair)}</span></div>
              {proposal.votingEndsAt > 0 && (
                <div>Voting ends: <span style={{ fontFamily: 'monospace' }}>{new Date(Number(proposal.votingEndsAt) * 1000).toLocaleString()}</span></div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}