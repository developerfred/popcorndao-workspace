import { BeneficiaryApplication } from '@popcorn/utils';

export default function Verfication(
  beneficiary: BeneficiaryApplication,
): JSX.Element {
  return (
    <div>
      <p className="text-3xl text-black py-4">Verification and grant history</p>
      <div className="flex flex-row justify-between">
        <p className="text-lg font-bold text-gray-700">Beneficiary Address</p>
        <div className="text-base text-gray-700 flex flex-row">
          <a
            href={beneficiary?.beneficiaryAddress}
            className=" text-gray-400 hover:text-gray-500 underline"
          >
            <p>{beneficiary?.beneficiaryAddress}</p>
          </a>
        </div>
      </div>

      <div className="flex flex-row justify-between">
        <p className="text-lg font-bold text-gray-700">Proof of ownership</p>
        <div className="text-base text-gray-700 flex flex-row">
          <a
            href={beneficiary?.links?.proofOfOwnership}
            className=" text-gray-400 hover:text-gray-500 underline"
          >
            <p>{beneficiary?.links?.proofOfOwnership}</p>
          </a>
        </div>
      </div>

      <div className="flex flex-row justify-between">
        <p className="text-lg font-bold text-gray-700">
          Current grants and grant history
        </p>
        <div className="text-base text-gray-700 flex flex-row">
          <a
            href={'#'}
            className=" text-gray-400 hover:text-gray-500 underline"
          >
            <p>#</p>
          </a>
        </div>
      </div>
    </div>
  );
}
