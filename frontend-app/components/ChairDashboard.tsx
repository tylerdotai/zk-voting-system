import React, { useState } from 'react';
import { ProposalData, getContract } from '../lib/ethereum';

interface ChairDashboardProps {
  proposals: ProposalData[];
  selectedProposal: ProposalData | null;
  onProposalCreated?: () => void;
}

export default function ChairDashboard({ proposals, selectedProposal, onProposalCreated }: ChairDashboardProps) {
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [voterAddr, setVoterAddr] = useState('');
  const [amendmentDesc, setAmendmentDesc] = useState('');
  const [error, setError] = useState('');

  const state = getContract();
  const contract = state?.contract;

  async function createProposal() {
    if (!desc.trim() || !contract) return;
    setLoading(true);
    setError('');
    try {
      const tx = await contract.createProposal(desc.trim());
      await tx.wait();
      setDesc('');
      onProposalCreated?.();
    } catch (e: any) {
      setError(e.reason || e.message || 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  }

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
    } catch (e: any) {
      setError(e.reason || e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!selectedProposal) {
    return (
      <div className="detail-panel">
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Select a proposal to manage it.</p>
      </div>
    );
  }

  const sp = selectedProposal;

  return (
    <div className="detail-panel">
      <h3>#{sp.id}: {sp.description}</h3>
      <p className="detail-meta">
        State {sp.state} · Yes: {sp.yesVotes} / No: {sp.noVotes} / Abs: {sp.abstainVotes}
      </p>

      {error && (
        <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginBottom: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
          {error}
        </div>
      )}

      <div className="chair-actions">
        <h4>Chair Actions</h4>

        {sp.state === 0 && (
          <button className="action-btn primary" onClick={openVoting} disabled={loading}>
            <span className="spinner" />Open Voting
          </button>
        )}

        {sp.state === 2 && (
          <>
            <button className="action-btn primary" onClick={finalize} disabled={loading}>
              <span className="spinner" />Finalize Proposal
            </button>
            <button className="action-btn secondary" onClick={callDivision} disabled={loading}>
              <span className="spinner" />Call for Division
            </button>
          </>
        )}

        {(sp.state === 3 || sp.state === 4) && (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Proposal is finalized.</p>
        )}
      </div>

      {/* Amendments */}
      <div className="amendments-section">
        <h4>Amendments</h4>
        <div className="amendment-input-row">
          <input
            type="text"
            placeholder="New amendment description..."
            value={amendmentDesc}
            onChange={(e) => setAmendmentDesc(e.target.value)}
          />
          <button onClick={submitAmendment} disabled={loading || !amendmentDesc.trim()}>
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
            placeholder="0x... address"
            value={voterAddr}
            onChange={(e) => setVoterAddr(e.target.value)}
          />
          <button className="add" onClick={addVoter} disabled={loading || !voterAddr.trim()}>Add</button>
          <button className="remove" onClick={removeVoter} disabled={loading || !voterAddr.trim()}>Remove</button>
        </div>
      </div>
    </div>
  );
}
