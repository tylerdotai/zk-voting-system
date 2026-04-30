import React, { useState } from 'react';
import { connectWallet, shortenAddress, getContract } from '../lib/ethereum';

interface WalletConnectProps {
  onConnected?: () => void;
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const state = getContract();

  async function handleConnect() {
    setLoading(true);
    setError('');
    try {
      await connectWallet();
      onConnected?.();
    } catch (e: any) {
      setError(e.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  }

  if (state) {
    return (
      <div className="wallet-addr">
        {shortenAddress(state.address)}
        {state.isChair && (
          <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: 'var(--amber)', background: 'var(--amber-dim)', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Chair
          </span>
        )}
        {state.isEligible && !state.isChair && (
          <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: 'var(--green)', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Eligible
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <button className="connect-btn" onClick={handleConnect} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--red)', maxWidth: '200px' }}>{error}</span>
      )}
    </div>
  );
}
