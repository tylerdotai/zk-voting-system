import React from 'react';

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <header className="header">
        <div className="header-top">
          <h1>Fort Worth DAO Governance Demo</h1>
          <nav className="header-nav">
            <a href="/" className="active">Home</a>
            <a href="/voter">Voter Portal</a>
            <a href="/chair">Chair Dashboard</a>
            <a href="/verify">Verify</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="network">Sepolia</span>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-panel landing-copy">
            <span className="landing-eyebrow">Hackathon Demo • Rob&apos;s Rules • Phase 1 Live</span>
            <h2>Parliamentary DAO voting that judges can understand in one pass.</h2>
            <p>
              This demo turns Robert&apos;s Rules of Order into an on-chain workflow for Fort Worth DAO.
              Instead of a raw yes-or-no wallet poll, it shows the full motion lifecycle: proposal,
              second, voting window, tally, and final result on Ethereum Sepolia.
            </p>

            <div className="landing-meta">
              <div className="landing-stat">
                <span className="landing-stat-label">Live Contract</span>
                <span className="landing-stat-value">0xF844...dbad</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-label">Current Scope</span>
                <span className="landing-stat-value">Rob&apos;s Rules Governance</span>
              </div>
              <div className="landing-stat">
                <span className="landing-stat-label">Privacy Roadmap</span>
                <span className="landing-stat-value">ZK in Phase 2</span>
              </div>
            </div>

            <div className="landing-actions">
              <a className="landing-button primary" href="/chair">Open Chair Dashboard</a>
              <a className="landing-button secondary" href="/voter">Open Voter Portal</a>
              <a className="landing-button secondary" href="/verify">Verify Proposal</a>
            </div>
          </div>

          <aside className="landing-panel landing-side">
            <img src="/logo.png" alt="ZK Voting System logo" className="landing-logo" />
            <h3>What I&apos;m about to show</h3>
            <div className="landing-list">
              <div className="landing-list-item">
                <strong>1. Chair creates the motion</strong>
                The chair opens the parliamentary flow with a proposal and short demo voting window.
              </div>
              <div className="landing-list-item">
                <strong>2. Members participate</strong>
                Eligible wallets second, amend, and vote yes, no, or abstain.
              </div>
              <div className="landing-list-item">
                <strong>3. The result finalizes on-chain</strong>
                The tally is locked and anyone can verify the outcome against Sepolia state.
              </div>
            </div>
          </aside>
        </section>

        <section className="landing-grid">
          <div className="landing-card">
            <h3>Why this matters</h3>
            <p>
              Most DAO voting tools skip deliberation. Real groups do not. This build gives DAOs a governance flow that feels closer to an actual meeting than a token-weighted poll.
            </p>
          </div>
          <div className="landing-card">
            <h3>What&apos;s live right now</h3>
            <p>
              Chair-managed allowlist voting, fast track controls, configurable durations, amendment submission, reconsideration, and on-chain finalization.
            </p>
          </div>
          <div className="landing-card">
            <h3>What&apos;s next</h3>
            <p>
              The privacy layer. ZK vote proofs are still the long-term vision, but we cut them from Phase 1 so the hackathon demo stays stable and credible.
            </p>
          </div>
        </section>

        <section className="landing-section">
          <h3>Demo flow</h3>
          <p>
            The cleanest walkthrough is chair-led. Start with the chair dashboard, create a motion, move into a short voting period, switch to voter wallets, and then finalize the result.
          </p>
          <div className="landing-flow">
            <div className="landing-step">
              <span className="landing-step-number">1</span>
              <h4>Create and open</h4>
              <p>Create a proposal, choose a short duration, and fast-track or open voting.</p>
            </div>
            <div className="landing-step">
              <span className="landing-step-number">2</span>
              <h4>Cast votes</h4>
              <p>Use eligible wallets to second and cast yes, no, or abstain votes in the voter portal.</p>
            </div>
            <div className="landing-step">
              <span className="landing-step-number">3</span>
              <h4>Finalize and verify</h4>
              <p>Close the motion, show the tally, and verify the proposal state against the deployed contract.</p>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <h3>Phase breakdown</h3>
          <div className="landing-phase">
            <div className="landing-phase-card">
              <h4>Phase 1, live for the hackathon</h4>
              <ul>
                <li>Rob&apos;s Rules parliamentary motion flow</li>
                <li>Chair-managed voter eligibility</li>
                <li>Fast-track and timed voting controls</li>
                <li>On-chain tally and result verification</li>
              </ul>
            </div>
            <div className="landing-phase-card">
              <h4>Phase 2, privacy roadmap</h4>
              <ul>
                <li>Anonymous vote casting with nullifier protection</li>
                <li>Restored proving pipeline once circom tooling is stable</li>
                <li>ZK eligibility verification</li>
                <li>Private voting without exposing voter choices on-chain</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
