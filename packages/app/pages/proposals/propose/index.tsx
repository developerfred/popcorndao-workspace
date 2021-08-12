import { BeneficiaryApplication } from '@popcorn/contracts/adapters';
import NavBar from 'components/NavBar/NavBar';
import AdditionalImages from 'components/Proposals/Form/AdditionalImages';
import BeneficiaryAddress from 'components/Proposals/Form/BeneficiaryAddress';
import ContactEmail from 'components/Proposals/Form/ContactEmail';
import HeaderImage from 'components/Proposals/Form/HeaderImage';
import ImpactReportsAudits from 'components/Proposals/Form/ImpactReportsAudits';
import Intro from 'components/Proposals/Form/Intro';
import MissionStatement from 'components/Proposals/Form/MissionStatement';
import Name from 'components/Proposals/Form/Name';
import NavigationButtons from 'components/Proposals/Form/NavigationButtons';
import Preview from 'components/Proposals/Form/Preview';
import ProfileImage from 'components/Proposals/Form/ProfileImage';
import ProjectName from 'components/Proposals/Form/ProjectName';
import ProofOfOwnership from 'components/Proposals/Form/ProofOfOwnership';
import SocialMedia from 'components/Proposals/Form/SocialMedia';
import Video from 'components/Proposals/Form/Video';
import Website from 'components/Proposals/Form/Website';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export interface Navigation {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  numSteps: number;
}

export interface FormStepProps {
  form: [
    BeneficiaryApplication,
    React.Dispatch<React.SetStateAction<BeneficiaryApplication>>,
  ];
  navigation: Navigation;
  visible: boolean;
}

export const defaultFormData: BeneficiaryApplication = {
  organizationName: '',
  projectName: '',
  missionStatement: '',
  beneficiaryAddress: '',
  files: {
    profileImage: { image: '', description: '' },
    headerImage: { image: '', description: '' },
    impactReports: [],
    additionalImages: [],
    video: '',
  },
  links: {
    twitterUrl: '',
    linkedinUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    githubUrl: '',
    proofOfOwnership: '',
    contactEmail: '',
    website: '',
  },
  version: '1.0',
};

const stepOrder: string[] = [
  'intro',
  'name',
  'project-name',
  'beneficiary-address',
  'mission-statement',
  'proof-of-ownership',
  'profile-image',
  'header-image',
  'additional-images',
  'video',
  'impact-reports-audits',
  'website',
  'contact-email',
  'social-media',
  'preview',
];

export default function BeneficiaryProposal(): JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>();
  const [formData, setFormData] =
    useState<BeneficiaryApplication>(defaultFormData);
  const router = useRouter();
  useEffect(() => {
    const formData = localStorage.getItem('beneficiaryNominationProposal');
    if (formData !== null) setFormData(JSON.parse(formData));
  }, []);

  useEffect(() => {
    const stepName = router.query.step as string;
    const stepIndex = stepOrder.indexOf(stepName);
    if (stepIndex !== undefined && stepIndex !== -1) {
      if (stepIndex !== undefined && stepIndex !== currentStep)
        setCurrentStep(stepIndex);
    }
  }, [router]);

  useEffect(() => {
    const stepName = stepOrder[currentStep];
    router.push(`/proposals/propose/?step=${stepName}`, undefined, {
      shallow: true,
    });
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem(
      'beneficiaryNominationProposal',
      JSON.stringify(formData),
    );
  }, [formData]);

  const navigation: Navigation = {
    currentStep,
    setCurrentStep,
    numSteps: stepOrder.length - 1,
  };
  return (
    <div className="flex flex-col h-screen justify-between">
      <NavBar />
      {currentStep !== undefined && (
        <div className="mt-10 mx-auto max-w-7xl">
          <Intro
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'intro'}
          />
          <Name
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'name'}
          />
          <ProjectName
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'project-name'}
          />
          <BeneficiaryAddress
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'beneficiary-address'}
          />
          <MissionStatement
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'mission-statement'}
          />
          <ProofOfOwnership
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'proof-of-ownership'}
          />
          <ProfileImage
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'profile-image'}
          />
          <HeaderImage
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'header-image'}
          />
          <AdditionalImages
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'additional-images'}
          />
          <Video
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'video'}
          />
          <ImpactReportsAudits
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'impact-reports-audits'}
          />
          <Website
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'website'}
          />
          <ContactEmail
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'contact-email'}
          />
          <SocialMedia
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'social-media'}
          />
          <Preview
            form={[formData, setFormData]}
            navigation={navigation}
            visible={stepOrder[currentStep] === 'preview'}
          />
        </div>
      )}
      <NavigationButtons navigation={navigation} />
      <Toaster position="top-right" />
    </div>
  );
}
