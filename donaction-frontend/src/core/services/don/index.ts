import HttpService from '@/core/services';
import {
	CREATE_KLUB_DON_PAYMENT,
	GET_KLUBR_DON,
	GET_KLUBR_DON_RELAUNCH,
	GET_KLUBR_DONS,
	GET_KLUBR_PROJECT_DONS,
	GET_MY_DONATIONS,
	GET_MY_LAST_DONATION,
	POST_KLUBR_DON,
	PUT_KLUBR_DON,
	UPDATE_KLUB_DON_PAYMENT,
} from '@/core/services/endpoints';
import { SponsorItem } from '@/partials/clubPage/ourSponsors';
import { KlubDonPost } from '@/core/models/klub-don';
import { Pagination } from '@/core/models/misc';
import { IDon } from '@/core/types';
import { TagsEnum } from '@/core/enum/tagsEnum';

export const getDonsByKlubOrProjet = (
	uuid: string,
	byKlubOrProject: 'byKlub' | 'byProject' = 'byKlub',
	page = 1,
	pageSize = 3,
	cookies?: string,
): Promise<{ data: Array<SponsorItem>; pagination: Pagination }> => {
	return new Promise<{ data: Array<SponsorItem>; pagination: Pagination }>((resolve, reject) => {
		HttpService.ExecuteRequest({
			endPoint:
				byKlubOrProject === 'byKlub'
					? GET_KLUBR_DONS(uuid, page, pageSize)
					: GET_KLUBR_PROJECT_DONS(uuid, page, pageSize),
			tags: [TagsEnum.DONATIONS, TagsEnum.DonsByClubOrProject],
			cookies,
		}).then((res) => {
			const dataReturned = res.data.map((item: any) => {
				let itemReturned: SponsorItem = {
					amount: item.montant,
					date: item.datePaiment,
					company: item.klubDonateur?.raisonSocial,
					username: item.klubDonateur
						? `${item.klubDonateur?.prenom} ${item.klubDonateur?.nom || ''}`
						: 'Anonyme',
					picture:
						item.klubDonateur?.donateurType === 'Particulier'
							? item.klubDonateur?.logo?.url || item.klubDonateur?.avatar?.url
							: item.klubDonateur?.logo?.url,
					projet: item.klub_projet,
					civility: item.klubDonateur?.civilite,
				};
				return itemReturned;
			});
			const resReturned = {
				...res,
				data: dataReturned,
			};
			resolve(resReturned);
		});
	});
};

export const getDon = (uuid: string, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: GET_KLUBR_DON(uuid),
		tags: [TagsEnum.DONATIONS, TagsEnum.GetDonation],
		cookies,
	});
export const getRelaunchDon = (uuid: string, cookies?: string, relaunchCode?: number) =>
	HttpService.ExecuteRequest({
		endPoint: GET_KLUBR_DON_RELAUNCH(uuid, relaunchCode),
		tags: [TagsEnum.DONATIONS, TagsEnum.GetDonation],
		cookies,
	});

export const postDon = (payload: Partial<KlubDonPost>, cookies?: string) => {
	return HttpService.ExecuteRequest({
		endPoint: POST_KLUBR_DON(),
		method: 'post',
		data: { data: payload },
		cookies,
	});
};
export const putDon = (uuid: string, payload: Partial<KlubDonPost>, cookies?: string) => {
	return HttpService.ExecuteRequest({
		endPoint: PUT_KLUBR_DON(uuid),
		method: 'put',
		data: { data: payload },
		cookies,
	});
};

export const getMyLastDonation = (cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: GET_MY_LAST_DONATION,
		tags: [TagsEnum.DONATIONS, TagsEnum.GetMyLastDonation],
		cookies,
	});

export const getMyDonations = (
	page = 1,
	pageSize = 10,
	cookies?: string,
): Promise<{ data: Array<IDon>; meta: { pagination: Pagination } }> =>
	HttpService.ExecuteRequest({
		endPoint: GET_MY_DONATIONS(page, pageSize),
		tags: [TagsEnum.DONATIONS, TagsEnum.GetMyDonations],
		cookies,
	});

export const createPaymentIntent = (price: number) =>
	fetch('/api/create-payment-intent', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ price }),
	})
		.then((res) => res.json())
		.catch((err) => err);

export const createKlubDonPayment = (data: any, cookies?: string) =>
	HttpService.ExecuteRequest({
		method: 'post',
		endPoint: CREATE_KLUB_DON_PAYMENT,
		data: { data },
		cookies,
	});

export const updateKlubDonPayment = (data: any, id: number, cookies?: string) =>
	HttpService.ExecuteRequest({
		method: 'put',
		endPoint: UPDATE_KLUB_DON_PAYMENT(id),
		data: { data },
		cookies,
	});
