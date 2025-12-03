export const getFileNameFromContentDisposition = (contentDisposition: string): string => {
	const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
	let filename = 'file.pdf';
	if (matches != null && matches[1]) {
		filename = matches[1].replace(/['"]/g, '');
	}
	return filename;
};
