import Link from 'next/link';
import KlubrLogo from '@/components/KlubrLogo';
import React from 'react';

const Footer = ({
                    bg1,
                    bg2,
                    textColor = '#FFFFFF',
                }: {
    bg1: string;
    bg2: string;
    textColor?: string;
}) => {
    const currentYear = new Date().getFullYear();

    return (
        <>
            <footer className={`z-10 relative  mt-[110px] w-full`}>
                <div
                    className={
                        'minMaxWidth m-auto flex items-center max-[768px]:justify-evenly max-[768px]:gap-4 max-[768px]:pl-8 max-[768px]:pr-16'
                    }
                >
                    <div
                        className={`w-full min-h-[100%] absolute left-0 -z-20`}
                        style={{
                            clipPath: 'polygon(0 100%, 100% 100%, 100% 123px, 36% 0, 0 123px)',
                            backgroundColor: bg1,
                            bottom: 'calc(4rem + 1px)',
                        }}
                    />
                    <div
                        className={`w-full min-h-[100%] absolute bottom-16 left-0 -z-20`}
                        style={{
                            clipPath: 'polygon(0 100%, 100% 100%, 100% 123px, 36% 0, 0 123px)',
                            backgroundColor: '#FFF',
                        }}
                    />
                    <div
                        className={`w-full min-h-[100%] absolute bottom-0 left-0 -z-20`}
                        style={{
                            clipPath: 'polygon(0 100%, 100% 100%, 100% 123px, 36% 0, 0 123px)',
                            backgroundColor: bg1,
                        }}
                    />
                    <div
                        className='flex items-center z-10 w-full h-full text-white justify-evenly max-[768px]:flex-wrap max-[768px]:gap-8 max-[768px]:items-start  mt-28 mb-16'>
                        <div className={'flex justify-center max-[768px]:w-full'}>
                            <KlubrLogo
                                border={'#000000'}
                                dotBorder={'#000000'}
                                dotBg={'#FFFFFF'}
                                bg={'#FFFFFF'}
                                context={'footer'}
                            ></KlubrLogo>
                        </div>
                        <div
                            className='flex flex-col items-start justify-center mx-8 max-[768px]:min-w-[180px]'
                            style={{color: textColor}}
                        >
                            <Link href={'/'}> Acceuil </Link>
                            {process.env.NEXT_PUBLIC_ENVIRONMENT !== 'prod' && (
                                <>
                                    <Link href={'/clubs'}> Nos Klubs </Link>
                                    <Link href={'/projets'}> Nos projets </Link>
                                </>
                            )}
                            <Link href={'/mecenat'}> Le mécénat </Link>
                            <Link href={'/conditions-generales-d-utilisation'}>
                                {' '}
                                Conditions générales d'utilisation{' '}
                            </Link>
                            <Link href={'/politique-de-confidentialite'}> Politique de confidentialité </Link>
                            <Link href={'/contact'}> Contact </Link>
                        </div>
                        <div
                            className='flex flex-col items-start justify-center mx-8 max-[768px]:min-w-[180px]'
                            style={{color: textColor}}
                        >
                            <p className='font-semibold'>Nos coordonnées</p>
                            <span>FONDS KLUBR</span>
                            <span>10 clos du Golf du Sart</span>
                            <span>59491 VILLENEUVE D’ASCQ</span>
                            <span>hello&#64;donaction.fr</span>
                            {/*<span>+33 X XX XX XX XX</span>*/}
                        </div>
                    </div>
                </div>
                <div className='flex items-center justify-center text-white gap-2 pb-4'>
                    Copyright © {currentYear} - powered by
                    <Link href={'https://nakaa.fr/'} target={'_blank'}><img src='/images/icons/beGoodee.svg'
                                                                               alt='Nakaa logo'
                                                                               className='mt-1'/></Link>
                </div>
            </footer>
        </>
    );
};

export default Footer;
