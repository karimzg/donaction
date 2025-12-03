export default async function scrollIntoForm() {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			document.getElementById('PAYEMENT_FORM_ID')?.scrollIntoView({
				block: 'center',
				behavior: 'instant',
			});
			resolve(true);
		}, 0);
	});
}
