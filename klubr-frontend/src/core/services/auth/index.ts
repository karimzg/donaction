import HttpService from '@/core/services';
import {
	CHANGE_PASSWORD,
	CHECK_USER_EXISTENCE,
	FORGOT_PASSWORD,
	GET_AVATARS,
	LOGIN,
	ME,
	REGISTER,
	RESET_PASSWORD,
	UPDATE,
	UPDATE_USER_IMG,
	UPLOAD_COMPANY_LOGO,
} from '@/core/services/endpoints';
import { IProfilePasswordsValues } from '@/partials/sponsorshipForm/logic/entities';
import { UserDetail } from '@/core/models/user';

export const me = (cookies?: string): Promise<UserDetail> =>
	HttpService.ExecuteRequest({
		endPoint: ME,
		cookies,
	});

export const login = (data: { identifier: string; password: string }, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: LOGIN,
		method: 'post',
		data,
		cookies,
	});

export const postForgotPassword = (data: { email: string }, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: FORGOT_PASSWORD,
		method: 'post',
		data,
		cookies,
	});

export const postResetPassword = (
	data: {
		code: string;
		password: string;
		passwordConfirmation: string;
	},
	cookies?: string,
) =>
	HttpService.ExecuteRequest({
		endPoint: RESET_PASSWORD,
		method: 'post',
		data,
		cookies,
	});

export const changePassword = (data: IProfilePasswordsValues, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: CHANGE_PASSWORD,
		method: 'post',
		data,
		cookies,
	});

export const register = (data: { email: string; password: string }, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: REGISTER,
		method: 'post',
		data,
		cookies,
	});

export const update = (
	id: string,
	data: Record<string, string | number | boolean>,
	cookies?: string,
) =>
	HttpService.ExecuteRequest({
		endPoint: UPDATE(id),
		method: 'put',
		data,
		cookies,
	});

export const updateUserImg = (uuid: string, data: FormData, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: UPDATE_USER_IMG(uuid),
		method: 'post',
		data,
		isFormData: true,
		cookies,
	});

export const uploadCompanyLogo = (uuid: string, data: FormData, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: UPLOAD_COMPANY_LOGO(uuid),
		method: 'post',
		data,
		isFormData: true,
		cookies,
	});

export const checkUserExistence = (email: string, cookies?: string) =>
	HttpService.ExecuteRequest({
		endPoint: CHECK_USER_EXISTENCE(email),
		cookies,
	});

export const getAvatars = (
	type: 'women' | 'men',
	page?: number,
	pageSize?: number,
	cookies?: string,
) =>
	HttpService.ExecuteRequest({
		endPoint: GET_AVATARS(type, page, pageSize),
		cookies,
	});
