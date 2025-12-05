type IArg0 = string | number | boolean;

export const stringRexExp = /^(?![\w\s,.\-/éàçèë]+$)[\s\S]+$/;
export const stringWithoutNumbersRexExp = /[^A-Za-z\s'-]/;

export const emailRexExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sirenRexExp = /^\d{9}$/;

const validateString = (arg0: IArg0, fieldName: string, regExp: RegExp) => {
	const value = String(arg0).trim();
	if (regExp.test(value)) return `${fieldName} non valide`;
	return '';
};

const validateDate = (arg0: IArg0, fieldName: string) => {
	const value = new Date(String(arg0));
	if (String(arg0).trim().length === 0) return 'Ce champ est obligatoire';
	if (isNaN(Number(value))) return `${fieldName} non valide`;
	return '';
};

const validateDateMajor = (arg0: IArg0, fieldName: string) => {
	const birthdate = new Date(String(arg0));
	const today = new Date();
	let age = today.getFullYear() - birthdate.getFullYear();
	const monthDifference = today.getMonth() - birthdate.getMonth();
	if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
		age--;
	}
	if (age < 18) {
		return 'Vous devez être majeure';
	}
	if (age > 110) {
		return 'Date non valide';
	}
	return '';
};

const validateEmail = (arg0: IArg0, fieldName: string) => {
	const value = String(arg0).trim();
	if (!emailRexExp.test(value)) return `${fieldName} non valide`;
	return '';
};

const validateRequired = (arg0: IArg0, fieldName: string) => {
	const value = String(arg0).trim();
	if (value.length < 2) return 'Ce champ est obligatoire';
	return '';
};

const validateSelection = (arg0: IArg0, fieldName: string, optionsList: Array<IArg0>) => {
	const value = String(arg0).trim();
	if (!optionsList.includes(value)) return 'Veuillez sélectionner une option dans la liste';
	return '';
};

const validatePassword = (arg0: IArg0, fieldName: string) => {
	const value = String(arg0).trim();
	if (!/\d/.test(value)) return 'Le mot de passe doit contenir au moins un chiffre';
	if (!/[^a-zA-Z0-9]/.test(value))
		return 'Le mot de passe doit contenir au moins un caractère spécial';
	if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
	return '';
};
const validateSame = (arg0: IArg0, fieldName: string, toBeCompared: string) => {
	const value1 = String(arg0).trim();
	const value2 = String(toBeCompared).trim();
	if (value1 && value2 && value1 !== value2) return 'Les mots de passe ne correspondent pas';
	return '';
};

const validateTrue = (arg0: IArg0, fieldName: string) => {
	const value = Boolean(arg0);
	if (!value) return 'Ce champ est obligatoire';
	return '';
};

const validateSiren = (arg0: IArg0, fieldName: string) => {
	const value = Number(arg0);
	if (isNaN(value) || String(arg0).includes('e')) return `${fieldName} non valide`;
	if (!sirenRexExp.test(value.toString()))
		return `Le numéro ${fieldName} doit contenir exactement 9 chiffres`;
	return '';
};

const validateAmount = (arg0: IArg0, fieldName: string) => {
	const value = Number(arg0);
	if (value === 0 || isNaN(value)) return 'Ce champ est obligatoire';
	if (isNaN(value) || String(arg0).includes('e')) return `${fieldName} non valide`;
	if (Number(value) < 10) return 'Le montant minimum est de 10 €';
	return '';
};

export {
	validateDate,
	validateTrue,
	validateSame,
	validateEmail,
	validateSiren,
	validateAmount,
	validateString,
	validatePassword,
	validateRequired,
	validateSelection,
	validateDateMajor,
};
