import React, { useEffect, useState } from 'react';
import { clearCachedState, connectWallet, shortenAddress, getContract, syncWalletState } from '../lib/ethereum';

interface WalletConnectProps {
  onConnected?: () => void;
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!window.ethereum) return;

    let active = true;

    async function handleWalletChange() {
      try {
        await syncWalletState();
      } catch (e) {
        console.error('Wallet sync failed', e);
        clearCachedState();
      } finally {
        if (active) {
          setRefreshKey((k) => k + 1);
          onConnected?.();
        }
      }
    }

    window.ethereum.request?.({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts?.length) handleWalletChange();
      })
      .catch(() => {});

    window.ethereum.on?.('accountsChanged', handleWalletChange);
    window.ethereum.on?.('chainChanged', handleWalletChange);

    return () => {
      active = false;
      window.ethereum?.removeListener?.('accountsChanged', handleWalletChange);
      window.ethereum?.removeListener?.('chainChanged', handleWalletChange);
    };
  }, [onConnected]);

  async function handleConnect() {
    setLoading(true);
    try {
      await connectWallet();
      setRefreshKey((k) => k + 1);
      onConnected?.();
    } catch (e) {
      console.error('Wallet connection failed', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshWallet() {
    setLoading(true);
    try {
      await syncWalletState();
      setRefreshKey((k) => k + 1);
      onConnected?.();
    } catch (e) {
      console.error('Wallet refresh failed', e);
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
        <button
          type="button"
          onClick={handleRefreshWallet}
          disabled={loading}
          style={{
            background: 'transparent',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '8px',
            padding: '0.35rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Updating…' : 'Refresh Wallet'}
        </button>
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
