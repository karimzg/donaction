import HttpService from '@/core/services';
import {
	CREATE_KLUBR_BY_MEMBER,
	CREATE_KLUBR_MEMBER,
	GET_ALL_CLUBS,
	GET_ALL_SLUGS_LIST,
	GET_CLUB_BY_SLUG,
	GET_CLUB_BY_SLUG_PREVIEW,
	GET_CLUB_BY_UUID,
	GET_KLUBR_HOUSE,
	GET_KLUBR_MEMBER,
	GET_SLUG_LIST,
} from '@/core/services/endpoints';
import { Klub, NavSlugs } from '@/core/models/club';
import { Pagination } from '@/core/models/misc';
import { TagsEnum } from '@/core/enum/tagsEnum';

export const getClubsSlugs = (pageSize = 10, cookies?: string): Promise<Array<NavSlugs>> =>
	HttpService.ExecuteRequest({
		endPoint: GET_SLUG_LIST(pageSize),
		revalidate: 5,
		tags: [TagsEnum.Club_ClubHouse_Slugs, TagsEnum.ClubsSlugs],
		cookies,
	}).then((res) => {
		return res.data.map((item: any) => ({ slug: item.slug, label: item.denomination }));
	});

export const getAllClubsSlugs = (
	cookies?: string,
	useDefaultHttp = false,
): Promise<Array<{ slug: string; updatedAt: string }>> =>
	HttpService.ExecuteRequest({
		endPoint: GET_ALL_SLUGS_LIST,
		revalidate: 5,
		tags: [TagsEnum.Club_ClubHouse_Slugs, TagsEnum.AllClubsSlugs],
		cookies,
		useDefaultHttp,
	}).then((res) => {
		return res.data.map((item: any) => ({ slug: item.slug, updatedAt: item.updatedAt }));
	});

export const getClubDetailBySlug = (slug: string, isPreview?: boolean, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: isPreview ? GET_CLUB_BY_SLUG_PREVIEW(slug) : GET_CLUB_BY_SLUG(slug),
		tags: isPreview ? [] : [TagsEnum.Club_ClubHouse_Slugs, TagsEnum.ClubsDetailBySlug],
		noCache: isPreview,
		cookies,
	});

export const getClubByUuid = (uuid: string, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: GET_CLUB_BY_UUID(uuid),
		tags: [],
		noCache: true,
		cookies,
	});

export const getAllClubs = (
	page = 1,
	pageSize = 4,
	withNbProjects = false,
	featured = false,
	isPreview = false,
	cookies?: string,
): Promise<{ data: Array<Klub>; meta: { pagination: Pagination } }> =>
	HttpService.ExecuteRequest({
		endPoint: GET_ALL_CLUBS(page, pageSize, withNbProjects, featured, isPreview),
		tags: [TagsEnum.Club_ClubHouse_Slugs, TagsEnum.AllClubs],
		noCache: isPreview,
		cookies,
	});

export const getClubHouse = (uuid: string, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: GET_KLUBR_HOUSE(uuid),
		tags: [TagsEnum.Club_ClubHouse_Slugs, TagsEnum.ClubHouse],
		cookies,
	});

export const getKlubrMember = (uuid: string, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: GET_KLUBR_MEMBER(uuid),
		method: 'get',
		cookies,
	});

export const createUpdateKlubrMember = (
	data: Record<string, any>,
	uuid?: string,
	cookies?: string,
) =>
	HttpService.ExecuteRequest({
		endPoint: CREATE_KLUBR_MEMBER(uuid),
		method: uuid ? 'put' : 'post',
		data: {
			data,
		},
		cookies,
	});
export const createKlubrByMember = (data: Record<string, any>, uuid: string, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: CREATE_KLUBR_BY_MEMBER(uuid),
		method: 'post',
		data: {
			data,
		},
		cookies,
	});
