import { XIcon } from '@heroicons/react/solid';
import { FormStepProps } from 'pages/proposals/propose';
import React from 'react';
import inputExists from 'utils/isValidInput';
import ControlledTextInput from './ControlledTextInput';
import IpfsUpload from './IpfsUpload';
import ActionButtons from './IpfsUploadActionButtons';

const AdditionalImages: React.FC<FormStepProps> = ({
  form,
  navigation,
  visible,
}) => {
  const [formData, setFormData] = form;
  const { setCurrentStep, currentStep } = navigation;
  function updateAdditionalImages(additionalImages) {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        additionalImages: formData.files.additionalImages.concat(
          additionalImages.map((image) => {
            return { image: image, description: '' };
          }),
        ),
      },
    });
  }

  function removeImage(index) {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        additionalImages: formData.files.additionalImages.filter((image, i) => {
          return i !== index;
        }),
      },
    });
  }

  function updateImageDescription(description: string, index: number): void {
    const stateCopy = { ...formData };
    stateCopy.files.additionalImages[index].description = description;
    setFormData(stateCopy);
  }

  function clearLocalState(): void {
    setFormData({
      ...formData,
      files: { ...formData.files, additionalImages: [] },
    });
  }

  function isFilled(): boolean {
    return (
      formData?.files?.additionalImages?.length > 0 &&
      formData?.files?.additionalImages.every(
        (image) => image.image !== '' && image.description !== '',
      )
    );
  }

  return (
    visible && (
      <>
        <IpfsUpload
          stepName={`${navigation.currentStep} - Upload Additional Images (Optional)`}
          localState={formData?.files?.additionalImages?.map(
            (image) => image.image,
          )}
          setLocalState={updateAdditionalImages}
          fileDescription={'Additional Images'}
          fileInstructions={
            'Images should be 1200px X 675px and 16:9, and less than 5mb'
          }
          fileType={'image/*'}
          numMaxFiles={4}
          maxFileSizeMB={5}
        />

        <div className="mt-8 max-w-sm mx-auto">
          {formData?.files?.additionalImages?.map((image, i) => (
            <div className="mb-4">
              <div className="relative">
                <img
                  className="mx-auto w-full"
                  src={'https://gateway.pinata.cloud/ipfs/' + image.image}
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-0 m-2 px-2 py-2 border border-transparent text-sm font-medium rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <XIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="mx-auto mt-2 w-80">
                <p>Image {i + 1} Description</p>
                <ControlledTextInput
                  inputValue={image.description}
                  id={`description ${i}`}
                  placeholder={`Description for Image ${i + 1}`}
                  errorMessage="Image description cannot be blank."
                  updateInput={updateImageDescription}
                  inputIndex={i}
                  isValid={inputExists}
                />
              </div>
            </div>
          ))}
        </div>
        {isFilled() ? (
          <ActionButtons
            clearLocalState={clearLocalState}
            navigation={navigation}
          />
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => {
                setCurrentStep(currentStep + 1);
              }}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Skip
            </button>
          </div>
        )}
      </>
    )
  );
};
export default AdditionalImages;
