export default function srcLoader(src: string, transformations: string) {
	const providerURL = 'https://ik.imagekit.io/donaction/';
	if (src?.startsWith(providerURL)) {
		src = src.replace(providerURL, '');
		return `${providerURL}${transformations}/${src}`;
	}
	return `${src}`;
}
