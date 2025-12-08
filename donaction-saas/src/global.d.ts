export {};

declare global {
  interface Window {
    plausible: (eventName: string, options?: PlausibleOptions) => void;
  }

  interface PlausibleOptions {
    props: {
      value?: string | number | boolean;
      event_label?: string;
      page_path?: string;
      step?: number;
      klub_slug?: string;
      project_slug?: string;
      klub_uuid?: string;
      project_uuid?: string;
      revenue?: any;
      from_sponsorship_form: boolean;
    };
  }
}
