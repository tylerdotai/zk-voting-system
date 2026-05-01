import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, ROB_RULES_ABI, SEPOLIA_CHAIN_ID } from './constants';

export interface ProposalData {
  id: number;
  description: string;
  proposer: string;
  chair: string;
  state: number;
  createdAt: number;
  secondedAt: number;
  secondedBy: string;
  votingStartsAt: number;
  votingEndsAt: number;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  amendmentCount: number;
  divisionCalled: boolean;
  divisionCallCount: number;
  reconsiderationRequested: boolean;
}

export interface ContractState {
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
  address: string;
  contract: ethers.Contract;
  isEligible: boolean;
  isChair: boolean;
}

let cachedState: ContractState | null = null;

declare global {
  interface Window {
    ethereum?: any;
  }
}

async function buildState(provider: ethers.BrowserProvider): Promise<ContractState> {
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ROB_RULES_ABI, signer);
  const chair = await contract.chair();
  const isEligible = await contract.isEligible(address);
  const isChair = chair.toLowerCase() === address.toLowerCase();
  cachedState = { provider, signer, address, contract, isEligible, isChair };
  return cachedState;
}

export async function connectWallet(): Promise<ContractState> {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== 11155111) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch {
      throw new Error('Please switch to Sepolia testnet');
    }
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  return buildState(provider);
}

export async function syncWalletState(): Promise<ContractState | null> {
  if (!window.ethereum) {
    cachedState = null;
    return null;
  }

  const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
  if (!accounts || accounts.length === 0) {
    cachedState = null;
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== 11155111) {
    cachedState = null;
    return null;
  }

  return buildState(provider);
}

export function clearCachedState(): void {
  cachedState = null;
}

export function shortenAddress(addr: string): string {
  if (!addr) return '—';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export function getContract(): ContractState | null {
  return cachedState;
}

export function getReadOnlyContract(): ethers.Contract | null {
  if (!window.ethereum) return null;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(CONTRACT_ADDRESS, ROB_RULES_ABI, provider);
  } catch {
    return null;
  }
}

export function formatTimeRemaining(endsAt: number): string {
  const now = Date.now();
  const end = Number(endsAt) * 1000;
  const diff = end - now;
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m left`;
}
