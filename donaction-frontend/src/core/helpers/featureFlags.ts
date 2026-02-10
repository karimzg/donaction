/** Feature flags derived from environment */

export const SHOW_CLUBS_NAV = process.env.NEXT_PUBLIC_ENVIRONMENT !== 'prod';

/** Social links are hidden until official accounts are created */
export const SHOW_SOCIAL_LINKS = false;
