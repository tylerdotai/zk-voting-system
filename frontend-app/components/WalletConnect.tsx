import React, { useState } from 'react';
import { connectWallet, shortenAddress, getContract } from '../lib/ethereum';

interface WalletConnectProps {
  onConnected?: () => void;
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    try {
      await connectWallet();
      onConnected?.();
    } catch (e) {
      console.error('Wallet connection failed', e);
    } finally {
      setLoading(false);
    }
  }

  const state = getContract();

  if (state?.address) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          className="wallet-badge"
          style={{
            background: 'var(--fw-blue-accent)',
            padding: '0.35rem 0.8rem',
            borderRadius: '8px',
          }}
        >
          {shortenAddress(state.address)}
        </span>
      </div>
    );
  }

  return (
    <button
      className="connect-btn"
      onClick={handleConnect}
      disabled={loading}
    >
      {loading ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}
