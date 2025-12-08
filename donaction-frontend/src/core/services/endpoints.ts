// ENDPOINTS LIST
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://notavailable';
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const BASE_URL_SC_DEV = process.env.NEXT_PUBLIC_SERVER_COMPONENTS_DEV_API_URL; // SC; Server components
export const BASE_URL_SC_PROD = process.env.NEXT_PUBLIC_SERVER_COMPONENTS_DEV_API_URL; // SC; Server components
export const UPDATE_TOKEN = '/...'; // TODO: TOTO

/* CMS */
export const GET_MECENAT = () => '/api/page-mecenat?populate=FAQ.faq_item&populate[0]=slider';
export const GET_MECENAT_REASSURANCE = () => '/api/mecenat-reassurance';
export const GET_CONTACT_PAGE = () =>
	'/api/page-contact?populate[0]=visuel&populate[1]=FAQ.faq_item';
export const GET_MES_DONS_PAGE = () => '/api/page-liste-don?populate[0]=FAQ.faq_item';

export const GET_HP =
	'/api/page-home?populate[0]=FAQ.faq_item&populate[1]=partnerList.logo&populate[2]=contenu.image&populate[3]=slider';
export const GET_DON_CGU = '/api/cgu';
export const GET_CGU = '/api/cgu';
export const GET_CLUB_CGU = '/api/cgu-klub';
export const GET_COOKIES = '/api/page-cookie';
export const POST_CONTACT_US = '/api/contacts';
export const POST_NEWSLETTERS = '/api/newsletters';

/* Klubr */
const KLUBR_ENDPOINT = 'klubrs';
export const GET_SLUG_LIST = (pageSize: number) =>
	`/api/${KLUBR_ENDPOINT}?fields[0]=slug&fields[1]=denomination&sort[0]=createdAt:desc&pagination[page]=1&pagination[pageSize]=${pageSize}&filters[status][$eq]=published&filters[klubr_house][$notNull]=true`;
export const GET_ALL_SLUGS_LIST = `/api/${KLUBR_ENDPOINT}?fields[0]=slug&fields[1]=updatedAt&filters[status][$eq]=published&filters[klubr_house][$notNull]=true`;
export const GET_ALL_CLUBS = (
	page: number,
	pageSize: number,
	withNbProjects?: boolean,
	featured?: boolean,
	isPreview?: boolean,
) =>
	`/api/${KLUBR_ENDPOINT}?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[0]=createdAt:desc${withNbProjects ? '&withNbProjects=true' : ''}${featured ? '&featured=true' : ''}${isPreview ? '' : '&filters[status][$eq]=published&filters[klubr_house][$notNull]=true'}`;
export const GET_CLUB = (uuid: string) => `/api/${KLUBR_ENDPOINT}/${uuid}?populate=*`;
export const GET_CLUB_BY_SLUG = (slug: string) =>
	`/api/${KLUBR_ENDPOINT}/bySlug/${slug}?populate[0]=logo&populate[1]=klubr_house&filters[status][$eq]=published`;
export const GET_CLUB_BY_SLUG_PREVIEW = (slug: string) =>
	`/api/${KLUBR_ENDPOINT}/bySlug/${slug}/preview?populate[0]=logo&populate[1]=klubr_house`;
export const GET_CLUB_BY_UUID = (uuid: string) => `/api/${KLUBR_ENDPOINT}/${uuid}`;

/* KlubrHouse */
const KLUBR_HOUSE_ENDPOINT = 'klubr-houses';
// export const GET_KLUBR_HOUSE = (id: string) => `/api/${KLUBR_HOUSE_ENDPOINT}/${id}?populate=*`;
export const GET_KLUBR_HOUSE = (uuid: string) => `/api/${KLUBR_HOUSE_ENDPOINT}/full/${uuid}`;
export const CREATE_KLUBR_MEMBER = (uuid?: string) =>
	`/api/klubr-membres/for-front${uuid ? `/${uuid}` : ''}`;
export const GET_KLUBR_MEMBER = (uuid: string) => `/api/klubr-membres/for-front/${uuid}`;
export const CREATE_KLUBR_BY_MEMBER = (memberUuid: string) =>
	`/api/klubrs/new/by-leader/${memberUuid}`;

/* KlubDon*/
const KLUBR_DONS_ENDPOINT = 'klub-dons';
export const GET_KLUBR_DONS = (uuid: string, page: number, pageSize: number) =>
	`/api/${KLUBR_DONS_ENDPOINT}/byKlub?sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}&uuid=${uuid}`;
export const GET_KLUBR_PROJECT_DONS = (uuid: string, page: number, pageSize: number) =>
	`/api/${KLUBR_DONS_ENDPOINT}/byProject?sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}&uuid=${uuid}`;
export const GET_KLUBR_BY_SLUG_DONS = (slug: string, page: number, pageSize: number) =>
	`/api/${KLUBR_DONS_ENDPOINT}/byKlub?sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}&slug=${slug}`;
export const GET_KLUBR_PROJECT_BY_SLUG_DONS = (slug: string, page: number, pageSize: number) =>
	`/api/${KLUBR_DONS_ENDPOINT}/byProject?sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}&slug=${slug}`;
