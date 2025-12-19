const analyticsEnabled = process.env.NEXT_PUBLIC_ACTIVATE_ANALYTICS === 'true';
export const sendGaEvent = (data: {
	category?: string;
	label?: string;
	value?: number;
	path?: string;
	step?: number;
	method?: string;
	klub_slug?: string;
	project_slug?: string;
	klub_uuid?: string;
	project_uuid?: string;
}) => {
	if (analyticsEnabled && window.plausible) {
		window.plausible(data?.category || 'custom_event', {
			props: {
				// step: data?.step,
				// value: data?.value,
				event_label: `${data?.label}${data?.step ? ' => step: ' + data?.step : ''}`,
				method: data?.method,
				klub_slug: data?.klub_slug,
				// klub_uuid: data?.klub_uuid,
				project_slug: data?.project_slug,
				// project_uuid: data?.project_uuid,
				from_sponsorship_form: false,
				// page_path: window.location.href,
			},
		});
	}
};
