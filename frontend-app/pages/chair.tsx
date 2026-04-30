import React, { useState, useEffect, useCallback } from 'react';
import WalletConnect from '../components/WalletConnect';
import ProposalCard from '../components/ProposalCard';
import ChairDashboard from '../components/ChairDashboard';
import { getContract, ContractState, ProposalData } from '../lib/ethereum';

export default function ChairPage() {
  const [state, setState] = useState<ContractState | null>(null);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [selected, setSelected] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [txBanner, setTxBanner] = useState<{ hash?: string } | null>(null);

  const loadProposals = useCallback(async () => {
    const s = getContract();
    if (!s) return;
    try {
      const count = await s.contract.proposalCount();
      const items: ProposalData[] = [];
      for (let i = 1; i <= Number(count); i++) {
        try {
          const raw = await s.contract.getProposal(i);
          items.push({
            id: i,
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
        } catch { /* skip */ }
      }
      setProposals(items);
    } catch (e) {
      console.error('Failed to load proposals', e);
    }
  }, []);

  useEffect(() => {
    const s = getContract();
    if (s) {
      setState(s);
      loadProposals();
    }
  }, [loadProposals]);

  function handleConnected() {
    const s = getContract();
    setState(s);
    loadProposals();
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  function showTxBanner(hash: string) {
    setTxBanner({ hash });
    setTimeout(() => setTxBanner(null), 12000);
  }

  // If wallet not connected or not chair, show access denied
  if (!state) {
    return (
      <div>
        <header className="header">
          <div className="header-top">
            <h1>Rob&apos;s Rules Voting — Chair Dashboard</h1>
            <nav className="header-nav">
              <a href="/">Voter Portal</a>
              <a href="/verify">Verify</a>
            </nav>
            <WalletConnect onConnected={handleConnected} />
          </div>
        </header>
        <main className="main">
          <div className="empty-state">
            <h3>Connect your wallet</h3>
            <p>Connect a wallet to access the Chair Dashboard.</p>
          </div>
        </main>
      </div>
    );
  }

  if (!state.isChair) {
    return (
      <div>
        <header className="header">
          <div className="header-top">
            <h1>Rob&apos;s Rules Voting — Chair Dashboard</h1>
            <nav className="header-nav">
              <a href="/">Voter Portal</a>
              <a href="/verify">Verify</a>
            </nav>
            <WalletConnect onConnected={handleConnected} />
          </div>
        </header>
        <main className="main">
          <div className="empty-state">
            <h3>Access Denied</h3>
            <p>Only the chair address can access this dashboard.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-top">
          <h1>Chair Dashboard</h1>
          <nav className="header-nav">
            <a href="/">Voter Portal</a>
            <a href="/verify">Verify</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="network">Sepolia</span>
            <WalletConnect onConnected={handleConnected} />
          </div>
        </div>
      </header>

      {/* TX Banner */}
      <div id="txBanner" className={txBanner ? 'show' : ''}>
        <div className="tx-label">Transaction Submitted</div>
        {txBanner?.hash && (
          <>
            <div className="tx-hash">{txBanner.hash.slice(0, 10)}...{txBanner.hash.slice(-8)}</div>
            <a
              className="tx-link"
              href={`https://sepolia.etherscan.io/tx/${txBanner.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Etherscan ↗
            </a>
          </>
        )}
      </div>

      <main className="main-wide">
        {/* Left column */}
        <div>
          {/* Create Proposal */}
          <div className="create-form">
            <input
              type="text"
              placeholder="New proposal description..."
              value=""
              onChange={() => {}}
            />
          </div>

          {/* Create form with controlled input */}
          <CreateProposalForm onCreated={loadProposals} />

          {/* Proposals list */}
          <div className="proposals-section">
            <p className="proposals-title">All Proposals</p>
            {proposals.length === 0 && (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No proposals yet. Create one above.</p>
              </div>
            )}
            {proposals.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                selected={selected?.id === p.id}
                onClick={() => setSelected(p)}
                showVotes={true}
              />
            ))}
          </div>

          {/* Voter Management */}
          <VoterManagement />
        </div>

        {/* Right column: detail panel */}
        <div>
          <ChairDashboard
            proposals={proposals}
            selectedProposal={selected}
            onProposalCreated={loadProposals}
          />
        </div>
      </main>

      {/* Toast */}
      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}

// Separate component for create proposal form (needs local state)
function CreateProposalForm({ onCreated }: { onCreated: () => void }) {
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const contract = getContract()?.contract;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!desc.trim() || !contract) return;
    setLoading(true);
    try {
      const tx = await (contract as any).createProposal(desc.trim());
      await tx.wait();
      setDesc('');
      onCreated();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="create-form" onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
      <input
        type="text"
        placeholder="New proposal description..."
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-btn)', padding: '0.75rem 1rem', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.9rem', color: 'var(--text)', outline: 'none' }}
      />
      <button type="submit" disabled={loading || !desc.trim()}>
        {loading ? 'Creating...' : 'Create Proposal'}
      </button>
    </form>
  );
}

function VoterManagement() {
  const [addr, setAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const contract = getContract()?.contract;

  async function addVoter() {
    if (!addr.trim() || !contract) return;
    setLoading(true);
    try {
      const tx = await (contract as any).addVoter(addr.trim());
      await tx.wait();
      setAddr('');
      setMsg('Voter added');
    } catch (e: any) {
      setMsg(e.reason || 'Failed');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 3000);
    }
  }

  async function removeVoter() {
    if (!addr.trim() || !contract) return;
    setLoading(true);
    try {
      const tx = await (contract as any).removeVoter(addr.trim());
      await tx.wait();
      setAddr('');
      setMsg('Voter removed');
    } catch (e: any) {
      setMsg(e.reason || 'Failed');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 3000);
    }
  }

  return (
    <div className="voter-manage-section">
      <h3>Voter Management</h3>
      <div className="voter-input-row">
        <input
          type="text"
          placeholder="0x... Ethereum address"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
        />
        <button className="add" onClick={addVoter} disabled={loading || !addr.trim()}>Add</button>
        <button className="remove" onClick={removeVoter} disabled={loading || !addr.trim()}>Remove</button>
      </div>
      {msg && (
        <p style={{ fontSize: '0.8rem', color: msg.includes('Failed') ? 'var(--red)' : 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>
          {msg}
        </p>
      )}
    </div>
  );
}