export const GET_KLUBR_DON = (uuid: string, relaunchCode?: number) =>
	`/api/${KLUBR_DONS_ENDPOINT}/${uuid}?populate[0]=klubr&populate[1]=klub_projet&populate[2]=klubDonateur.logo&populate[3]=klub_don_contribution`;
export const GET_KLUBR_DON_RELAUNCH = (uuid: string, relaunchCode?: number) =>
	`/api/${KLUBR_DONS_ENDPOINT}/relaunch/${uuid}?populate[0]=klubr&populate[1]=klub_projet&populate[2]=klubDonateur.logo&populate[3]=klub_don_contribution${relaunchCode ? '&RELAUNCH_CODE=' + relaunchCode : ''}`;
export const CREATE_KLUB_DON_PAYMENT = '/api/klub-don-payments';
export const UPDATE_KLUB_DON_PAYMENT = (id: number) => `/api/klub-don-payments/${id}`;
export const GET_MY_LAST_DONATION = '/api/klubr-donateurs/my-last';
export const GET_MY_DONATIONS = (page: number, pageSize: number) =>
	`/api/${KLUBR_DONS_ENDPOINT}/my-dons?sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
export const POST_KLUBR_DON = () => `/api/${KLUBR_DONS_ENDPOINT}/`;
export const PUT_KLUBR_DON = (uuid: string) => `/api/${KLUBR_DONS_ENDPOINT}/${uuid}`;
export const GET_KLUBR_DON_ATTESTATION_PDF = (uuid: string) =>
	`/api/${KLUBR_DONS_ENDPOINT}/${uuid}/att-pdf`;
export const GET_KLUBR_DON_RECU_PDF = (uuid: string) =>
	`/api/${KLUBR_DONS_ENDPOINT}/${uuid}/recu-pdf`;

/* KlubrDonateur*/
const KLUBR_DONATEURS_ENDPOINT = 'klubr-donateurs';
export const GET_KLUBR_DONATEURS = (id: string, page: number, pageSize: number) =>
	`/api/${KLUBR_DONATEURS_ENDPOINT}/byKlub?sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}&id=${id}`;
export const GET_KLUBR_DONATEUR = (id: string) =>
	`/api/${KLUBR_DONATEURS_ENDPOINT}/${id}?populate=*`;
export const POST_KLUBR_DONATEUR = () => `/api/${KLUBR_DONATEURS_ENDPOINT}/`;
export const PUT_KLUBR_DONATEUR = (id: string) => `/api/${KLUBR_DONATEURS_ENDPOINT}/${id}`;

/* KlubProjet */
const KLUBR_PROJETS_ENDPOINT = 'klub-projets';
export const GET_PROJETS = (
	page: number,
	pageSize: number,
	featured?: boolean,
	isPreview?: boolean,
) =>
	// TODO: to be done --> ${isPreview ? '' : '&filters[status][$eq]=published'}
	`/api/${KLUBR_PROJETS_ENDPOINT}?populate[0]=couverture&populate[1]=klubr.logo&sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}${featured ? '&featured=true' : ''}`;
export const GET_PROJET_BY_SLUG = (slug: string) =>
	`/api/${KLUBR_PROJETS_ENDPOINT}/bySlug/${slug}?populate[0]=tmplReference`;
export const GET_KLUBR_PROJETS = (
	uuid: string,
	page: number,
	pageSize: number,
	exceptId?: string,
) =>
	`/api/${KLUBR_PROJETS_ENDPOINT}/byKlub/${uuid}?sort[0]=status:desc&sort[1]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}${!!exceptId ? `&exceptId=${exceptId}` : ''}`;
export const GET_ALL_PROJETS_SLUGS_LIST = `/api/${KLUBR_PROJETS_ENDPOINT}?fields[0]=slug&fields[1]=updatedAt`;
export const GET_ALL_PROJETS_SLUGS_WITH_KLUBR_SLUG_LIST = `/api/${KLUBR_PROJETS_ENDPOINT}?fields[0]=slug&fields[1]=updatedAt&populate[klubr][fields][0]=slug&filters[klubr][status][$eq]=published&pagination[pageSize]=100`;

// Auth
export const ME =
	'/api/users/me?populate[0]=role&populate[1]=klubr_membres.klubr&populate[2]=avatar';
export const LOGIN = '/api/strapi-auth/local';
export const FORGOT_PASSWORD = '/api/strapi-auth/forgot-password';
export const RESET_PASSWORD = '/api/strapi-auth/reset-password';
export const REGISTER = '/api/strapi-auth/local/register';
export const CHANGE_PASSWORD = '/api/strapi-auth/change-password';
export const UPDATE = (id: string) => `/api/users/${id}`;
export const UPDATE_USER_IMG = (uuid: string) => `/api/medias/user/${uuid}/files`;
export const UPLOAD_COMPANY_LOGO = (uuid: string) => `/api/medias/klubr-donateur/${uuid}/files`;
export const CHECK_USER_EXISTENCE = (email: string) =>
	`/api/users-permissions/users/exists/${email}`;
export const GET_AVATARS = (type: 'women' | 'men', page?: number, pageSize?: number) =>
	`/api/medias/avatars/${type}`;
// ?pagination[page]=${page}&pagination[pageSize]=${pageSize} TODO: pagination didn't work
