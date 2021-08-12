import { BeneficiaryImage } from '@popcorn/contracts/adapters';
import React from 'react';
import truncate from 'utils/truncate';

// TODO: Figure out the types here
export interface CardBodyProps {
  image: BeneficiaryImage;
  name: string;
  missionStatement: string;
}

const CardBody: React.FC<CardBodyProps> = ({
  image,
  name,
  missionStatement,
}) => {
  return (
    <React.Fragment>
      <div className="flex-shrink-0">
        <img
          className="h-48 w-full object-cover"
          src={`${process.env.IPFS_URL}${image?.image}`}
          alt={image?.description || `Picture of ${name}`}
        />
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-xl font-semibold text-gray-900">{name}</p>
          <p className="mt-3 text-base text-gray-500">
            {truncate(missionStatement, 180)}
          </p>
        </div>
      </div>
    </React.Fragment>
  );
};
export default CardBody;
