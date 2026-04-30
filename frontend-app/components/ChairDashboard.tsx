import React, { useState } from 'react';
import { ProposalData, getContract } from '../lib/ethereum';

interface ChairDashboardProps {
  proposals: ProposalData[];
  selectedProposal: ProposalData | null;
  onProposalCreated?: () => void;
}

interface Amendment {
  id: number;
  description: string;
  proposer: string;
  approved: boolean;
}

export default function ChairDashboard({ selectedProposal, onProposalCreated }: ChairDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voterAddr, setVoterAddr] = useState('');
  const [amendmentDesc, setAmendmentDesc] = useState('');
  // Amendment panel state
  const [showAmendments, setShowAmendments] = useState(false);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [amendmentsLoading, setAmendmentsLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState<{ [id: number]: boolean }>({});
  const [reopenLoading, setReopenLoading] = useState(false);

  const state = getContract();
  const contract = state?.contract;

  async function openVoting() {
    if (!selectedProposal || !contract) return;
    setLoading(true);
    setError('');
    try {
      const DURATION = 7 * 24 * 3600; // 7 days
      const tx = await contract.openVoting(selectedProposal.id, DURATION);
      await tx.wait();
      onProposalCreated?.();
    } catch (e: any) {
      setError(e.reason || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function finalize() {
    if (!selectedProposal || !contract) return;
    setLoading(true);
    setError('');
    try {
      const tx = await contract.finalizeProposal(selectedProposal.id);
      await tx.wait();
      onProposalCreated?.();
    } catch (e: any) {
      setError(e.reason || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function callDivision() {
    if (!selectedProposal || !contract) return;
    setLoading(true);
    setError('');
    try {
      const tx = await contract.callForDivision(selectedProposal.id);
      await tx.wait();
      onProposalCreated?.();
    } catch (e: any) {
      setError(e.reason || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function reopenVoting() {
    if (!selectedProposal || !contract) return;
    setReopenLoading(true);
    setError('');
    try {
      const tx = await contract.reopenVoting(selectedProposal.id);
      await tx.wait();
      onProposalCreated?.();
    } catch (e: any) {
      setError(e.reason || e.message);
    } finally {
      setReopenLoading(false);
    }
  }

  async function addVoter() {
    if (!voterAddr.trim() || !contract) return;
    setLoading(true);
    setError('');
    try {
      const tx = await contract.addVoter(voterAddr.trim());
      await tx.wait();
      setVoterAddr('');
    } catch (e: any) {
      setError(e.reason || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeVoter() {
    if (!voterAddr.trim() || !contract) return;
    setLoading(true);
    setError('');
    try {
      const tx = await contract.removeVoter(voterAddr.trim());
      await tx.wait();
      setVoterAddr('');
    } catch (e: any) {
      setError(e.reason || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitAmendment() {
    if (!selectedProposal || !amendmentDesc.trim() || !contract) return;
    setLoading(true);
    setError('');
    try {
      const tx = await contract.submitAmendment(selectedProposal.id, amendmentDesc.trim());
      await tx.wait();
      setAmendmentDesc('');
      onProposalCreated?.();
    } catch (e: any) {
      setError(e.reason || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadAmendments() {
    if (!selectedProposal || !contract) return;
    setAmendmentsLoading(true);
    try {
      const count = Number(selectedProposal.amendmentCount);
      const results: Amendment[] = [];
      for (let i = 0; i < count; i++) {
        const a = await (contract as any).getAmendment(selectedProposal.id, i);
        results.push({
          id: i,
          description: a[0],
          proposer: a[1],
          approved: a[2],
        });
      }
      setAmendments(results);
      setShowAmendments(true);
    } catch (e) {
      console.error('Error loading amendments:', e);
    } finally {
      setAmendmentsLoading(false);
    }
  }

  async function approveAmendment(amendmentId: number) {
    if (!selectedProposal || !contract) return;
    setApproveLoading((prev) => ({ ...prev, [amendmentId]: true }));
    try {
      const tx = await (contract as any).approveAmendment(selectedProposal.id, amendmentId);
      await tx.wait();
      // Refresh amendments
      await loadAmendments();
      onProposalCreated?.();
    } catch (e: any) {
      setError(e.reason || e.message);
    } finally {
      setApproveLoading((prev) => ({ ...prev, [amendmentId]: false }));
    }
  }

  if (!selectedProposal) {
    return (
      <div className="detail-panel">
        <p style={{ color: 'var(--fw-gray)', fontSize: '0.9rem' }}>
          Select a proposal to manage it.
        </p>
      </div>
    );
  }

  const sp = selectedProposal;

  return (
    <div className="detail-panel">
      <h3>#{sp.id}: {sp.description}</h3>
      <p className="detail-meta">
        {sp.state === 0 && 'Created — awaiting second'}
        {sp.state === 1 && 'Seconded — awaiting chair to open voting'}
        {sp.state === 2 && 'Voting open'}
        {sp.state === 3 && 'Passed'}
        {sp.state === 4 && 'Failed'}
        {' · '}
        ✓ {Number(sp.yesVotes)} / ✗ {Number(sp.noVotes)} / ─ {Number(sp.abstainVotes)}
      </p>

      {error && (
        <div style={{ color: 'var(--state-failed)', fontSize: '0.8rem', marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
          {error}
        </div>
      )}

      <div className="chair-actions">
        <h4>Chair Actions</h4>

        {sp.state === 1 && (
          <button className={`action-btn primary ${loading ? 'loading' : ''}`} onClick={openVoting} disabled={loading}>
            {loading && <span className="spinner" />}
            Open Voting
          </button>
        )}

        {sp.state === 2 && (
          <>
            <button className={`action-btn primary ${loading ? 'loading' : ''}`} onClick={finalize} disabled={loading}>
              {loading && <span className="spinner" />}
              Finalize Proposal
            </button>
            <button className={`action-btn secondary ${loading ? 'loading' : ''}`} onClick={callDivision} disabled={loading}>
              {loading && <span className="spinner" />}
              Call for Division
            </button>
          </>
        )}

        {(sp.state === 3 || sp.state === 4) && (
          <button className={`action-btn secondary ${reopenLoading ? 'loading' : ''}`} onClick={reopenVoting} disabled={reopenLoading}>
            {reopenLoading && <span className="spinner" />}
            Reopen Voting
          </button>
        )}
      </div>

      {/* Amendments section */}
      {Number(sp.amendmentCount) > 0 && (
        <div className="amendments-section">
          <h4>
            Amendments ({sp.amendmentCount})
            {amendments.filter((a) => !a.approved).length > 0 && (
              <span style={{ color: 'var(--fw-orange)', marginLeft: '0.5rem' }}>
                ({amendments.filter((a) => !a.approved).length} pending)
              </span>
            )}
          </h4>
          {!showAmendments ? (
            <button
              className="action-btn secondary"
              onClick={loadAmendments}
              disabled={amendmentsLoading}
            >
              {amendmentsLoading ? 'Loading…' : `View ${sp.amendmentCount} Amendment${Number(sp.amendmentCount) > 1 ? 's' : ''}`}
            </button>
          ) : (
            amendments.map((a) => {
              const loading = approveLoading?.[a.id];
              return (
                <div key={a.id} className="amendment-item">
                  <span className="desc">
                    {a.approved ? (
                      <span style={{ color: 'var(--state-passed)' }}>✓ </span>
                    ) : (
                      <span style={{ color: 'var(--fw-orange)' }}>● </span>
                    )}
                    {a.description}
                  </span>
                  {!a.approved && (
                    <button
                      className="amendment-approve-btn"
                      onClick={() => approveAmendment(a.id)}
                      disabled={loading}
                    >
                      {loading ? '…' : 'Approve'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Submit amendment (chair can also submit) */}
      <div className="amendments-section">
        <h4>Submit Amendment</h4>
        <div className="amendment-input-row">
          <input
            type="text"
            placeholder="Describe an amendment…"
            value={amendmentDesc}
            onChange={(e) => setAmendmentDesc(e.target.value)}
          />
          <button
            onClick={submitAmendment}
            disabled={loading || !amendmentDesc.trim()}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Voter Management */}
      <div className="chair-actions" style={{ marginTop: '1rem' }}>
        <h4>Voter Management</h4>
        <div className="voter-input-row">
          <input
            type="text"
            placeholder="0x… address"
            value={voterAddr}
            onChange={(e) => setVoterAddr(e.target.value)}
          />
          <button className="add" onClick={addVoter} disabled={loading || !voterAddr.trim()}>
            + Add
          </button>
          <button className="remove" onClick={removeVoter} disabled={loading || !voterAddr.trim()}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
