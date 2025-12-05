import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { TagsEnum } from '@/core/enum/tagsEnum';

export async function POST(req: NextRequest, res: NextResponse) {
	const message = {
		paths: '',
		tags: '',
	};
	const data: { paths?: Array<string>; tags?: Array<string> } = await req.json();
	if (
		data &&
		Array.isArray(data?.paths) &&
		data.paths.filter((_) => typeof _ === 'string' && _.length).length > 0
	) {
		data.paths.forEach((_) => {
			revalidatePath(_);
		});
		message.paths = `Revalidated cache for paths: ${data.paths.join(' , ')} .`;
	}
	if (
		data &&
		Array.isArray(data?.tags) &&
		data.tags.filter((_) => typeof _ === 'string' && _.length).length > 0
	) {
		data.tags.forEach((_) => {
			revalidateTag(_);
		});
		message.tags = `Revalidated cache for tags: ${data.tags.join(' , ')} .`;
	}

	return NextResponse.json(
		{
			message:
				message?.tags || message?.paths
					? message
					: 'None revalidated, The body should be of type: { paths?: Array<string>, tags?: Array<TagsEnum> }',
			TagsEnum: TagsEnum,
		},
		{ status: message ? 200 : 400 },
	);
}
