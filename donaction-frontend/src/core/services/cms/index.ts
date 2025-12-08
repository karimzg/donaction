import HttpService from '@/core/services';
import {
	GET_CGU,
	GET_CLUB_CGU,
	GET_CONTACT_PAGE,
	GET_COOKIES,
	GET_DON_CGU,
	GET_HP,
	GET_MECENAT,
	GET_MECENAT_REASSURANCE,
	GET_MES_DONS_PAGE,
	POST_CONTACT_US,
	POST_NEWSLETTERS,
} from '@/core/services/endpoints';
import { FaqI, IHpResult } from '@/core/models/hp';
import { IPageCGU, IPageCookies } from '@/core/models/cms';
import { TagsEnum } from '@/core/enum/tagsEnum';

export const getMecenat = (cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: GET_MECENAT(),
		tags: [TagsEnum.Mecenat_Contact_CGU_Cookies_HP, TagsEnum.PageMecenat],
		cookies,
	});

export const getMecenatReassurance = (cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: GET_MECENAT_REASSURANCE(),
		tags: [TagsEnum.Mecenat_Contact_CGU_Cookies_HP, TagsEnum.MecenatReassurance],
		cookies,
	});

export const getContactPage = (cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: GET_CONTACT_PAGE(),
		tags: [TagsEnum.Mecenat_Contact_CGU_Cookies_HP, TagsEnum.PageContact],
		cookies,
	});

export const getMesDonsPage = (cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: GET_MES_DONS_PAGE(),
		tags: [TagsEnum.Mecenat_Contact_CGU_Cookies_HP, TagsEnum.PageMesDons],
		cookies,
	});

export const getDonCGU = (
	cookies?: string,
): Promise<{
	data: { attributes: IPageCGU };
}> =>
	HttpService.ExecuteRequest({
		endPoint: GET_DON_CGU,
		tags: [TagsEnum.Mecenat_Contact_CGU_Cookies_HP, TagsEnum.DON_CGU],
		cookies,
	});

export const getCGU = (
	cookies?: string,
): Promise<{
	data: { attributes: IPageCGU };
}> =>
	HttpService.ExecuteRequest({
		endPoint: GET_CGU,
		tags: [TagsEnum.Mecenat_Contact_CGU_Cookies_HP, TagsEnum.CGU],
		cookies,
	});

export const getClubCGU = (
	cookies?: string,
): Promise<{
	data: { attributes: IPageCGU };
}> =>
	HttpService.ExecuteRequest({
		endPoint: GET_CLUB_CGU,
		tags: [TagsEnum.Mecenat_Contact_CGU_Cookies_HP, TagsEnum.CGU],
		cookies,
	});

export const getCookies = (
	cookies?: string,
): Promise<{
	data: { attributes: IPageCookies };
}> =>
	HttpService.ExecuteRequest({
		endPoint: GET_COOKIES,
		tags: [TagsEnum.Mecenat_Contact_CGU_Cookies_HP, TagsEnum.Cookies],
		cookies,
	});

export const getHp = (cookies?: string): Promise<{ data: { attributes: IHpResult } }> =>
	HttpService.ExecuteRequest({
		endPoint: GET_HP,
		tags: [TagsEnum.Mecenat_Contact_CGU_Cookies_HP, TagsEnum.HP],
		cookies,
	});

export const postContactUs = (body: {
	data: { object: string; msg: string; email: string; formToken: string };
}) =>
	HttpService.ExecuteRequest({
		endPoint: POST_CONTACT_US,
		method: 'post',
		data: body,
	});

export const postNewsletters = (body: { data: { email: string; formToken: string } }) =>
	HttpService.ExecuteRequest({
		endPoint: POST_NEWSLETTERS,
		method: 'post',
		data: body,
	});

type IReCaptchaFormAction =
	| 'CREATE_NEWSLETTER_FORM'
	| 'CREATE_CONTACT_FORM'
	| 'UPDATE_DONATION'
	| 'CREATE_DONATION'
	| 'CREATE_DONATION_PAYMENT'
	| 'LOGIN_FORM'
	| 'CREATE_KLUBR_BY_MEMBER'
	| 'CREATE_KLUBR_MEMBER'
	| 'UPDATE_KLUBR_MEMBER'
	| 'REGISTER_FORM';
export const createReCaptchaToken = (action: IReCaptchaFormAction): Promise<string> => {
	return new Promise((resolve, reject) => {
		try {
			grecaptcha.enterprise.ready(async () => {
				const formToken = await grecaptcha.enterprise.execute(
					process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY || '',
					{ action },
				);
				resolve(formToken);
			});
		} catch (e) {
			reject(null);
		}
	});
};
