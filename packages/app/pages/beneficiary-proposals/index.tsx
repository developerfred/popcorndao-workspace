import BeneficiaryGrid from 'components/BeneficiaryGrid';

import { beneficiaryProposalFixtures } from 'fixtures/beneficiaryProposals';

export default function BeneficiaryPageWrapper(): JSX.Element {
  return (
    <BeneficiaryGrid
      title={'Beneficiary Proposals'}
      subtitle={
        'You choose which social initiatives are included in grant elections. Browse and vote on beneficiary nominations.'
      }
      isProposal={true}
      cardProps={beneficiaryProposalFixtures}
    />
  );
}
