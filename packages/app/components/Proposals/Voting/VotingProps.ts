import { Proposal } from '@popcorn/contracts/adapters';

export interface VotingProps {
  proposal: Proposal;
  hasVoted?: boolean;
}
