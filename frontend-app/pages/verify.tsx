import React, { useState } from 'react';
import { ethers } from 'ethers';
import WalletConnect from '../components/WalletConnect';
import { getContract, shortenAddress } from '../lib/ethereum';
import { STATES, CONTRACT_ADDRESS, ROB_RULES_ABI } from '../lib/constants';

const READONLY_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

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

      let contract = getContract()?.contract;
      if (!contract) {
        const provider = new ethers.JsonRpcProvider(READONLY_RPC);
        contract = new ethers.Contract(CONTRACT_ADDRESS, ROB_RULES_ABI, provider);
      }

      const raw = await contract.getProposal(id);
      setProposal({
        id,
        description: raw[0],
        proposer: raw[1],
        chair: raw[2],
        state: Number(raw[3]),
        createdAt: Number(raw[4]),
        secondedAt: Number(raw[5]),
        secondedBy: raw[6],
        votingStartsAt: Number(raw[7]),
        votingEndsAt: Number(raw[8]),
        yesVotes: Number(raw[9]),
        noVotes: Number(raw[10]),
        abstainVotes: Number(raw[11]),
        amendmentCount: Number(raw[12]),
        divisionCalled: raw[13],
        divisionCallCount: Number(raw[14]),
        reconsiderationRequested: raw[15],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch proposal');
    } finally {
      setLoading(false);
    }
  }

  const fmt = (ts: number) => (ts ? new Date(ts * 1000).toLocaleString() : '—');

  return (
    <div>
      <header className="header">
        <div className="header-top">
          <h1>Verify Proposal</h1>
          <nav className="header-nav">
            <a href="/">Home</a>
            <a href="/voter">Voter Portal</a>
            <a href="/chair">Chair Dashboard</a>
            <a href="/verify" className="active">Verify</a>
            <a href="/whitepaper.pdf" target="_blank" rel="noreferrer">Whitepaper</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="network">Sepolia</span>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="main" style={{ maxWidth: '860px', margin: '0 auto' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ color: 'var(--fw-gray)', fontSize: '0.8rem' }}>Contract</span>
              <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text)' }}>{CONTRACT_ADDRESS}</a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--fw-gray)', fontSize: '0.8rem' }}>Network</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Sepolia (testnet)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--fw-gray)', fontSize: '0.8rem' }}>Lookup mode</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--fw-dark)' }}>Read-only RPC (wallet optional)</span>
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

            <div className="verify-extra-grid">
              <div className="item"><div className="k">Proposer</div><div className="v">{shortenAddress(proposal.proposer)}</div></div>
              <div className="item"><div className="k">Chair</div><div className="v">{shortenAddress(proposal.chair)}</div></div>
              <div className="item"><div className="k">Created At</div><div className="v">{fmt(proposal.createdAt)}</div></div>
              <div className="item"><div className="k">Seconded At</div><div className="v">{fmt(proposal.secondedAt)}</div></div>
              <div className="item"><div className="k">Seconded By</div><div className="v">{proposal.secondedBy && proposal.secondedBy !== '0x0000000000000000000000000000000000000000' ? shortenAddress(proposal.secondedBy) : '—'}</div></div>
              <div className="item"><div className="k">Voting Starts</div><div className="v">{fmt(proposal.votingStartsAt)}</div></div>
              <div className="item"><div className="k">Voting Ends</div><div className="v">{fmt(proposal.votingEndsAt)}</div></div>
              <div className="item"><div className="k">Amendments</div><div className="v">{proposal.amendmentCount}</div></div>
              <div className="item"><div className="k">Division Calls</div><div className="v">{proposal.divisionCallCount}{proposal.divisionCalled ? ' (active)' : ''}</div></div>
              <div className="item"><div className="k">Reconsideration</div><div className="v">{proposal.reconsiderationRequested ? 'Requested' : 'No'}</div></div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.78rem' }}>
              <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}#readContract`} target="_blank" rel="noreferrer" className="tx-link">Inspect readContract on Etherscan ↗</a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
