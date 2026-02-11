import { RichTextBlockEl } from '@/components/RichTextBlock';

/**
 * Recursively extracts plain text from a Strapi rich-text blocks array.
 * Used primarily for JSON-LD structured data where HTML is not allowed.
 */
const richTextToPlainText = (data: Array<RichTextBlockEl>): string => {
	let res = '';
	data.forEach((_) => {
		if (_.type === 'text') {
			res += ' ' + _.text;
			return;
		}
		res += ' ' + richTextToPlainText(_.children);
	});
	return res;
};

export default richTextToPlainText;
