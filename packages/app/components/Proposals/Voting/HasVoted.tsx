import { CheckIcon } from '@heroicons/react/solid';

const HasVoted: React.FC = () => {
  return (
    <div className="mx-48 my-8">
      <div className="w-1/2 mx-auto flex flex-row items-center">
        <CheckIcon className="flex-shrink-0 h-10 w-10 text-green-500 mr-1" />
        <p className="text-gray-700 text-lg">You voted already.</p>
      </div>
    </div>
  );
};

export default HasVoted;
