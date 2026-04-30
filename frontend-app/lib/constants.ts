export const CONTRACT_ADDRESS = '0x397b13EaD1ED0D72eC7A7aD660D00fF089539CF3';
export const VERIFIER_ADDRESS = '0x02aa9654f33Aa73880460B4f286A430c4D56CAb6';
export const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111

export const ROB_RULES_ABI = [
  "function proposalCount() view returns (uint256)",
  "function getProposal(uint256 _proposalId) view returns (string, address, address, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool, uint256, bool)",
  "function getAmendment(uint256 _proposalId, uint256 _amendmentId) view returns (string, address, bool, uint256, uint256, uint256)",
  "function hasVoted(uint256 _proposalId, address _voter) view returns (bool)",
  "function isEligible(address _user) view returns (bool)",
  "function chair() view returns (address)",
  "function addVoter(address _voter)",
  "function removeVoter(address _voter)",
  "function createProposal(string calldata _description) returns (uint256)",
  "function secondProposal(uint256 _proposalId)",
  "function submitAmendment(uint256 _proposalId, string calldata _description) returns (uint256)",
  "function approveAmendment(uint256 _proposalId, uint256 _amendmentId)",
  "function fastTrackVoting(uint256 _proposalId, uint256 _duration)",
  "function openVoting(uint256 _proposalId, uint256 _duration)",
  "function castVote(uint256 _proposalId, uint256 _choice, bytes32 _nullifierHash, uint256[2] calldata _pA, uint256[2][2] calldata _pB, uint256[2] calldata _pC, uint256[3] calldata _pubSignals)",
  "function finalizeProposal(uint256 _proposalId)",
  "function callForDivision(uint256 _proposalId)",
  "event ProposalCreated(uint256 indexed proposalId, address proposer, string description)",
  "event MotionVoted(uint256 indexed proposalId, uint256 choice, address indexed voter)",
];

export const STATES = ['Created', 'Seconded', 'Voting', 'Passed', 'Failed'];
