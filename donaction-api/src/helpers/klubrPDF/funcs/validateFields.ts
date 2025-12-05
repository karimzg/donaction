import ImageDrawer from '../entities/ImageDrawer';

interface IField {
    keys: Array<string>;
    name: string;
    testImage: boolean;
    fallback?: IField;
}

const projectPosterPdfFields: Array<IField> = [
    {
        keys: ['klubr', 'klubr_house'],
        name: 'Klubr house',
        testImage: null,
    },
    {
        keys: ['descriptionCourte', '0', 'children', 'length'],
        name: 'Description courte',
        testImage: null,
    },
    {
        keys: ['klubr', 'slug'],
        name: 'Slug du club',
        testImage: null,
    },
    {
        keys: ['slug'],
        name: 'Slug du projet',
        testImage: null,
    },
    {
        keys: ['couverture'],
        name: 'Image de couverture de projet',
        testImage: true,
    },
    {
        keys: ['klubr', 'logo'],
        name: 'Logo du club',
        testImage: true,
    },
    {
        keys: ['titre'],
        name: 'Titre du projet',
        testImage: null,
    },
];

const clubPosterPdfFields: Array<IField> = [
    {
        keys: ['poster_media'],
        name: "Image d'affiche",
        testImage: true,
        fallback: {
            keys: ['couvertureMedia'],
            name: 'Image de couverture de club',
            testImage: true,
        },
    },
    {
        keys: ['klubr', 'logo'],
        name: 'Logo du club',
        testImage: true,
    },
    {
        keys: ['klubr', 'slug'],
        name: 'Slug du club',
        testImage: null,
    },
    {
        keys: ['klubr', 'denomination'],
        name: 'Dénomination',
        testImage: null,
    },
];

const noDeductionUserCertificatePdfFields: Array<IField> = [
    {
        keys: ['datePaiment'],
        name: 'Date de paiement',
        testImage: null,
    },
    {
        keys: ['attestationNumber'],
        name: "Numéro d'attestation",
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'prenom'],
        name: 'Prénom',
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'nom'],
        name: 'Nom',
        testImage: null,
    },
    {
        keys: ['klubr', 'denomination'],
        name: 'Dénomination',
        testImage: null,
    },
    {
        keys: ['klubr', 'siegeSocialAdresse'],
        name: 'Adresse du club',
        testImage: null,
    },
    {
        keys: ['klubr', 'siegeSocialCP'],
        name: 'Code postal du club',
        testImage: null,
    },
    {
        keys: ['klubr', 'siegeSocialVille'],
        name: 'Ville du club',
        testImage: null,
    },
];

const userCertificatePdfFields: Array<IField> = [
    ...noDeductionUserCertificatePdfFields,
    {
        keys: ['klubDonateur', 'civilite'],
        name: 'Civilité',
        testImage: null,
    },

    {
        keys: ['klubDonateur', 'cp'],
        name: 'Code postal',
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'ville'],
        name: 'Ville',
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'pays'],
        name: 'Pays',
        testImage: null,
    },
];

const companyCertificatePdfFields: Array<IField> = [
    {
        keys: ['klubDonateur', 'raisonSocial'],
        name: 'Raison sociale',
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'formeJuridique'],
        name: 'Forme juridique',
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'SIREN'],
        name: 'SIREN',
        testImage: null,
    },
];

const userInvoicePdfFields: Array<IField> = [
    {
        keys: ['datePaiment'],
        name: 'Date de paiement',
        testImage: null,
    },
    {
        keys: ['montant'],
        name: 'Montant',
        testImage: null,
    },
    {
        keys: ['klubr', 'denomination'],
        name: 'Dénomination',
        testImage: null,
    },
    {
        keys: ['attestationNumber'],
        name: "Numéro d'attestation",
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'prenom'],
        name: 'Prénom',
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'nom'],
        name: 'Nom',
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'cp'],
        name: 'Code postal',
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'ville'],
        name: 'Ville',
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'pays'],
        name: 'Pays',
        testImage: null,
    },
];

