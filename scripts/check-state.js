const hre = require("hardhat");
async function main() {
  const c = await hre.ethers.getContractAt('ZKVotingRobRulesWithCredentials', '0xb3254AB74e5103F7374eEcDb57078eB10388CaC3');
  const chair = await c.chair();
  const n = await c.proposalCount();
  console.log('Chair:', chair);
  console.log('Proposal count:', n.toString());
  const STATES = ['Created','Seconded','Voting','Passed','Failed'];
  for(let i=0;i<n;i++) {
    const state = await c.getProposalState(i);
    console.log('Proposal ' + i + ': state=' + STATES[state] + ' (raw: ' + state + ')');
  }
}
main().catch(console.error);
