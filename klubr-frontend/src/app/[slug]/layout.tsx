import React from 'react';

async function ClubLayout(props: { children: React.ReactNode }) {
	return <main className='flex flex-col items-center'>{props.children}</main>;
}

export default ClubLayout;
