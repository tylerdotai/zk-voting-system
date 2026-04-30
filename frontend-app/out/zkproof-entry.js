import { generateVoteProof, formatProofForVerifier, randomNullifierSeed } from './zkproof.mjs';
window._zkGenerateVoteProof = generateVoteProof;
window._zkFormatProof = formatProofForVerifier;
window._zkRandomNullifierSeed = randomNullifierSeed;
