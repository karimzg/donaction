import HttpService from '@/core/services';
import {
	GET_KLUBR_DONATEUR,
	GET_KLUBR_DONATEURS,
	POST_KLUBR_DONATEUR,
	PUT_KLUBR_DONATEUR,
} from '@/core/services/endpoints';
import { KlubrDonateur, KlubrDonateurPost } from '@/core/models/klubr-donateur';

export const getDonateursByKlub = (
	klubIdOrSlug: string,
	page = 1,
	pageSize = 3,
	cookies?: string,
) /*: Promise<Array<any>>*/ =>
	HttpService.ExecuteRequest({
		endPoint: GET_KLUBR_DONATEURS(klubIdOrSlug, page, pageSize),
		cookies,
	});

export const getDonateur = (id: string, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: GET_KLUBR_DONATEUR(id),
		cookies,
	});

export const postDonateur = (payload: Partial<KlubrDonateurPost>, cookies?: string) => {
	return HttpService.ExecuteRequest({
		endPoint: POST_KLUBR_DONATEUR(),
		method: 'post',
		data: { data: payload },
		cookies,
	});
};
export const putDonateur = (id: string, payload: Partial<KlubrDonateurPost>, cookies?: string) => {
	return HttpService.ExecuteRequest({
		endPoint: PUT_KLUBR_DONATEUR(id),
		method: 'put',
		data: { data: payload },
		cookies,
	});
};
