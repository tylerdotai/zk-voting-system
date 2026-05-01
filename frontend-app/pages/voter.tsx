import React, { useState, useEffect, useCallback } from 'react';
import WalletConnect from '../components/WalletConnect';
import ProposalCard from '../components/ProposalCard';
import { getContract, ContractState, ProposalData } from '../lib/ethereum';
import { STATES } from '../lib/constants';

export default function VoterPage() {
  const [state, setState] = useState<ContractState | null>(null);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [selected, setSelected] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [voteChoice, setVoteChoice] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [txBanner, setTxBanner] = useState<{ hash?: string } | null>(null);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

  const loadProposals = useCallback(async () => {
    const s = getContract();
    if (!s) return;
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
        } catch { /* skip failed proposals */ }
      }
      setProposals(items);
      if (items.length > 0 && !selected) setSelected(items[items.length - 1]);
    } catch (e) {
      console.error('Failed to load proposals', e);
    }
  }, [selected]);

  useEffect(() => {
    const s = getContract();
    if (s) {
      setState(s);
      loadProposals();
    }
  }, [loadProposals]);

  function handleConnected() {
    setState(getContract());
    loadProposals();
  }

  useEffect(() => {
    if (!state) return;
    const checkVoted = async () => {
      const newVoted = new Set<number>();
      for (const p of proposals) {
        try {
          const voted = await state.contract.hasVoted(p.id, state.address);
          if (voted) newVoted.add(p.id);
        } catch { /* */ }
      }
      setVotedIds(newVoted);
    };
    checkVoted();
  }, [state, proposals]);

  async function secondProposal(id: number) {
    if (!state) return;
    setLoading(true);
    try {
      const tx = await state.contract.secondProposal(id);
      showTxBanner(tx.hash);
      await tx.wait();
      await loadProposals();
    } catch (e: any) {
      showToast(e.reason || e.message || 'Failed to second');
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(choice: number) {
    if (!state || !selected) return;
    setVoteChoice(choice);
  }

  async function submitVote() {
    if (!state || !selected || voteChoice === null) return;
    setLoading(true);
    try {
      const tx = await state.contract.castVote(selected.id, voteChoice);
      showTxBanner(tx.hash);
      await tx.wait();
      setVoteChoice(null);
      showToast('Vote cast successfully');
      await loadProposals();
    } catch (e: any) {
      showToast(e.reason || e.message || 'Vote failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAmendment(proposalId: number) {
    const s = state;
    if (!s || !s.contract) return;
    const inp = document.getElementById(`amendment-${proposalId}`) as HTMLInputElement;
    if (!inp?.value.trim()) { showToast('Enter an amendment first.'); return; }
    setLoading(true);
    try {
      const tx = await s.contract.submitAmendment(proposalId, inp.value.trim());
      showTxBanner(tx.hash);
      await tx.wait();
      inp.value = '';
      await loadProposals();
      showToast('Amendment submitted.');
    } catch (e: any) {
      showToast(e.reason || 'Failed to submit amendment');
    } finally {
      setLoading(false);
    }
  }

  async function handleReconsider(proposalId: number) {
    const s = state;
    if (!s || !s.contract) return;
    setLoading(true);
    try {
      const tx = await s.contract.reconsider(proposalId);
      showTxBanner(tx.hash);
      await tx.wait();
      await loadProposals();
      showToast('Reconsideration requested.');
    } catch (e: any) {
      showToast(e.reason || 'Reconsideration failed');
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  function showTxBanner(hash: string) {
    setTxBanner({ hash });
    setTimeout(() => setTxBanner(null), 12000);
  }

  const STATES_ORDER = ['Created', 'Seconded', 'Voting', 'Passed', 'Failed'];
  const sp = selected;

  return (
    <div>
      <header className="header">
        <div className="header-top">
          <h1>Rob&apos;s Rules Voting</h1>
          <nav className="header-nav">
            <a href="/">Home</a>
            <a href="/voter">Voter Portal</a>
            <a href="/chair">Chair Dashboard</a>
            <a href="/verify">Verify</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="network">Sepolia</span>
            <WalletConnect onConnected={handleConnected} />
          </div>
        </div>
      </header>

      <div id="txBanner" className={txBanner ? 'show' : ''}>
        <div className="tx-label">Transaction Submitted</div>
        {txBanner?.hash && (
          <>
            <div className="tx-hash">{txBanner.hash.slice(0, 10)}...{txBanner.hash.slice(-8)}</div>
            <a className="tx-link" href={`https://sepolia.etherscan.io/tx/${txBanner.hash}`} target="_blank" rel="noopener noreferrer">
              View on Etherscan ↗
            </a>
          </>
        )}
      </div>

      <main className="main">
        {state && !state.isEligible && (
          <div className="empty-state" style={{ marginBottom: '1.5rem' }}>
            <h3>You are not on the voter list</h3>
            <p>Contact the chair to be added as an eligible voter.</p>
          </div>
        )}

        {state && state.isEligible && sp && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--fw-gray)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Rob&apos;s Rules Flow
              </span>
              <span className={`state-badge state-${sp.state}`}>{STATES[sp.state]}</span>
            </div>
            <div className="progress-bar">
              {STATES_ORDER.map((s, i) => {
                const active = sp && sp.state === i;
                const done = sp && sp.state > i;
                return (
                  <div key={s} className={`progress-step${done ? ' done' : active ? ' active' : ''}`}>
                    {s}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="proposals-title" style={{ marginBottom: '0.75rem' }}>Proposals</p>

        {proposals.length === 0 && (
          <div className="empty-state">
            <h3>No proposals yet</h3>
            <p>The chair will create proposals when ready.</p>
          </div>
        )}

        {proposals.map((p) => (
          <ProposalCard
            key={p.id}
            proposal={p}
            selected={sp?.id === p.id}
            onClick={() => setSelected(p)}
          />
        ))}

        {sp && state && state.isEligible && sp.state === 0 && !votedIds.has(sp.id) && (
          <div style={{ marginTop: '1rem' }}>
            <button
              className="action-btn secondary"
              onClick={() => secondProposal(sp.id)}
              disabled={loading}
              style={{ width: '100%' }}
            >
              Second Proposal #{sp.id}
            </button>
          </div>
        )}

        {sp && state && state.isEligible && sp.state >= 1 && sp.state < 3 && (
          <div style={{ marginTop: '1rem', marginBottom: '1rem', padding: '1rem', background: 'var(--fw-light)', borderRadius: '12px', border: '2px solid var(--fw-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fw-gray)', marginBottom: '0.75rem' }}>
              Submit Amendment
            </div>
            <div className="amendment-input-row">
              <input id={`amendment-${sp.id}`} type="text" placeholder="Describe your amendment…" />
              <button className="action-btn secondary" onClick={() => handleSubmitAmendment(sp.id)} disabled={loading}>Submit</button>
            </div>
          </div>
        )}

        {sp && state && state.isEligible && sp.state === 2 && !votedIds.has(sp.id) && (
          <div className="vote-section">
            <h3>Cast Your Vote — #{sp.id}</h3>
            <div className="vote-display">
              <div className="vote-cell yes"><div className="count">{Number(sp.yesVotes)}</div><div className="label">Yes</div></div>
              <div className="vote-cell no"><div className="count">{Number(sp.noVotes)}</div><div className="label">No</div></div>
              <div className="vote-cell abstain"><div className="count">{Number(sp.abstainVotes)}</div><div className="label">Abstain</div></div>
            </div>
            {voteChoice === null ? (
              <div className="vote-buttons">
                <button className="vote-btn yes" onClick={() => handleVote(0)} disabled={loading}>Vote Yes</button>
                <button className="vote-btn no" onClick={() => handleVote(1)} disabled={loading}>Vote No</button>
                <button className="vote-btn abstain" onClick={() => handleVote(2)} disabled={loading}>Abstain</button>
              </div>
            ) : (
              <>
                <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--fw-blue-accent)', marginBottom: '1rem' }}>
                  Selected: {['Yes', 'No', 'Abstain'][voteChoice]}
                </p>
                <button className="action-btn success" onClick={submitVote} disabled={loading} style={{ width: '100%' }}>
                  {loading ? <><span className="spinner" />Submitting...</> : 'Submit Vote On-Chain'}
                </button>
                <button className="close-btn" onClick={() => setVoteChoice(null)} style={{ display: 'block', width: '100%', marginTop: '0.75rem' }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        )}

        {sp && state && state.isEligible && votedIds.has(sp.id) && sp.state === 2 && (
          <div className="vote-section">
            <h3>Your Vote — #{sp.id}</h3>
            <div className="vote-display">
              <div className="vote-cell yes"><div className="count">{Number(sp.yesVotes)}</div><div className="label">Yes</div></div>
              <div className="vote-cell no"><div className="count">{Number(sp.noVotes)}</div><div className="label">No</div></div>
              <div className="vote-cell abstain"><div className="count">{Number(sp.abstainVotes)}</div><div className="label">Abstain</div></div>
            </div>
            <p className="vote-status">You have already voted on this proposal.</p>
            {sp.reconsiderationRequested && (
              <button className="action-btn secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleReconsider(sp.id)} disabled={loading}>
                Request Reconsideration
              </button>
            )}
          </div>
        )}

        {sp && (sp.state === 3 || sp.state === 4) && (
          <div className="vote-section">
            <h3>Results — #{sp.id}</h3>
            <div className="vote-display">
              <div className="vote-cell yes"><div className="count">{Number(sp.yesVotes)}</div><div className="label">Yes</div></div>
              <div className="vote-cell no"><div className="count">{Number(sp.noVotes)}</div><div className="label">No</div></div>
              <div className="vote-cell abstain"><div className="count">{Number(sp.abstainVotes)}</div><div className="label">Abstain</div></div>
            </div>
            <p className="vote-status">Proposal {sp.state === 3 ? 'Passed' : 'Failed'}</p>
          </div>
        )}

        {state && (
          <div className="verifier-bar">
            <div className="verifier-item">
              <span className="verifier-label">Network</span>
              <span className="verifier-value">Sepolia</span>
            </div>
            <div className="verifier-item">
              <span className="verifier-label">Voting Contract</span>
              <span className="verifier-value" style={{ fontSize: '0.65rem' }}>0x0e51...0E70c</span>
            </div>
            <div className="verifier-item">
              <span className="verifier-label">Your Status</span>
              <span className="verifier-value" style={{ color: state.isEligible ? 'var(--state-voting)' : 'var(--state-created)' }}>
                {state.isEligible ? 'Eligible' : 'Not Eligible'}
              </span>
            </div>
          </div>
        )}
      </main>

      <div className={`toast${toast ? ' show' : ''}${toast.includes('failed') ? ' error' : ''}`}>
        {toast}
      </div>
    </div>
  );
}