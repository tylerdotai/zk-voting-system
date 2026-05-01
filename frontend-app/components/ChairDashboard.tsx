import React, { useState } from 'react';
import { ProposalData, getContract, shortenAddress } from '../lib/ethereum';
import { STATES } from '../lib/constants';

interface Props {
  selectedProposal: ProposalData | null;
  onRefresh: () => void;
}

const DURATION_OPTIONS = [
  { label: '5 minutes', value: 5 * 60 },
  { label: '15 minutes', value: 15 * 60 },
  { label: '1 hour', value: 3600 },
  { label: '24 hours', value: 24 * 3600 },
  { label: '7 days', value: 7 * 24 * 3600 },
];

function fmtTime(ts: number) {
  if (!ts) return '—';
  return new Date(Number(ts) * 1000).toLocaleString();
}

export default function ChairDashboard({ selectedProposal, onRefresh }: Props) {
  const [loading, setLoading] = useState('');
  const [duration, setDuration] = useState(15 * 60);
  const [reopenLoading, setReopenLoading] = useState(false);

  async function openVoting() {
    const contract = getContract()?.contract;
    if (!contract || !selectedProposal) return;
    setLoading('openVoting');
    try {
      const tx = await contract.openVoting(selectedProposal.id, duration);
      await tx.wait();
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to open voting');
    } finally {
      setLoading('');
    }
  }

  async function fastTrack() {
    const contract = getContract()?.contract;
    if (!contract || !selectedProposal) return;
    setLoading('fastTrack');
    try {
      const tx = await contract.fastTrackVoting(selectedProposal.id, duration);
      await tx.wait();
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to fast track');
    } finally {
      setLoading('');
    }
  }

  async function finalize() {
    const contract = getContract()?.contract;
    if (!contract || !selectedProposal) return;
    setLoading('finalize');
    try {
      const tx = await contract.finalizeProposal(selectedProposal.id);
      await tx.wait();
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to finalize');
    } finally {
      setLoading('');
    }
  }

  async function reopenVoting() {
    const contract = getContract()?.contract;
    if (!contract || !selectedProposal) return;
    setReopenLoading(true);
    try {
      const tx = await contract.reopenVoting(selectedProposal.id);
      await tx.wait();
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to reopen');
    } finally {
      setReopenLoading(false);
    }
  }

  if (!selectedProposal) {
    return (
      <div className="detail-panel">
        <h3>Proposal Details</h3>
        <p className="detail-meta">Select a proposal from the list to review status, vote totals, and available chair actions.</p>
      </div>
    );
  }

  const sp = selectedProposal;

  return (
    <div className="detail-panel">
      <h3>Proposal #{sp.id}</h3>
      <p className="detail-meta">Current state: {STATES[sp.state]}</p>

      <div className="chair-proposal-info">
        <div className="title">{sp.description}</div>
        <span className={`state-badge state-${sp.state}`}>{STATES[sp.state]}</span>
      </div>

      <div className="vote-tally" style={{ marginBottom: '1rem' }}>
        <span className="yes-count">Yes: {Number(sp.yesVotes)}</span>
        <span className="no-count">No: {Number(sp.noVotes)}</span>
        <span className="abstain-count">Abstain: {Number(sp.abstainVotes)}</span>
      </div>

      <div className="chair-proposal-grid">
        <div>
          <div className="label">Proposer</div>
          <div className="value">{shortenAddress(sp.proposer)}</div>
        </div>
        <div>
          <div className="label">Chair</div>
          <div className="value">{shortenAddress(sp.chair)}</div>
        </div>
        <div>
          <div className="label">Created</div>
          <div className="value">{fmtTime(sp.createdAt)}</div>
        </div>
        <div>
          <div className="label">Seconded By</div>
          <div className="value">{sp.secondedBy && sp.secondedBy !== '0x0000000000000000000000000000000000000000' ? shortenAddress(sp.secondedBy) : '—'}</div>
        </div>
        <div>
          <div className="label">Voting Starts</div>
          <div className="value">{fmtTime(sp.votingStartsAt)}</div>
        </div>
        <div>
          <div className="label">Voting Ends</div>
          <div className="value">{fmtTime(sp.votingEndsAt)}</div>
        </div>
        <div>
          <div className="label">Amendments</div>
          <div className="value">{Number(sp.amendmentCount)}</div>
        </div>
        <div>
          <div className="label">Division Calls</div>
          <div className="value">{Number(sp.divisionCallCount)}{sp.divisionCalled ? ' (active)' : ''}</div>
        </div>
      </div>

      {sp.state >= 3 && (
        <div className={`chair-result-text ${sp.state === 3 ? 'passed' : 'failed'}`}>
          {sp.state === 3 ? 'Final result: PASSED' : 'Final result: FAILED'}
        </div>
      )}

      <div className="chair-controls">
        {sp.state < 2 && (
          <div className="duration-row">
            <label htmlFor="duration">Voting Duration:</label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="duration-select"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {sp.state === 0 && (
          <button
            className={`action-btn primary ${loading === 'fastTrack' ? 'loading' : ''}`}
            onClick={fastTrack}
            disabled={loading !== ''}
          >
            {loading === 'fastTrack' ? 'Fast Tracking...' : 'Fast Track Voting'}
          </button>
        )}

        {sp.state === 1 && (
          <button
            className={`action-btn primary ${loading === 'openVoting' ? 'loading' : ''}`}
            onClick={openVoting}
            disabled={loading !== ''}
          >
            {loading === 'openVoting' ? 'Opening...' : `Open Voting (${DURATION_OPTIONS.find(d => d.value === duration)?.label})`}
          </button>
        )}

        {sp.state === 2 && (
          <div className="voting-controls">
            {selectedProposal.reconsiderationRequested && (
              <button
                className={`action-btn warning ${reopenLoading ? 'loading' : ''}`}
                onClick={reopenVoting}
                disabled={reopenLoading}
              >
                {reopenLoading ? 'Reopening...' : 'Reopen Voting (Reconsideration)'}
              </button>
            )}

            <button
              className={`action-btn success ${loading === 'finalize' ? 'loading' : ''}`}
              onClick={finalize}
              disabled={loading !== ''}
            >
              {loading === 'finalize' ? 'Finalizing...' : 'Finalize Proposal'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
