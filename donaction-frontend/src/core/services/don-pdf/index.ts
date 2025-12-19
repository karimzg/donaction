import HttpService from '@/core/services';
import { GET_KLUBR_DON_ATTESTATION_PDF, GET_KLUBR_DON_RECU_PDF } from '@/core/services/endpoints';

export const getDonAttestationPdf = (
	uuid: string,
	cookies?: string,
): Promise<{ data: Blob; contentDisposition: string }> =>
	HttpService.ExecuteRequest({
		endPoint: GET_KLUBR_DON_ATTESTATION_PDF(uuid),
		responseType: 'blob',
		cookies,
	});

export const getDonRecuPdf = (
	uuid: string,
	cookies?: string,
): Promise<{ data: Blob; contentDisposition: string }> =>
	HttpService.ExecuteRequest({
		endPoint: GET_KLUBR_DON_RECU_PDF(uuid),
		responseType: 'blob',
		cookies,
	});
