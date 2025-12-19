import React from 'react';
import { ISponsorshipFormConfig } from '@/partials/sponsorshipForm/logic/useSponsorshipForm';
import Step1 from '@/partials/sponsorshipForm/steps/step1';
import Step2 from '@/partials/sponsorshipForm/steps/step2';
import Step3 from '@/partials/sponsorshipForm/steps/step3';
import Step4 from '@/partials/sponsorshipForm/steps/step4';
import Step5 from '@/partials/sponsorshipForm/steps/step5';
import ProjectsSlide from '@/partials/sponsorshipForm/steps/components/projectsSlide';
import { KlubProjet } from '@/core/models/klub-project';

const FormBody: React.FC<{
	config: ISponsorshipFormConfig;
	slides: Array<KlubProjet>;
	canChooseProject: boolean;
	projectsSlideFeedback: Function;
}> = (props) => {
	const getForm = () => {
		switch (props.config.stepIndex) {
			case 0:
				return <Step1 {...props.config} />;
			case 1:
				return <Step2 {...props.config} />;
			case 2:
				return <Step3 {...props.config} />;
			default:
				return <></>;
		}
	};

	const getBody = () => {
		if (props.config.stepIndex <= 2)
			return (
				<form className={'flex flex-col'} onSubmit={(e) => e.preventDefault()}>
					{getForm()}
				</form>
			);
		if (props.config.stepIndex === 3) return <Step4 config={props.config} />;
		return (
			<Step5
				club={props.config.club}
				projet={props.config.selectedProject}
				email={props.config.defaultValues.email as string}
			/>
		);
	};

	return (
		<div className='formBodyContainer w-full'>
			{getBody()}
			{/*{props.canChooseProject && props.config.stepIndex === 0 && (*/}
			{/*	<ProjectsSlide*/}
			{/*		slides={props.slides}*/}
			{/*		isProjectDonation={props.config.isProjectDonation}*/}
			{/*		selectedProject={props.config.selectedProject}*/}
			{/*		feedback={props.projectsSlideFeedback}*/}
			{/*		projectSelectionError={props.config.projectSelectionError}*/}
			{/*	/>*/}
			{/*)}*/}
		</div>
	);
};

export default FormBody;
