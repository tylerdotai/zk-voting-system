export const CONTRACT_ADDRESS = '0x0e51E42d9a18Bae5790B0e2298E85f067d30E70c';
export const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111

export const ROB_RULES_ABI = [
  "function proposalCount() view returns (uint256)",
  "function getProposal(uint256 _proposalId) view returns (string, address, address, uint256, uint256, uint256, address, uint256, uint256, uint256, uint256, uint256, uint256, bool, uint256, bool)",
  "function getAmendment(uint256 _proposalId, uint256 _amendmentId) view returns (string, address, bool, uint256, uint256, uint256)",
  "function hasVoted(uint256 _proposalId, address _voter) view returns (bool)",
  "function isEligible(address _user) view returns (bool)",
  "function chair() view returns (address)",
  "function addVoter(address _voter)",
  "function removeVoter(address _voter)",
  "function addVoters(address[] calldata _voters)",
  "function createProposal(string calldata _description) returns (uint256)",
  "function secondProposal(uint256 _proposalId)",
  "function submitAmendment(uint256 _proposalId, string calldata _description) returns (uint256)",
  "function approveAmendment(uint256 _proposalId, uint256 _amendmentId)",
  "function fastTrackVoting(uint256 _proposalId, uint256 _duration)",
  "function openVoting(uint256 _proposalId, uint256 _duration)",
  "function castVote(uint256 _proposalId, uint256 _choice)",
  "function finalizeProposal(uint256 _proposalId)",
  "function reconsider(uint256 _proposalId)",
  "function reopenVoting(uint256 _proposalId)",
  "function callForDivision(uint256 _proposalId)",
  "event ProposalCreated(uint256 indexed proposalId, address proposer, string description)",
  "event ProposalSeconded(uint256 indexed proposalId, address indexed secondedBy)",
  "event MotionVoted(uint256 indexed proposalId, uint256 choice, address indexed voter)",
  "event ProposalFinalized(uint256 indexed proposalId, uint256 finalState)",
];

export const STATES = ['Created', 'Seconded', 'Voting', 'Passed', 'Failed'];