import { ProposalType } from '@popcorn/contracts/adapters';
import ProposalGrid from 'components/Proposals/ProposalGrid';

export default function TakedownPage(): JSX.Element {
  return <ProposalGrid proposalType={ProposalType.Takedown} />;
}
