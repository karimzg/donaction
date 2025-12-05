import path from 'path';
import { MavenFonts } from '../funcs/installFonts';
import { format, parseISO } from 'date-fns';
import { PageElement } from '../entities/_types';
import numberToWordsFR from '../funcs/numberToWordsFr';
import TextDrawer from '../entities/TextDrawer';
import getRecuNumberFromAtt from '../funcs/getRecuNumberFromAtt';
import { rgb } from 'pdf-lib';
import SvgPathDrawer from '../entities/SvgPathDrawer';
import ImageDrawer from '../entities/ImageDrawer';
import { KlubDonEntity } from '../../../_types';

const signature = path.join(
    __dirname,
    '../../../../../public/assets/icons/signature-quentin-leclerc.png',
);

interface IGetInvoicePagesData {
    height: number;
    width: number;
    HPadding: number;
    VPadding: number;
    fonts: MavenFonts;
    don: KlubDonEntity;
}
export default async function getInvoicePagesData({
    height,
    width,
    HPadding,
    VPadding,
    fonts,
    don,
}: IGetInvoicePagesData): Promise<Array<Array<PageElement>>> {
    const {
        estOrganisme,
        datePaiment,
        montant,
        attestationNumber,
        klubDonateur,
        klubr,
        klub_projet,
    } = don;

    const formattedDateDay = format(parseISO(datePaiment as string), 'dd');
    const formattedDateMonth = format(parseISO(datePaiment as string), 'MM');
    const formattedDateYear = format(parseISO(datePaiment as string), 'yyyy');
    const amountDon = montant;
    const fraction = amountDon % 1;
    const decimale = parseInt(amountDon.toString());
    const decimaleNumberInWords =
        numberToWordsFR(decimale).charAt(0).toUpperCase() +
        numberToWordsFR(decimale).slice(1) +
        ' Euro';
    const fractionNumberInWords =
        numberToWordsFR(
            Number(fraction.toString().substring(2).substring(0, 2)),
        ) + ' Centime';

    const fullText =
        decimale.toString() +
        String(
            fraction
                ? '.' + fraction.toString().substring(2).substring(0, 2)
                : '',
        );

    const donationText = !!klub_projet
        ? `Don pour ${klubr?.denomination}, projet: ${klub_projet?.titre}`
        : `Don pour ${klubr?.denomination}: Financement des activités d'intérêt général de l'association ${klubr?.denomination}`;

    if (estOrganisme) {
        return proPagesData({
            height,
            fonts,
            don,
            fraction,
            formattedDateDay,
            formattedDateMonth,
            formattedDateYear,
            decimaleNumberInWords,
            fractionNumberInWords,
            fullText,
            donationText,
        });
    }
    const page1 = [
        new TextDrawer({
            text: getRecuNumberFromAtt(attestationNumber),
            x:
                490 -
                fonts.mvnRegularPdfFont.widthOfTextAtSize(
                    attestationNumber,
                    10,
                ) /
                    2,
            y: height - 122,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: 'Fonds Klubr',
            x: 166,
            y: height - 178,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: '10,',
            x: 56,
            y: height - 218,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: 'clos du Golf du Sart',
            x: 141,
            y: height - 218,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: '59491',
            x: 103,
            y: height - 232,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: "VILLENEUVE D'ASCQ",
            x: 240,
            y: height - 232,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: 'France',
            x: 72,
            y: height - 244,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: donationText,
            x: 76,
            y: height - 256,
            size: 10,
            font: fonts.mvnRegularPdfFont,
            maxWidth: 400,
            lineHeight: 12,
        }),
        new TextDrawer({
            text: 'x',
            x: 37,
            y: height - 534,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
    ];
    const page2 = [
        new TextDrawer({
            text: klubDonateur?.nom || '',
            x: 70,
            y: height - 251,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.prenom || '',
            x: 364,
            y: height - 251,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.adresse || '',
            x: 55,
            y: height - 281,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.adresse2 || '',
            x: 142,
            y: height - 281,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.cp || '',
            x: 101,
            y: height - 295,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.ville || '',
            x: 240,
            y: height - 295,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.pays || '',
            x: 72,
            y: height - 310,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: `${fullText} €`,
            x:
                100 -
                fonts.mvnRegularPdfFont.widthOfTextAtSize(`${fullText} €`, 10) /
                    2,
            y: height - 363,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text:
                decimaleNumberInWords +
                (fraction ? ' et ' + fractionNumberInWords : ''),
            x: 355,
            y: height - 362,
            size: 10,
            font: fonts.mvnRegularPdfFont,
            maxWidth: 200,
            lineHeight: 12,
            wordBreaks: ['-'],
        }),
        new TextDrawer({
            text: formattedDateDay,
            x: 187,
            y: height - 383,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: formattedDateMonth,
            x: 215,
            y: height - 383,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: formattedDateYear,
            x: 240,
            y: height - 383,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: 'x',
            x: 36,
            y: height - 485,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: 'x',
            x: 36,
            y: height - 521,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: 'x',
            x: 292,
            y: height - 590,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: 'x',
            x: 101,
            y: height - 448,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: formattedDateDay,
            x: 311,
            y: height - 641,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: formattedDateMonth,
            x: 331,
            y: height - 641,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: formattedDateYear,
            x: 349,
            y: height - 641,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new ImageDrawer({
            url: signature,
            width: 50.543901,
            height: 45,
            x: 402,
            y: height - 660,
        }),
    ];

    return [page1, page2];
}

function proPagesData({
    height,
    fonts,
    don,
    fraction,
    formattedDateDay,
    formattedDateMonth,
    formattedDateYear,
    decimaleNumberInWords,
    fractionNumberInWords,
    fullText,
    donationText,
}) {
    const { attestationNumber, klubDonateur } = don;

    const page1 = [
        new TextDrawer({
            text: getRecuNumberFromAtt(attestationNumber),
            x:
                490 -
                fonts.mvnRegularPdfFont.widthOfTextAtSize(
                    attestationNumber,
                    10,
                ) /
                    2,
            y: height - 135,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: 'Fonds Klubr',
            x: 220,
            y: height - 184,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: '10,',
            x: 75,
            y: height - 233,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: 'clos du Golf du Sart',
            x: 160,
            y: height - 233,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: '59491',
            x: 120,
            y: height - 245,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: "VILLENEUVE D'ASCQ",
            x: 260,
            y: height - 245,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: 'France',
            x: 80,
            y: height - 257,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: donationText,
            x: 80,
            y: height - 270,
            size: 10,
            font: fonts.mvnRegularPdfFont,
            maxWidth: 500,
            lineHeight: 12,
        }),
        new TextDrawer({
            text: 'x',
            x: 35,
            y: height - 773,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
    ];
    const page2 = [
        new TextDrawer({
            text: klubDonateur?.raisonSocial || '',
            x: 209,
            y: height - 204,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.formeJuridique || '',
            x: 133,
            y: height - 217,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.SIREN || '',
            x: 129,
            y: height - 231,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.adresse,
            x: 79,
            y: height - 257,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.adresse2,
            x: 185,
            y: height - 257,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.cp || '',
            x: 113,
            y: height - 269,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: klubDonateur?.ville || '',
            x: 250,
            y: height - 269,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: `${fullText} €`,
            x:
                66 -
                fonts.mvnRegularPdfFont.widthOfTextAtSize(`${fullText} €`, 10) /
                    2,
            y: height - 474,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text:
                decimaleNumberInWords +
                (fraction ? ' et ' + fractionNumberInWords : ''),
            x: 40,
            y: height - 498,
            size: 10,
            font: fonts.mvnRegularPdfFont,
            maxWidth: 200,
            lineHeight: 12,
            wordBreaks: ['-'],
        }),
        new TextDrawer({
            text: 'x',
            x: 255,
            y: height - 522,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: `${fullText} €`,
            x:
                66 -
                fonts.mvnRegularPdfFont.widthOfTextAtSize(`${fullText} €`, 10) /
                    2,
            y: height - 548,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text:
                decimaleNumberInWords +
                (fraction ? ' et ' + fractionNumberInWords : ''),
            x: 40,
            y: height - 571,
            size: 10,
            font: fonts.mvnRegularPdfFont,
            maxWidth: 200,
            lineHeight: 12,
            wordBreaks: ['-'],
        }),
        new SvgPathDrawer({
            path: 'M335 623 H345 V633 H335 Z',
            x: 0,
            y: height,
            color: rgb(255 / 255, 255 / 255, 255 / 255),
        }),
        new TextDrawer({
            text: 'Le',
            x: 50,
            y: height - 605,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: formattedDateDay,
            x: 67,
            y: height - 605,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: '/',
            x: 79,
            y: height - 605,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: formattedDateMonth,
            x: 85,
            y: height - 605,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: '/',
            x: 97,
            y: height - 605,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: formattedDateYear,
            x: 103,
            y: height - 605,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: 'Le',
            x: 335,
            y: height - 660,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: formattedDateDay,
            x: 352,
            y: height - 660,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: '/',
            x: 364,
            y: height - 660,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: formattedDateMonth,
            x: 370,
            y: height - 660,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: '/',
            x: 382,
            y: height - 660,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new TextDrawer({
            text: formattedDateYear,
            x: 388,
            y: height - 660,
            size: 10,
            font: fonts.mvnRegularPdfFont,
        }),
        new ImageDrawer({
            url: signature,
            width: 67.391868,
            height: 60,
            x: 435,
            y: height - 680,
        }),
    ];

    return [page1, page2];
}
