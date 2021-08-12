import { ProposalType } from '@popcorn/contracts';
import { VoteOptions } from '@popcorn/contracts/lib/BeneficiaryGovernance/constants';
import { useWeb3React } from '@web3-react/core';
import { setDualActionModal } from 'context/actions';
import { store } from 'context/store';
import { connectors } from 'context/Web3/connectors';
import { ContractsContext } from 'context/Web3/contracts';
import { useContext, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import CountdownTimer from './CountdownTimer';
import HasVoted from './HasVoted';
import { VotingProps } from './VotingProps';

const ChallengePeriodVoting: React.FC<VotingProps> = ({
  proposal,
  hasVoted: hasVotedInitial = false,
}) => {
  const { dispatch } = useContext(store);
  const { contracts } = useContext(ContractsContext);
  const { library, account, activate } = useWeb3React();
  const [hasVoted, setHasVoted] = useState<Boolean>(hasVotedInitial);

  const closeModal = () => dispatch(setDualActionModal(false));
  const voteNo = async () => {
    toast.loading('Submitting vote...');
    contracts.beneficiaryGovernance
      .connect(library.getSigner())
      .vote(proposal.id, VoteOptions.Nay)
      .then((res) => {
        toast.success('Voted successfully!');
        setHasVoted(true);
      })
      .catch((err) => toast.error(err.data.message.split("'")[1]));
    closeModal();
  };

  return hasVoted ? (
    <HasVoted />
  ) : (
    <div>
      <Toaster position="top-right" />
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="mt-8 text-xl text-gray-500 leading-8">
            {proposal.application?.organizationName}{' '}
            {proposal.proposalType === ProposalType.Takedown
              ? `is in the second phase of takedown voting, known
            as the challenge period. Here, users are able to vote to veto the
            takedown proposal. This additional phase prevents exploits where a
            flood of late votes swings the results.`
              : `is in the second phase of voting, the
            challenge period. Here, users are able to vote to veto the
            nomination. This additional phase prevents exploits where a flood of
            late “Yes” votes swings the results.`}
          </p>
        </span>
      </div>
      <div className="grid my-2 justify-items-stretch">
        <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between">
          <p className="mt-8 text-xl text-gray-500 leading-8">
            {proposal.proposalType === ProposalType.Takedown
              ? `At the end of the challenge period, if the takedown proposal
            receives more yes votes than no votes, the elected organization will
            become ineligible to receive grants.`
              : `At the end of the challenge period, if the nomination receives more
            yes votes than no votes, the elected organization will become
            eligible to receive grants as an eligible beneficiary`}
          </p>
        </span>
      </div>
      <CountdownTimer {...proposal} />
      <div className="grid my-2 justify-items-stretch">
        <button
          type="button"
          className="my-4 justify-self-center inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => {
            dispatch(
              setDualActionModal(
                account
                  ? {
                      content: `Confirm your no vote for ${
                        proposal.proposalType === ProposalType.Takedown
                          ? 'the takedown of'
                          : ''
                      } ${
                        proposal.application.organizationName
                      }. You will not be able to cancel your vote once you confirm.`,
                      title: 'Confirm Vote',
                      onConfirm: {
                        label: 'Confirm vote',
                        onClick: voteNo,
                      },
                      onDismiss: {
                        label: 'Cancel',
                        onClick: closeModal,
                      },
                    }
                  : {
                      content:
                        'You must connect with MetaMask before you can vote.',
                      title: 'Connect MetaMask',
                      onConfirm: {
                        label: 'Connect',
                        onClick: () => {
                          activate(connectors.Injected);
                          dispatch(setDualActionModal(false));
                        },
                      },
                      onDismiss: {
                        label: 'Cancel',
                        onClick: () => dispatch(setDualActionModal(false)),
                      },
                    },
              ),
            );
          }}
        >
          {proposal.proposalType === ProposalType.Takedown
            ? 'Veto Takedown Proposal Vote'
            : 'Veto Proposal Vote'}
        </button>
      </div>
    </div>
  );
};
export default ChallengePeriodVoting;
