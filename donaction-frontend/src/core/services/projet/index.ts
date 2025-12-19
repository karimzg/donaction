import HttpService from '@/core/services';
import {
	GET_ALL_PROJETS_SLUGS_LIST,
	GET_ALL_PROJETS_SLUGS_WITH_KLUBR_SLUG_LIST,
	GET_KLUBR_PROJETS,
	GET_PROJET_BY_SLUG,
	GET_PROJETS,
} from '@/core/services/endpoints';
import { Pagination } from '@/core/models/misc';
import { KlubProjet } from '@/core/models/klub-project';
import { TagsEnum } from '@/core/enum/tagsEnum';

export const getProjetDetail = (slug: string, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: GET_PROJET_BY_SLUG(slug),
		tags: [TagsEnum.PROJECTS, TagsEnum.GetProjectDetail],
		cookies,
	});

export const getProjetsByKlub = (
	uuid: string,
	page = 1,
	pageSize = 3,
	exceptId?: string,
	cookies?: string,
): Promise<{ data: Array<KlubProjet>; pagination: Pagination }> =>
	HttpService.ExecuteRequest({
		endPoint: GET_KLUBR_PROJETS(uuid, page, pageSize, exceptId),
		tags: [TagsEnum.PROJECTS, TagsEnum.GetProjectByClub],
		cookies,
	});

export const getAllProjetsSlugs = (
	cookies?: string,
): Promise<Array<{ slug: string; updatedAt: string }>> =>
	HttpService.ExecuteRequest({
		endPoint: GET_ALL_PROJETS_SLUGS_LIST,
		tags: [TagsEnum.PROJECTS, TagsEnum.GetAllProjectsSlugs],
		cookies,
	}).then((res) => {
		return res.data.map((item: any) => ({ slug: item.slug, updatedAt: item.updatedAt }));
	});

export const getAllProjetsSlugsWithClubSlug = (
	cookies?: string,
	useDefaultHttp = false,
): Promise<Array<{ slug: string; updatedAt: string; klubSlug: string }>> =>
	HttpService.ExecuteRequest({
		endPoint: GET_ALL_PROJETS_SLUGS_WITH_KLUBR_SLUG_LIST,
		tags: [TagsEnum.PROJECTS, TagsEnum.GetAllProjectsSlugsWithClubSlug],
		cookies,
		useDefaultHttp,
	}).then((res) => {
		return res.data.map((item: any) => ({
			slug: item.slug,
			updatedAt: item.updatedAt,
			klubSlug: item.klubr?.slug,
		}));
	});

export const getProjets = (
	page = 1,
	pageSize = 3,
	featured = false,
	isPreview = false,
	cookies?: string,
): Promise<{ data: Array<KlubProjet>; meta: { pagination: Pagination } }> =>
	HttpService.ExecuteRequest({
		endPoint: GET_PROJETS(page, pageSize, featured, isPreview),
		tags: [TagsEnum.PROJECTS, TagsEnum.GetProjects],
		cookies,
	});
