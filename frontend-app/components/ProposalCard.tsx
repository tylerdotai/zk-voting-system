import React from 'react';
import { ProposalData, formatTimeRemaining } from '../lib/ethereum';
import { STATES } from '../lib/constants';

interface ProposalCardProps {
  proposal: ProposalData;
  selected?: boolean;
  onClick?: () => void;
  showVotes?: boolean;
}

function StateBadge({ state }: { state: number }) {
  return (
    <span className={`state-badge state-${state}`}>
      {STATES[state] ?? 'Unknown'}
    </span>
  );
}

export default function ProposalCard({ proposal, selected, onClick, showVotes = true }: ProposalCardProps) {
  const timeLabel = formatTimeRemaining(Number(proposal.votingEndsAt));
  const isUrgent = Number(proposal.votingEndsAt) > 0 && Date.now() / 1000 > Number(proposal.votingEndsAt) - 3600;

  return (
    <div
      className={`proposal-card state-${proposal.state}${selected ? ' selected' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="proposal-header">
        <span className="proposal-id">#{proposal.id}</span>
        <StateBadge state={proposal.state} />
      </div>

      <p className="proposal-desc">{proposal.description}</p>

      {showVotes && (
        <div className="proposal-footer">
          <div className="proposal-votes">
            <span>
              <strong>{Number(proposal.yesVotes)}</strong> Yes
            </span>
            <span>
              <strong>{Number(proposal.noVotes)}</strong> No
            </span>
            <span>
              <strong>{Number(proposal.abstainVotes)}</strong> Abs
            </span>
          </div>
          {timeLabel !== 'Ended' && proposal.state === 2 && (
            <span className={`countdown${isUrgent ? ' urgent' : ''}`}>
              {timeLabel}
            </span>
          )}
          {proposal.state >= 3 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Finalized</span>
          )}
        </div>
      )}

      {!showVotes && (
        <div className="proposal-footer">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Proposer: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
          </span>
        </div>
      )}
    </div>
  );
}

export { StateBadge };
