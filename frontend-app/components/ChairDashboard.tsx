import React, { useState } from 'react';
import { ProposalData, getContract } from '../lib/ethereum';
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

export default function ChairDashboard({ selectedProposal, onRefresh }: Props) {
  const [loading, setLoading] = useState('');
  const [duration, setDuration] = useState(15 * 60); // default 15 min
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

  if (!selectedProposal) return null;
  const sp = selectedProposal;

  return (
    <div className="chair-controls">
      {/* Duration selector — only show when in Created or Seconded state */}
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

      {/* Created state — can fast-track (chair bypass seconding) or just wait */}
      {sp.state === 0 && (
        <button
          className={`action-btn primary ${loading === 'fastTrack' ? 'loading' : ''}`}
          onClick={fastTrack}
          disabled={loading !== ''}
        >
          {loading === 'fastTrack' ? 'Fast Tracking...' : '⚡ Fast Track Voting'}
        </button>
      )}

      {/* Seconded state — can open voting properly */}
      {sp.state === 1 && (
        <button
          className={`action-btn primary ${loading === 'openVoting' ? 'loading' : ''}`}
          onClick={openVoting}
          disabled={loading !== ''}
        >
          {loading === 'openVoting' ? 'Opening...' : `Open Voting (${DURATION_OPTIONS.find(d => d.value === duration)?.label})`}
        </button>
      )}

      {/* Voting state — can finalize if time expired OR reconsider */}
      {sp.state === 2 && (
        <div className="voting-controls">
          <div className="vote-tally">
            <span className="yes-count">Yes: {Number(sp.yesVotes)}</span>
            <span className="no-count">No: {Number(sp.noVotes)}</span>
            <span className="abstain-count">Abstain: {Number(sp.abstainVotes)}</span>
          </div>

          {selectedProposal.reconsiderationRequested && (
            <button
              className={`action-btn warning ${reopenLoading ? 'loading' : ''}`}
              onClick={reopenVoting}
              disabled={reopenLoading}
            >
              {reopenLoading ? 'Reopening...' : '🔄 Reopen Voting (Reconsideration)'}
            </button>
          )}

          <button
            className={`action-btn success ${loading === 'finalize' ? 'loading' : ''}`}
            onClick={finalize}
            disabled={loading !== ''}
          >
            {loading === 'finalize' ? 'Finalizing...' : '✅ Finalize Proposal'}
          </button>
        </div>
      )}

      {/* Passed or Failed — show result */}
      {(sp.state === 3 || sp.state === 4) && (
        <div className="proposal-result">
          <span className={`result-badge ${sp.state === 3 ? 'passed' : 'failed'}`}>
            {sp.state === 3 ? '✅ PASSED' : '❌ FAILED'}
          </span>
        </div>
      )}
    </div>
  );
}