import React from 'react';

const FormBreadcrumb = ({ index, list }: { index: number; list: Array<string | null> }) => {
	return (
		<div className='formBreadcrumbContainer self-start flex flex-wrap items-center justify-center gap-1 font-semibold text-sm text-gray-300 mb-2'>
			{list.map(
				(_, _index) =>
					_ && (
						<p key={_index} className={_index === index ? 'text-black' : ''}>
							{`${_index > 0 ? '>' : ''}`} {_}
						</p>
					),
			)}
		</div>
	);
};

export default FormBreadcrumb;
