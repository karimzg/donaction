import path from 'path';
import { MavenFonts } from '../funcs/installFonts';
import { rgb } from 'pdf-lib';
import TextDrawer from '../entities/TextDrawer';
import TextBlockDrawer from '../entities/TextBlockDrawer';
import RectangleDrawer from '../entities/RectangleDrawer';
import ImageDrawer from '../entities/ImageDrawer';
import { PageElement } from '../entities/_types';
import { InvoiceEntity, InvoiceLineEntity } from '../../../_types';

const logoKlubr = path.join(
    __dirname,
    '../../../../../public/assets/icons/logo.png',
);
const bgKlubr = path.join(
    __dirname,
    '../../../../../public/assets/icons/backgroundKlubr.svg',
);

interface IGetInvoiceClubPagesData {
    height: number;
    width: number;
    HPadding: number;
    VPadding: number;
    fonts: MavenFonts;
    data: InvoiceEntity;
}

export default async function getInvoiceClubPagesData({
    height,
    width,
    HPadding,
    VPadding,
    fonts,
    data,
}: IGetInvoiceClubPagesData): Promise<Array<Array<PageElement>>> {
    // TODO change this to dateBankTransfer
    // const date = new Date(
    //     data?.dateBankTransfer || data?.dateInvoice || data?.updatedAt,
    // );
    //
    // const day = String(date.getDate()).padStart(2, '0');
    // const month = String(date.getMonth() + 1).padStart(2, '0');
    // const year = date.getFullYear();
    //
    // const hours = String(date.getHours()).padStart(2, '0');
    // const minutes = String(date.getMinutes()).padStart(2, '0');
    // const seconds = String(date.getSeconds()).padStart(2, '0');

    let reachedY = height - VPadding - 285;
    let y = -50;
    let pageIndex = 0;

    const pageNumber = (current: number, total: number) => [
        new TextDrawer({
            size: 12,
            x: width / 2 - 20,
            y: VPadding,
            text: `${current}/${total}`,
            font: fonts.mvnSemiBoldPdfFont,
        }),
    ];
    const creditHeader = (extra?: number) => [
        new RectangleDrawer({
            x: HPadding,
            y: reachedY + 5 - y + (extra || 0),
            height: 35,
            width: width - HPadding * 2,
            color: rgb(247 / 255, 247 / 255, 247 / 255),
            opacity: 0.8,
        }),
        new TextDrawer({
            size: 14,
            x: HPadding + 20,
            y: reachedY + 18 - y + (extra || 0),
            text: '',
            font: fonts.mvnSemiBoldPdfFont,
        }),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    size: 14,
                    text: 'Montant',
                    font: fonts.mvnSemiBoldPdfFont,
                }),
            ],
            {
                x: width - HPadding - 20,
                y: reachedY + 18 - y + (extra || 0),
                isRtl: true,
            },
        ),
        new TextDrawer({
            size: 16,
            x: HPadding,
            y: reachedY - y + 50 + (extra || 0),
            text: 'Dons à redistribuer au Klub',
            font: fonts.mvnBoldPdfFont,
        }),
    ];
    const debitHeader = (extra?: number) => [
        new RectangleDrawer({
            x: HPadding,
            y: reachedY + 20 - y + (extra || 0),
            height: 35,
            width: width - HPadding * 2,
            color: rgb(247 / 255, 247 / 255, 247 / 255),
            opacity: 0.8,
        }),
        new TextDrawer({
            size: 14,
            x: HPadding + 20,
            y: reachedY + 33 - y + (extra || 0),
            text: 'Reférence / Description',
            font: fonts.mvnSemiBoldPdfFont,
        }),
        // new TextDrawer({
        //   size: 14,
        //   x: HPadding + 250,
        //   y: reachedY + 33 - y + (extra || 0),
        //   text: "Nombre",
        //   font: fonts.mvnSemiBoldPdfFont,
        // }),
        // new TextDrawer({
        //   size: 14,
        //   x: HPadding + 370,
        //   y: reachedY + 33 - y + (extra || 0),
        //   text: "P.Unitaire",
        //   font: fonts.mvnSemiBoldPdfFont,
        // }),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    size: 14,
                    text: 'Montant',
                    font: fonts.mvnSemiBoldPdfFont,
                }),
            ],
            {
                x: width - HPadding - 20,
                y: reachedY + 33 - y + (extra || 0),
                isRtl: true,
            },
        ),
        new TextDrawer({
            size: 16,
            x: HPadding,
            y: reachedY + 18 - y + 50 + (extra || 0),
            text: 'Frais prélevés',
            font: fonts.mvnBoldPdfFont,
        }),
    ];

    const creditDebitList = [[...creditHeader()]];

    let formattedList = formatList(data?.invoice_lines);

    formattedList.credit.forEach((item, index) => {
        y += !!item?.title || !!item?.totalTitle ? 35 : 20;

        if (height - (height - reachedY + y) < 50) {
            pageIndex += 1;
            y = -50;
            reachedY = height - VPadding - 245;
            creditDebitList.push([...creditHeader(35)]);
        }

        const toBeAdded = () => {
            switch (true) {
                case !!item.affectedTitle:
                    y += 5;
                    return [
                        new RectangleDrawer({
                            x: HPadding,
                            y: reachedY + 30 - y,
                            height: 2,
                            width: width - HPadding * 2,
                            color: rgb(0, 0, 0),
                            opacity: 0.4,
                        }),
                        new RectangleDrawer({
                            x: HPadding,
                            y: reachedY + 8 - y,
                            height: 20,
                            width: width - HPadding * 2,
                            color: rgb(247 / 255, 247 / 255, 247 / 255),
                            opacity: 0.9,
                        }),
                        new TextDrawer({
                            size: 12,
                            x: HPadding + 20,
                            y: reachedY + 14 - y,
                            text: item.affectedTitle,
                            font: fonts.mvnSemiBoldPdfFont,
                        }),
                    ];
                case !!item?.totalTitle:
                    return [
                        new RectangleDrawer({
                            x: HPadding,
                            y: reachedY + 45 - y,
                            height: 0.5,
                            width: width - HPadding * 2,
                            color: rgb(0, 0, 0),
                            opacity: 0.28,
                        }),
                        new TextDrawer({
                            size: 12,
                            x: HPadding + 380,
                            y: reachedY + 25 - y,
                            text: item.totalTitle,
                            font: fonts.mvnSemiBoldPdfFont,
                        }),
                        new TextBlockDrawer(
                            [
                                new TextDrawer({
                                    size: 12,
                                    text: `${item?.amount}€`,
                                    font: fonts.mvnSemiBoldPdfFont,
                                }),
                            ],
                            {
                                x: width - HPadding - 20,
                                y: reachedY + 25 - y,
                                isRtl: true,
                            },
                        ),
                    ];
                case !!item?.title:
                    return [
                        new RectangleDrawer({
                            x: HPadding,
                            y: reachedY + 40 - y,
                            height: 0.5,
                            width: width - HPadding * 2,
                            color: rgb(0, 0, 0),
                            opacity: 0.28,
                        }),
                        new TextDrawer({
                            size: 12,
                            x: HPadding + 20,
                            y: reachedY + 20 - y,
                            text: item.title || '',
                            font: fonts.mvnSemiBoldPdfFont,
                        }),
                        new TextBlockDrawer(
                            [
                                new TextDrawer({
                                    size: 12,
                                    text: `${item?.amount}€`,
                                    font: fonts.mvnSemiBoldPdfFont,
                                }),
                            ],
                            {
                                x: width - HPadding - 20,
                                y: reachedY - y + 20,
                                isRtl: true,
                            },
                        ),
                    ];
                default:
                    return [
                        new TextDrawer({
                            size: 12,
                            x: HPadding + 20 + 20,
                            y: reachedY + 20 - y,
                            text: item?.date,
                            font: fonts.mvnRegularPdfFont,
                        }),
                        new TextDrawer({
                            size: 12,
                            x: HPadding + 20 + 100,
                            y: reachedY + 20 - y,
                            text: item.name,
                            font: fonts.mvnRegularPdfFont,
                        }),
                        new TextBlockDrawer(
                            [
                                new TextDrawer({
                                    size: 12,
                                    text: `${item.amount}€`,
                                    font: fonts.mvnRegularPdfFont,
                                }),
                            ],
                            {
                                x: width - HPadding - 20,
                                y: reachedY + 20 - y,
                                isRtl: true,
                            },
                        ),
                    ];
            }
        };

        creditDebitList[pageIndex].push(...toBeAdded());
    });

    formattedList.debit.forEach((item, index) => {
        y += 35;

        if (height - (height - reachedY + y) < 50) {
            pageIndex += 1;
            y = -50;
            reachedY = height - VPadding - 225;
            creditDebitList.push([...debitHeader()]);
        } else if (index === 0) {
            creditDebitList[pageIndex].push(...debitHeader(-45));
            y += 45;
        }

        const toBeAdded = () => {
            switch (true) {
                case !!item?.totalTitle:
                    return [
                        new RectangleDrawer({
                            x: HPadding,
                            y: reachedY + 20 - y,
                            height: 0.5,
                            width: width - HPadding * 2,
                            color: rgb(0, 0, 0),
                            opacity: 0.28,
                        }),
                        new TextDrawer({
                            size: 12,
                            x: HPadding + 380,
                            y: reachedY - y,
                            text: item.totalTitle,
                            font: fonts.mvnSemiBoldPdfFont,
                        }),
                        new TextBlockDrawer(
                            [
                                new TextDrawer({
                                    size: 12,
                                    text: `-${item?.amount}€`,
                                    font: fonts.mvnSemiBoldPdfFont,
                                }),
                            ],
                            {
                                x: width - HPadding - 20,
                                y: reachedY - y,
                                isRtl: true,
                            },
                        ),
                    ];
                case !!item?.title:
                    return [
                        new RectangleDrawer({
                            x: HPadding,
                            y: reachedY + 20 - y,
                            height: 0.5,
                            width: width - HPadding * 2,
                            color: rgb(0, 0, 0),
                            opacity: 0.28,
                        }),
                        new TextDrawer({
                            size: 12,
                            x: HPadding + 20,
                            y: reachedY - y,
                            text: item.ref || '',
                            font: fonts.mvnSemiBoldPdfFont,
                        }),
                        new TextDrawer({
                            size: 10,
                            x: HPadding + 50,
                            y: reachedY - y,
                            text: item.title || '',
                            font: fonts.mvnRegularPdfFont,
                        }),
                        new TextDrawer({
                            size: 12,
                            x: HPadding + 250,
                            y: reachedY - y,
                            text: item.number || '',
                            font: fonts.mvnSemiBoldPdfFont,
                        }),
                        new TextDrawer({
                            size: 12,
                            x: HPadding + 370,
                            y: reachedY - y,
                            text:
                                !!item.unitPrice && +item.unitPrice > 0
                                    ? `${item?.unitPrice}€`
                                    : '',
                            font: fonts.mvnSemiBoldPdfFont,
                        }),
                        new TextBlockDrawer(
                            [
                                new TextDrawer({
                                    size: 12,
                                    text: `-${item?.amount}€`,
                                    font: fonts.mvnSemiBoldPdfFont,
                                }),
                            ],
                            {
                                x: width - HPadding - 20,
                                y: reachedY - y,
                                isRtl: true,
                            },
                        ),
                    ];
                default:
                    return [];
            }
        };

        creditDebitList[pageIndex].push(...toBeAdded());
    });

    const minifiedHeader = (y: number) => [
        new RectangleDrawer({
            x: 0,
            y: height - y,
            height: y,
            width: width,
            color: rgb(247 / 255, 247 / 255, 247 / 255),
            opacity: 0.8,
        }),
        new ImageDrawer({
            url: logoKlubr,
            x: HPadding,
            y: height - VPadding - 40,
            width: 102,
            height: 28,
        }),
        new ImageDrawer({
            url: bgKlubr,
            isSvg: true,
            svgWidth: 344,
            svgHeight: 96,
            x: 297.64 - 344 / 2,
            y: 170,
            width: 344,
            height: 96,
        }),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: "Facture d'avoir",
                    size: 18,
                    font: fonts.mvnBoldPdfFont,
                }),
                new TextDrawer({
                    text: data?.invoiceNumber,
                    size: 14,
                    font: fonts.mvnSemiBoldPdfFont,
                }),
                new TextDrawer({
                    text: String(data?.dateInvoice),
                    size: 14,
                    font: fonts.mvnMediumPdfFont,
                }),
            ],
            {
                x: width - HPadding,
                y: height - VPadding - 15,
                isRtl: true,
            },
        ),
    ];

    const footer = [
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Plateforme de collecte',
                    size: 14,
                    font: fonts.mvnSemiBoldPdfFont,
                }),
                new TextDrawer({
                    text: 'FONDS KLUBR',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
                new TextDrawer({
                    text: '10 clos du Golf du Sart',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
                new TextDrawer({
                    text: '59491 VILLENEUVE D’ASCQ',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
                new TextDrawer({
                    text: 'France',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
            ],
            {
                x: HPadding,
                y: height - VPadding - 730,
                isRtl: false,
                extraLineHeight: 3,
            },
        ),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Contact',
                    size: 14,
                    font: fonts.mvnSemiBoldPdfFont,
                }),
                new TextDrawer({
                    text: 'hello@klubr.fr',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
                new TextDrawer({
                    text: '+33 6 71 54 22 13',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
                new TextDrawer({
                    text: 'www.klubr.fr',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
            ],
            {
                x: width - HPadding,
                y: height - VPadding - 730,
                isRtl: true,
                extraLineHeight: 3,
            },
        ),
    ];

    let pages = [
        [
            ...minifiedHeader(169),
            new RectangleDrawer({
                x: HPadding,
                y: height - VPadding - 70,
                height: 0.5,
                width: width - HPadding * 2,
                color: rgb(0, 0, 0),
                opacity: 0.28,
            }),
            // TODO: uncomment when DatePayment available
            // new TextBlockDrawer(
            //   [
            //     new TextDrawer({
            //       text: "Payé",
            //       size: 14,
            //       font: fonts.mvnSemiBoldPdfFont,
            //       color: rgb(0 / 255, 135 / 255, 0 / 255),
            //     }),
            //     new TextDrawer({
            //       text: `Date de paiement`,
            //       size: 12,
            //       font: fonts.mvnSemiBoldPdfFont,
            //       color: rgb(75 / 255, 75 / 255, 75 / 255),
            //     }),
            //     new TextDrawer({
            //       text: `${day}/${month}/${year} à ${hours}:${minutes}:${seconds}`,
            //       size: 12,
            //       font: fonts.mvnMediumPdfFont,
            //     }),
            //   ],
            //   {
            //     x: HPadding,
            //     y: height - VPadding - 96,
            //     isRtl: false,
            //     extraLineHeight: 3,
            //   }
            // ),
            new TextBlockDrawer(
                [
                    new TextDrawer({
                        text:
                            formatString(
                                data?.klubr?.denomination?.trim(),
                                50,
                            ) || '',
                        size: 12,
                        font: fonts.mvnSemiBoldPdfFont,
                    }),
                    new TextDrawer({
                        text: data?.klubr?.siegeSocialAdresse?.trim() || '',
                        size: 12,
                        font: fonts.mvnMediumPdfFont,
                    }),
                    new TextDrawer({
                        text: `${data?.klubr?.siegeSocialCP?.trim() || ''} ${
                            data?.klubr?.siegeSocialVille?.trim() || ''
                        }`,
                        size: 12,
                        font: fonts.mvnMediumPdfFont,
                    }),
                ],
                {
                    x: width - HPadding,
                    y: height - VPadding - 96,
                    isRtl: true,
                    extraLineHeight: 3,
                },
            ),
        ],
    ];

    if (height - (height - reachedY + y) < 200) {
        pageIndex += 1;
        y = -35;
        reachedY = height - VPadding - 100;
        creditDebitList.push([]);
    }

    creditDebitList[pageIndex].push(
        ...[
            new RectangleDrawer({
                x: HPadding,
                y: reachedY - y - 70,
                height: 50,
                width: width - HPadding * 2,
                color: rgb(0, 0, 0),
            }),
            new TextDrawer({
                size: 12,
                x: HPadding + 20,
                y: reachedY - y - 50,
                text:
                    +data?.amountExcludingTax > 0
                        ? 'Total facture'
                        : 'Montant à reverser au Klub',
                color: rgb(1, 1, 1),
                font: fonts.mvnSemiBoldPdfFont,
            }),
            new TextBlockDrawer(
                [
                    new TextDrawer({
                        size: 12,
                        color: rgb(1, 1, 1),
                        text: `${formatNumberWithPadding(data?.amountExcludingTax > 0 ? data?.amountExcludingTax : -data?.amountExcludingTax)}€`,
                        font: fonts.mvnSemiBoldPdfFont,
                    }),
                ],
                {
                    x: width - HPadding - 20,
                    y: reachedY - y - 50,
                    isRtl: true,
                },
            ),
            ...footer,
        ],
    );

    creditDebitList.forEach((page, index) => {
        if (pages[index]) {
            pages[index] = [...pages[index], ...page];
        } else {
            pages.push([...minifiedHeader(94), ...page]);
        }
    });

    pages = pages?.map((page, index) => [
        ...page,
        ...pageNumber(index + 1, pages?.length),
    ]);

    return pages;
}

const formatList = (invoiceLines: Array<InvoiceLineEntity>) => {
    let firstAffected = true;
    let firstNotAffected = true;
    const result = invoiceLines?.reduce(
        (acc, curr) => {
            if (curr?.isCreditLine) {
                const isAffected = curr?.reference === `DONS PROJET`;
                if (isAffected && firstAffected) {
                    acc.credit.push({
                        affectedTitle: 'Don(s) affecté(s) à des projets',
                    });
                }
                if (!isAffected && firstNotAffected) {
                    acc.credit.push({
                        affectedTitle: 'Don(s) non affecté(s)',
                    });
                }
                console.log('curr', isAffected, curr);
                acc.credit.push({
                    title: formatString(curr?.description || '', 70),
                    amount:
                        formatNumberWithPadding(curr?.amountExcludingTax) || '',
                });
                curr?.klub_dons?.forEach((don) => {
                    const date = new Date(don.datePaiment);
                    acc.credit.push({
                        date: `${String(date.getDate()).padStart(2, '0')}/${String(
                            date.getMonth() + 1,
                        ).padStart(2, '0')}`,
                        amount: formatNumberWithPadding(don?.montant),
                        name: formatString(
                            don?.klubDonateur?.raisonSocial ||
                                `${don?.klubDonateur?.prenom} ${don?.klubDonateur?.nom}`,
                            40,
                        ),
                    });
                    if (isAffected) {
                        firstAffected = false;
                    }
                    if (!isAffected) {
                        firstNotAffected = false;
                    }
                });
                acc.creditSum += curr.amountExcludingTax;
            } else {
                acc.debit.push({
                    ref: curr?.reference,
                    title: `| ${curr?.description}`,
                    number: curr?.quantity,
                    unitPrice: formatNumberWithPadding(
                        curr?.unitPriceExcludingTax,
                    ),
                    amount: formatNumberWithPadding(curr?.amountExcludingTax),
                });
                acc.debitSum += curr.amountExcludingTax;
            }
            return acc;
        },
        { credit: [], creditSum: 0, debit: [], debitSum: 0 },
    );

    result.credit.push({
        totalTitle: 'Total',
        amount: formatNumberWithPadding(result.creditSum),
    });
    result.debit.push({
        totalTitle: 'Total',
        amount: formatNumberWithPadding(result.debitSum),
    });

    return result;
};

function formatNumberWithPadding(num: number | string): string {
    const number = parseFloat(String(num));
    return number.toFixed(2);
}

function formatString(str: string, maxChars: number) {
    if (str.length > maxChars) return str.slice(0, maxChars) + '...';
    return str;
}