const companyInvoicePdfFields: Array<IField> = [
    {
        keys: ['klubDonateur', 'raisonSocial'],
        name: 'Raison sociale',
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'formeJuridique'],
        name: 'Forme juridique',
        testImage: null,
    },
    {
        keys: ['klubDonateur', 'SIREN'],
        name: 'SIREN',
        testImage: null,
    },
];

const clubInvoicePdfFields: Array<IField> = [
    // {
    //   keys: ["dateBankTransfer"],
    //   name: "Date de transfert bancaire",
    //   testImage: null,
    // },
    {
        keys: ['invoiceNumber'],
        name: 'Numéro de facture',
        testImage: null,
    },
    {
        keys: ['dateInvoice'],
        name: 'Date de facture',
        testImage: null,
    },
    {
        keys: ['klubr', 'denomination'],
        name: 'Dénomination',
        testImage: null,
    },
    {
        keys: ['klubr', 'siegeSocialAdresse'],
        name: 'Adresse du club',
        testImage: null,
    },
    {
        keys: ['klubr', 'siegeSocialCP'],
        name: 'Code postale du club',
        testImage: null,
    },
    {
        keys: ['amountExcludingTax'],
        name: 'Montant total',
        testImage: null,
    },
];

type IType =
    | 'CLUB_POSTER_PDF'
    | 'PROJECT_POSTER_PDF'
    | 'USER_CERTIFICATE_PDF'
    | 'NO_DEDUCTION_CERTIFICATE_PDF'
    | 'COMPANY_CERTIFICATE_PDF'
    | 'USER_INVOICE_PDF'
    | 'NO_DEDUCTION_USER_INVOICE_PDF'
    | 'COMPANY_INVOICE_PDF'
    | 'CLUB_INVOICE_PDF';

const getFields = (type: IType) => {
    switch (type) {
        case 'CLUB_POSTER_PDF':
            return clubPosterPdfFields;
        case 'PROJECT_POSTER_PDF':
            return projectPosterPdfFields;
        case 'USER_CERTIFICATE_PDF':
            return userCertificatePdfFields;
        case 'NO_DEDUCTION_CERTIFICATE_PDF':
            return noDeductionUserCertificatePdfFields;
        case 'COMPANY_CERTIFICATE_PDF':
            return [
                ...userCertificatePdfFields,
                ...companyCertificatePdfFields,
            ];
        case 'USER_INVOICE_PDF':
            return userInvoicePdfFields;
        // case "NO_DEDUCTION_USER_INVOICE_PDF":
        //   return noDeductionUserInvoicePdfFields;
        case 'COMPANY_INVOICE_PDF':
            return [...userInvoicePdfFields, ...companyInvoicePdfFields];
        case 'CLUB_INVOICE_PDF':
            return clubInvoicePdfFields;
        default:
            return [];
    }
};

export default async function validatePdfFields(
    data: any,
    type: IType,
): Promise<Array<string>> {
    let messages: Array<string> = [];
    let index = 0;
    const fields = getFields(type);
    const validateField = async (field: IField) => {
        const { keys, testImage, fallback, name } = field;
        const fieldValue = keys.reduce((acc, curr) => {
            try {
                return acc[curr];
            } catch (e) {
                return null;
            }
        }, data);

        if (!fieldValue) {
            if (fallback) {
                await validateField(fallback);
            } else {
                messages.push(`Veuillez compléter ce champ '${name}' .`);
            }
        } else if (testImage) {
            try {
                await new ImageDrawer({
                    url: fieldValue['url'],
                    x: 0,
                    y: 0,
                    width: fieldValue['width'],
                    height: fieldValue['height'],
                }).getEmbeddableImage();
            } catch (e) {
                if (fallback) {
                    await validateField(fallback);
                } else {
                    messages.push(`${name} non valide.`);
                }
            }
        }
    };
    while (index < fields.length) {
        await validateField(fields[index]);
        index++;
    }
    console.log(messages);
    return messages;
}
