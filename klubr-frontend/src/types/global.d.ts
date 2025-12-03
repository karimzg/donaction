import React from 'react';

export {};

declare global {
	interface Window {
		gtag: (command: 'config' | 'event', trackingId: string, options?: GtagOptions) => void;
		plausible?: (eventName: string, options?: PlausibleOptions) => void;
		KLUBR_EVENT_BUS?: EventBus;
	}

	interface PlausibleOptions {
		props: {
			value?: string | number | boolean;
			method?: string;
			event_label?: string;
			page_path?: string;
			step?: number;
			klub_slug?: string;
			project_slug?: string;
			klub_uuid?: string;
			project_uuid?: string;
			from_sponsorship_form: boolean;
		};
	}

	declare namespace JSX {
		interface IntrinsicElements {
			'klubr-sponsorship-form': React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLElement>,
				HTMLElement
			> & { klubrUuid?: string; projectUuid?: string };
		}
	}
}
