import { DocumentReportIcon, XIcon } from '@heroicons/react/outline';
import { FormStepProps } from 'pages/proposals/propose';
import React from 'react';
import IpfsUpload from './IpfsUpload';
import ActionButtons from './IpfsUploadActionButtons';

const HeaderImage: React.FC<FormStepProps> = ({
  form,
  navigation,
  visible,
}) => {
  const [formData, setFormData] = form;

  function updateImpactReports(impactReports: string[]): void {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        impactReports: formData.files.impactReports.concat(impactReports),
      },
    });
  }

  function removeFile(index) {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        impactReports: formData.files.impactReports.filter((file, i) => {
          return i !== index;
        }),
      },
    });
  }

  function clearLocalState(): void {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        impactReports: [],
      },
    });
  }

  return (
    visible && (
      <>
        <IpfsUpload
          stepName={`${navigation.currentStep} - Upload Impact Reports`}
          localState={formData?.files?.impactReports}
          setLocalState={updateImpactReports}
          fileDescription={'Impact Reports'}
          fileInstructions={`Impact reports should be PDFs and limited to 5mb.`}
          fileType={'.pdf'}
          numMaxFiles={0}
          maxFileSizeMB={10}
        />
        <div className="mx-auto">
          {formData?.files?.impactReports.map((IpfsHash, i) => {
            return (
              <div key={IpfsHash} className="flex flex-row items-center">
                <a
                  className="justify-self-center mx-auto mt-4 inline-flex py-1"
                  href={'https://gateway.pinata.cloud/ipfs/' + IpfsHash}
                >
                  {`Impact Report/Audit ${i + 1}: `}
                  <DocumentReportIcon className="ml-2 h-5 w-5" />
                </a>
                <button
                  onClick={() => removeFile(i)}
                  className="mt-4 border border-transparent text-sm font-medium rounded-full text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            );
          })}

          {formData?.files?.impactReports?.length > 0 && (
            <ActionButtons
              clearLocalState={clearLocalState}
              navigation={navigation}
            />
          )}
        </div>
      </>
    )
  );
};
export default HeaderImage;
