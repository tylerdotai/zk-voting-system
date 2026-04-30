import React, { useState, useEffect, useCallback } from 'react';
import WalletConnect from '../components/WalletConnect';
import ChairDashboard from '../components/ChairDashboard';
import { getContract, ContractState, ProposalData } from '../lib/ethereum';
import { STATES } from '../lib/constants';

export default function ChairPage() {
  const [state, setState] = useState<ContractState | null>(null);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [selected, setSelected] = useState<ProposalData | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [toast, setToast] = useState('');

  const loadProposals = useCallback(async (s: ContractState) => {
    try {
      const count = Number(await s.contract.proposalCount());
      const items: ProposalData[] = [];
      for (let i = 0; i < count; i++) {
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
        } catch {
          // skip individual proposal load errors
        }
      }
      setProposals(items);
    } catch (e) {
      console.error('Error loading proposals:', e);
    }
  }, []);

  useEffect(() => {
    const s = getContract();
    if (!s) return;
    setState(s);
    loadProposals(s);
    const iv = setInterval(() => loadProposals(s), 8000);
    return () => clearInterval(iv);
  }, [loadProposals]);

  function handleConnected() {
    if (state) loadProposals(state);
  }

  function handleWalletUpdate(addr: string) {
    setState((prev) => (prev ? { ...prev, address: addr } : prev));
  }

  function showToastMsg(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  async function handleCreate(description: string) {
    const s = state;
    if (!s || !s.contract) return;
    try {
      const tx = await s.contract.createProposal(description);
      setTxHash(tx.hash);
      setShowBanner(true);
      await tx.wait();
      setShowBanner(false);
      await loadProposals(s);
      showToastMsg('Proposal created.');
    } catch (e: any) {
      showToastMsg(e.reason || 'Transaction failed');
    }
  }

  async function handleAddVoter(address: string) {
    const s = state;
    if (!s || !s.contract) return;
    try {
      const tx = await s.contract.addVoter(address);
      await tx.wait();
      showToastMsg('Voter added.');
    } catch (e: any) {
      showToastMsg(e.reason || 'Transaction failed');
    }
  }

  async function handleRemoveVoter(address: string) {
    const s = state;
    if (!s || !s.contract) return;
    try {
      const tx = await s.contract.removeVoter(address);
      await tx.wait();
      showToastMsg('Voter removed.');
    } catch (e: any) {
      showToastMsg(e.reason || 'Transaction failed');
    }
  }

  const shortAddr = state?.address ? `${state.address.slice(0, 6)}…${state.address.slice(-4)}` : '';

  return (
    <div>
      <header className="header">
        <div className="header-top">
          <h1>Rob&apos;s Rules Voting</h1>
          <nav className="header-nav">
            <a href="/">Voter Portal</a>
            <a href="/chair">Chair Dashboard</a>
            <a href="/verify">Verify</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="network">Sepolia</span>
            <WalletConnect onConnected={handleConnected} />
          </div>
        </div>
      </header>

      {/* TX Banner */}
      <div id="txBanner" className={showBanner ? 'show' : ''}>
        <div className="tx-label">Transaction Submitted</div>
        {txHash && (
          <div className="tx-hash">
            <a
              className="tx-link"
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              View on Etherscan →
            </a>
          </div>
        )}
      </div>

      <div className="main-wide">
        {/* Left column: proposal list */}
        <div>
          <div className="section-header">Proposals</div>

          {/* Create proposal */}
          <form
            className="create-form"
            onSubmit={(e) => {
              e.preventDefault();
              const inp = e.currentTarget.elements.namedItem('desc') as HTMLInputElement;
              if (inp.value.trim()) {
                handleCreate(inp.value.trim());
                inp.value = '';
              }
            }}
          >
            <input name="desc" placeholder="Enter proposal description…" required />
            <button type="submit" disabled={!state?.address}>
              Create
            </button>
          </form>

          {proposals.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelected(p.id === selected?.id ? null : p)}
            >
              <ProposalCardMini proposal={p} selected={selected?.id === p.id} />
            </div>
          ))}

          {proposals.length === 0 && (
            <div className="empty-state">
              <h3>No proposals yet</h3>
              <p>Create one above.</p>
            </div>
          )}

          {/* Voter management */}
          <div className="voter-manage-section">
            <h3>Manage Voters</h3>
            <form
              className="voter-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                const inp = e.currentTarget.elements.namedItem('addr') as HTMLInputElement;
                if (inp.value.trim()) {
                  handleAddVoter(inp.value.trim());
                  inp.value = '';
                }
              }}
            >
              <input name="addr" placeholder="Ethereum address…" required />
              <button type="submit" className="add">+ Add</button>
            </form>
          </div>
        </div>

        {/* Right column: detail panel */}
        <div>
          <ChairDashboard
            proposals={proposals}
            selectedProposal={selected}
            onProposalCreated={() => { if (state) loadProposals(state); }}
          />
        </div>
      </div>

      {/* Toast */}
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>

      <footer className="verifier-bar">
        <div className="verifier-item">
          <span className="verifier-label">Network</span>
          <span className="verifier-value">Sepolia</span>
        </div>
        <div className="verifier-item">
          <span className="verifier-label">Governance</span>
          <span className="verifier-value">Rob&apos;s Rules</span>
        </div>
      </footer>
    </div>
  );
}

interface ProposalCardMiniProps {
  proposal: ProposalData;
  selected: boolean;
}

function ProposalCardMini({ proposal, selected }: ProposalCardMiniProps) {
  return (
    <div className={`proposal-card ${selected ? 'selected' : ''} state-${proposal.state}`}>
      <div className="proposal-header">
        <span className="proposal-id">#{proposal.id}</span>
        <span className={`state-badge state-${proposal.state}`}>
          {STATES[proposal.state]}
        </span>
      </div>
      <div className="proposal-desc">{proposal.description}</div>
      <div className="proposal-footer">
        <div className="proposal-votes">
          <span>✓ {Number(proposal.yesVotes)}</span>
          <span>✗ {Number(proposal.noVotes)}</span>
          <span>─ {Number(proposal.abstainVotes)}</span>
        </div>
        {proposal.amendmentCount > 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--fw-gray)' }}>
            {Number(proposal.amendmentCount)} amendment{proposal.amendmentCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
