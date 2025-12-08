import React from 'react';
import { countriesData } from '@/partials/sponsorshipForm/logic/countries';

export type TypeConstructorType = BooleanConstructor | StringConstructor | NumberConstructor;
export type Arg0Type = boolean | string | number;
export type FeedbackParamsType = {
	cast: TypeConstructorType;
	attribute?: {
		name:
			| keyof ISponsorshipFormResult
			| keyof ILoginInfo
			| keyof IRegisterInfo
			| keyof IContactUsFormResult
			| keyof IProfileInfo
			| keyof IProfilePasswords
			| keyof INewClubInfo
			| 'previous'
			| 'submit';
		value: Arg0Type;
	};
	isValid: boolean;
	PAYEMENT_FEEDBACK?: boolean;
};

export interface FieldInterface extends React.InputHTMLAttributes<HTMLInputElement> {
	name:
		| keyof ISponsorshipFormResult
		| keyof ILoginInfo
		| keyof IRegisterInfo
		| keyof IContactUsFormResult
		| keyof IProfileInfo
		| keyof IProfilePasswords
		| keyof INewClubInfo
		| 'previous'
		| 'submit';
	label?: string | React.ReactElement;
	isRequired?: boolean;
	cast: TypeConstructorType;
	triggerValidation?: number;
	clearValues?: number;
	feedback?: (params: FeedbackParamsType) => void;
	validation?: (arg0: Arg0Type, fieldName: string) => string;
	parentClassName?: string;
	hideError?: boolean;
	forceError?: boolean;
	extraType?: 'textarea' | 'select' | 'spinner' | 'places';
	options?: Array<string>;
	countriesList?: typeof countriesData;
	isReadonly?: boolean;
}

type IAdditionalInfoValues = {
	[key in keyof IAdditionalInfo]: string | number | boolean;
};
type IAdditionalInfo = {
	estOrganisme: FieldInterface;
	montant: FieldInterface;
};

type IOrganizationInfoValues = {
	[key in keyof IOrganizationInfo]: string | number | boolean;
};
type IOrganizationInfo = {
	socialReason: FieldInterface;
	siren: FieldInterface;
	legalForm: FieldInterface;
	logo: FieldInterface;
};

type IUserInfoValues = {
	[key in keyof IUserInfo]: string | number | boolean;
};
type IUserInfo = {
	civility: FieldInterface;
	firstName: FieldInterface;
	lastName: FieldInterface;
	birthdate: FieldInterface;
	email: FieldInterface;
	tel: FieldInterface;
	streetNumber: FieldInterface;
	streetName: FieldInterface;
	postalCode: FieldInterface;
	city: FieldInterface;
	country: FieldInterface;
};
type IConnexionInfoValues = {
	[key in keyof IConnexionInfo]: string | number | boolean;
};
type ILoginInfoValues = {
	[key in keyof ILoginInfo]: string | number | boolean;
};
type IProfileInfoValues = {
	[key in keyof IProfileInfo]: string | number | boolean;
};
type IResetPasswordInfoValues = {
	[key in keyof IResetPasswordInfo]: string | number | boolean;
};
type IProfilePasswordsValues = {
	[key in keyof IProfilePasswords]: string | number | boolean;
};
type IConnexionInfo = {
	identifier: FieldInterface;
};
type ILoginInfo = {
	identifier: FieldInterface;
	password: FieldInterface;
};
type IProfileInfo = {
	identifier: FieldInterface;
	nom: FieldInterface;
};
type IResetPasswordInfo = {
	password: FieldInterface;
	passwordConfirmation: FieldInterface;
};

type IProfilePasswords = {
	currentPassword: FieldInterface;
	password: FieldInterface;
	passwordConfirmation: FieldInterface;
};
type IRegisterInfoValues = {
	[key in keyof IRegisterInfo]: string | number | boolean;
};
type IRegisterInfo = {
	email: FieldInterface;
	password: FieldInterface;
	confirmPassword: FieldInterface;
	acceptConditions: FieldInterface;
};
type ICheckboxesInfoValues = {
	[key in keyof ICheckboxesInfo]: string | number | boolean;
};
type ICheckboxesInfo = {
	displayName: FieldInterface;
	displayAmount?: FieldInterface;
	acceptConditions1: FieldInterface;
	acceptConditions2: FieldInterface;
};

type IContactUsCheckboxesInfoValues = {
	[key in keyof IContactUSCheckboxesInfo]: string | number | boolean;
};
type IContactUSCheckboxesInfo = {
	acceptConditions1: FieldInterface;
	acceptConditions2: FieldInterface;
};

type ISponsorshipFormResult = IAdditionalInfoValues &
	IUserInfoValues &
	ICheckboxesInfoValues &
	IOrganizationInfoValues;

type IContactUsFormResult = {
	email: string;
	object: string;
	msg: string;
};
type INewClubInfo = {
	nom?: FieldInterface;
	prenom?: FieldInterface;
	birthDate?: FieldInterface;
	tel?: FieldInterface;
	email?: FieldInterface;
	clubName?: FieldInterface;
	acronyme?: FieldInterface;
	adresse?: FieldInterface;
	legalStatus?: FieldInterface;
	sportType?: FieldInterface;
	acceptConditions1?: FieldInterface;
	acceptConditions2?: FieldInterface;
};

type INewClubFormResult = {
	nom: string;
	prenom: string;
	birthDate: string;
	tel: string;
	email: string;
	clubName: string;
	acronyme: string;
	adresse: string;
	legalStatus: string;
	sportType: string;
	acceptConditions1: boolean;
	acceptConditions2: boolean;
};

type IContactInfo = {
	email: FieldInterface;
	object: FieldInterface;
	msg: FieldInterface;
};

export type {
	IUserInfo,
	ILoginInfo,
	IProfileInfo,
	IContactInfo,
	INewClubInfo,
	IRegisterInfo,
	IConnexionInfo,
	IUserInfoValues,
	IAdditionalInfo,
	ICheckboxesInfo,
	ILoginInfoValues,
	IProfilePasswords,
	IOrganizationInfo,
	IResetPasswordInfo,
	IProfileInfoValues,
	INewClubFormResult,
	IRegisterInfoValues,
	IConnexionInfoValues,
	IContactUsFormResult,
	ICheckboxesInfoValues,
	IAdditionalInfoValues,
	ISponsorshipFormResult,
	IOrganizationInfoValues,
	IProfilePasswordsValues,
	IResetPasswordInfoValues,
	IContactUSCheckboxesInfo,
	IContactUsCheckboxesInfoValues,
};
