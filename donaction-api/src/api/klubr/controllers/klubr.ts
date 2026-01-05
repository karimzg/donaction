/**
 * klubr controller
 */

import { Core, factories } from '@strapi/strapi';
import { CLUB_STATUS } from '../../../helpers/clubStatus';
import {
    FederationEntity,
    KlubDonEntity,
    KlubProjetEntity,
    KlubrDocumentEntity,
    KlubrEntity,
    KlubrHouseEntity,
    KlubrMemberEntity,
    PageHomeEntity,
    PaginationEntity,
    TradePolicyEntity,
    UserEntity,
} from '../../../_types';
import { removeCodes, removeId } from '../../../helpers/sanitizeHelpers';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import createAssessment from '../../../helpers/gcc/createAssessment';
import {
    getAddress,
    getCity,
    getCountry,
    getDistrict,
    getGmapObj,
    getPhone,
    getPostCode,
    getState,
    getWebSite,
} from '../../../helpers/gcc/googlePlaceHelpers';

export default factories.createCoreController(
    'api::klubr.klubr',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async findOne() {
            const ctx = strapi.requestContext.get();
            const { uuid } = ctx.params;

            if (!uuid) {
                return ctx.badRequest('Missing klub uuid.');
            }
            ctx.query = {
                ...ctx.query,
                filters: {
                    uuid,
                    ...(ctx.query.filters as Record<string, any>),
                },
            };
            await this.validateQuery(ctx);

            const sanitizedQueryParams = await this.sanitizeQuery(ctx);

            const {
                results,
                pagination,
            }: { results: Array<KlubrEntity>; pagination: PaginationEntity } =
                await strapi
                    .service('api::klubr.klubr')
                    .find(sanitizedQueryParams);

            if (results.length === 0) {
                return ctx.notFound('Klub not found');
            }

            const entity = results[0];
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },
        async find() {
            const ctx = strapi.requestContext.get();
            try {
                if (ctx.query?.filters && ctx.query?.filters['id']) {
                    delete ctx.query?.filters['id'];
                }
                await this.validateQuery(ctx);
                const sanitizedQueryParams: Record<string, any> =
                    await this.sanitizeQuery(ctx);
                let resultsFeatured: Array<KlubrEntity> = [];

                if (
                    Array.isArray(sanitizedQueryParams.fields) &&
                    sanitizedQueryParams.fields?.length > 0
                ) {
                    if (!sanitizedQueryParams.fields.includes('uuid')) {
                        sanitizedQueryParams.fields.push('uuid');
                    }
                }

                if (ctx.query?.featured) {
                    // Get featured clubs from home page
                    const homePage: PageHomeEntity = await strapi.db
                        .query('api::page-home.page-home')
                        .findOne({
                            populate: ['klubrs_featured'],
                        });
                    const homePageFeaturedKlubs =
                        homePage?.klubrs_featured?.map((klub) => klub.id);
                    // Create a new query to get featured clubs
                    const {
                        featured = true,
                        withNbProjects = false,
                        withNbDons = false,
                        withNbMembers = false,
                        ...sanitizedQueryParamsFeatured
                    } = {
                        ...sanitizedQueryParams,
                    };
                    sanitizedQueryParamsFeatured['filters'] = {
                        id: {
                            $in: homePageFeaturedKlubs,
                        },
                        status: {
                            $eq: CLUB_STATUS.PUBLISHED,
                        },
                    };
                    const pageSize =
                        sanitizedQueryParams.pagination?.pageSize || '3';
                    // Get featured clubs
                    try {
                        resultsFeatured = await strapi
                            .documents('api::klubr.klubr')
                            .findMany(sanitizedQueryParamsFeatured);
                    } catch (e) {
                        console.error('error getting featured clubs', e);
                    }
                    // Update the query to get the remaining clubs
                    if (+pageSize > resultsFeatured?.length) {
                        sanitizedQueryParams.pagination = {
                            pageSize: `${+pageSize - resultsFeatured.length}`,
                        };
                    } else {
                        if (+pageSize < resultsFeatured?.length) {
                            resultsFeatured = resultsFeatured.slice(
                                0,
                                +pageSize,
                            );
                        }
                        sanitizedQueryParams.pagination = {
                            pageSize: '0',
                        };
                    }
                    // Remove featured clubs from the query
                    sanitizedQueryParams.filters =
                        sanitizedQueryParams.filters || {};
                    sanitizedQueryParams.filters.id = {
                        $notIn: homePageFeaturedKlubs,
                    };
                    // Add sort by createdAt:desc
                    sanitizedQueryParams.sort = sanitizedQueryParams.sort || [];
                    sanitizedQueryParams.sort = [
                        ...sanitizedQueryParams.sort,
                        'createdAt:desc',
                    ];
                }

                let {
                    results,
                    pagination,
                }: {
                    results: Array<KlubrEntity>;
                    pagination: PaginationEntity;
                } =
                    sanitizedQueryParams.pagination?.pageSize !== '0'
                        ? await strapi
                              .service('api::klubr.klubr')
                              .find(sanitizedQueryParams)
                        : { results: [], pagination: {} };

                results = [...resultsFeatured, ...results];

                // Get number of projects for each club
                if (
                    !!results?.length &&
                    !!ctx.query?.withNbProjects &&
                    ctx.query?.withNbProjects === 'true'
                ) {
                    try {
                        const klubrFilters = [
                            {
                                klubr: {
                                    $in: results.map((klub) => klub.id),
                                },
                            },
                        ];

                        const filters = {
                            $and: [...klubrFilters],
                        };

                        const projetcByklubs: Array<KlubProjetEntity> =
                            await strapi
                                .documents('api::klub-projet.klub-projet')
                                .findMany({
                                    fields: ['id'],
                                    populate: { klubr: { fields: ['id'] } },
                                    // @ts-ignore
                                    filters,
                                });
                        results.forEach((klub) => {
                            klub['nbProjects'] = projetcByklubs.filter(
                                (project) => project.klubr.id === klub.id,
                            ).length;
                        });
                    } catch (e) {
                        console.error('error getting projects by club', e);
                    }
                }

                // Get number of active projects for each club
                if (
                    !!results?.length &&
                    !!ctx.query?.withNbActiveProjects &&
                    ctx.query?.withNbActiveProjects === 'true'
                ) {
                    try {
                        const klubrFilters = [
                            {
                                klubr: {
                                    $in: results.map((klub) => klub.id),
                                },
                            },
                        ];
                        const statusFilter = [
                            {
                                status: {
                                    $eq: 'published',
                                },
                            },
                        ];

                        const filters = {
                            $and: [...klubrFilters, ...statusFilter],
                        };

                        const projetcByklubs: Array<KlubProjetEntity> =
                            await strapi
                                .documents('api::klub-projet.klub-projet')
                                .findMany({
                                    fields: ['id'],
                                    populate: { klubr: { fields: ['id'] } },
                                    //@ts-ignore
                                    filters,
                                });
                        results.forEach((klub) => {
                            klub['nbActiveProjects'] = projetcByklubs.filter(
                                (project) => project.klubr.id === klub.id,
                            ).length;
                        });
                    } catch (e) {
                        console.error('error getting projects by club', e);
                    }
                }

                // Get number of dons for each club
                if (
                    !!results?.length &&
                    !!ctx.query?.withNbDons &&
                    ctx.query?.withNbDons === 'true'
                ) {
                    try {
                        const klubrFilters = [
                            {
                                klubr: {
                                    $in: results.map((klub) => klub.id),
                                },
                                statusPaiment: 'success',
                            },
                        ];
                        const filters = {
                            $and: [...klubrFilters],
                        };

                        const donsByklubs: Array<KlubDonEntity> = await strapi
                            .documents('api::klub-don.klub-don')
                            .findMany({
                                fields: ['id', 'montant'],
                                populate: { klubr: { fields: ['id'] } },
                                // @ts-ignore
                                filters,
                            });
                        results.forEach((klub) => {
                            const donsForKlub = donsByklubs.filter(
                                (don) => don.klubr.id === klub.id,
                            );
                            klub['statNbDons'] = donsForKlub.length;
                            klub['statDonsTotalAmount'] = donsForKlub.reduce(
                                (acc, don) => acc + don.montant,
                                0,
                            );
                        });
                    } catch (e) {
                        console.error('error getting dons by club', e);
                    }
                }

                // Get number of members for each club
                if (
                    !!results?.length &&
                    !!ctx.query?.withNbMembers &&
                    ctx.query?.withNbMembers === 'true'
                ) {
                    try {
                        const klubrFilters = [
                            {
                                klubr: {
                                    $in: results.map((klub) => klub.id),
                                },
                            },
                        ];
                        const filters = {
                            $and: [...klubrFilters],
                        };

                        const membersByklubs: Array<KlubrMemberEntity> =
                            await strapi
                                .documents('api::klubr-membre.klubr-membre')
                                .findMany({
                                    fields: ['id'],
                                    populate: {
                                        klubr: { fields: ['id'] },
                                        users_permissions_user: {
                                            fields: ['id'],
                                        },
                                    },
                                    // @ts-ignore
                                    filters,
                                });
                        results.forEach((klub) => {
                            const membersForKlub = membersByklubs.filter(
                                (member) => member.klubr.id === klub.id,
                            );
                            klub['statNbMembers'] = membersForKlub.length;
                            klub['statNbMembersWithAccount'] =
                                membersForKlub.filter(
                                    (member) => !!member.users_permissions_user,
                                ).length;
                        });
                    } catch (e) {
                        console.error('error getting members by club', e);
                    }
                }

                const sanitizedResult = await this.sanitizeOutput(results, ctx);
                let data = removeId(sanitizedResult);
                return { data, meta: { pagination } };
            } catch (e) {
                console.log(e);
            }
            return true;
        },
        async findBySlug() {
            const ctx = strapi.requestContext.get();
            const { slug } = ctx.params;
            if (!slug) {
                return ctx.badRequest('Slug du club manquant.');
            }
            if (!isNaN(Number(slug))) {
                console.log('La valeur est un nombre.');
            } else {
                console.log("La valeur n'est pas un nombre.");
            }
            const { preview } = ctx.params;
            const isPreview = preview === 'preview';
            const filterStatus = isPreview
                ? ['published', 'draft']
                : ['published'];

            let filters = {};
            filters = {
                $and: [
                    {
                        ...((ctx.query.filters as Record<string, any>) || {}),
                    },
                    {
                        slug: {
                            $eq: slug,
                        },
                        status: {
                            $in: filterStatus,
                        },
                    },
                ],
            };
            ctx.query = { ...ctx.query, filters };

            await this.validateQuery(ctx);
            const sanitizedQueryParams = await this.sanitizeQuery(ctx);
            // Exemple pour https://trello.com/c/HWRuXsh4/277-harmonisation-api-metadata-pagination?filter=member:karimz
            const {
                results,
                pagination,
            }: { results: Array<KlubrEntity>; pagination: PaginationEntity } =
                await strapi
                    .service('api::klubr.klubr')
                    .find(sanitizedQueryParams);
            if (results.length === 0) {
                return ctx.notFound('Club non trouvé');
            }
            const sanitizedResult: Partial<KlubrEntity> =
                await this.sanitizeOutput<KlubrEntity>(results[0], ctx);
            if (isPreview) {
                if (!ctx.state['user']) {
                    return ctx.unauthorized(
                        'Merci de vous authentifier pour prévisualiser ce club.',
                    );
                }
                const userCTX: UserEntity = await strapi.db
                    .query('plugin::users-permissions.user')
                    .findOne({
                        where: { uuid: ctx.state['user']['uuid'] },
                        populate: {
                            klubr_membres: {
                                populate: {
                                    klubr: {
                                        fields: ['id', 'uuid', 'denomination'],
                                    },
                                },
                            },
                        },
                    });
                // console.log("userCTX", userCTX);
                const klubrIdFromUser = userCTX.klubr_membres.map(
                    (klubr_membre) => klubr_membre.klubr.id,
                );
                const userIsAdmin = userCTX.klubr_membres
                    .map((klubr_membre) => klubr_membre.role === 'Admin')
                    .includes(true);
                const klubrDenominationFromUser = userCTX.klubr_membres.map(
                    (klubr_membre) => klubr_membre.klubr.denomination,
                );
                console.log(
                    'userIsAdmin',
                    userIsAdmin,
                    'klubrIdFromUser',
                    klubrIdFromUser,
                    'klubrDenominationFromUser',
                    klubrDenominationFromUser,
                );
                if (
                    !klubrIdFromUser.includes(sanitizedResult.id) &&
                    !userIsAdmin
                ) {
                    return ctx.forbidden(
                        "Vous n'êtes pas autorisé à prévisualiser ce club.",
                    );
                }
            }
            return removeId(sanitizedResult);
        },
        async update() {
            try {
                const ctx = strapi.requestContext.get();
                const { id } = ctx.params;
                if (!id) {
                    return ctx.badRequest('Missing UUID.');
                }
                const entityWithUUID: KlubrEntity = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        select: ['id', 'documentId'],
                        where: { uuid: id },
                        populate: {
                            federationLink: {
                                populate: {
                                    klubr: true,
                                },
                            },
                        },
                    });
                if (!entityWithUUID) {
                    return ctx.badRequest(`Entity with UUID ${id} not found`);
                }

                /* LINK KLUB TO KLUBR FROM HIS FEDERATION */
                if (
                    ctx.request.body.data?.federationLink &&
                    ((entityWithUUID.federationLink &&
                        ctx.request.body.data?.federationLink !==
                            entityWithUUID.federationLink.id) ||
                        !entityWithUUID.federationLink)
                ) {
                    const newFederation: FederationEntity = await strapi.db
                        .query('api::federation.federation')
                        .findOne({
                            where: {
                                id: ctx.request.body.data?.federationLink,
                            },
                            populate: {
                                klubr: true,
                            },
                        });

                    const newFederationKlubrId =
                        newFederation.klubr?.id || null;
                    ctx.request.body.data = {
                        ...ctx.request.body.data,
                        klubrAffiliations: newFederationKlubrId,
                    };
                }

                let populate = ctx.request.query?.populate;
                if (
                    Array.isArray(populate) &&
                    populate?.includes('federationLink')
                ) {
                    populate.push('federationLink');
                }
                let entity: KlubrEntity = await strapi
                    .documents('api::klubr.klubr')
                    .update({
                        documentId: entityWithUUID.documentId,
                        data: ctx.request.body.data,
                        populate,
                    });

                /* UPDATE KLUBR INFOS */
                const klubr_info = await strapi
                    .service('api::klubr.klubr')
                    .setKlubrInfosRequiredFieldsCompletion(entity);

                if (klubr_info) {
                    entity = {
                        ...entity,
                        klubr_info,
                    };
                }

                // prevent returning ids
                const sanitizedResult = await this.sanitizeOutput(entity, ctx);
                return removeId(removeCodes(sanitizedResult));
            } catch (e) {
                console.log('error', e);
                return e;
            }
        },
        async create() {
            const ctx = strapi.requestContext.get();
            const entity: KlubrEntity = await super.create(ctx);

            await strapi.documents('api::klubr-info.klubr-info').create({
                data: {
                    klubr: entity?.id,
                },
            });
            await strapi
                .documents('api::klubr-document.klubr-document')
                .create({
                    data: {
                        klubr: entity?.id,
                    },
                });

            // prevent returning ids
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(sanitizedResult);
        },
        async sendInvitation() {
            const ctx = strapi.requestContext.get();
            //TODO: check ctx.user is admin or leader of klubr
            console.log(
                '****************SENDING INVITATION*******************',
            );
            const { code } = ctx.params;
            const { email } = ctx.request.body?.data;
            const { user } = ctx.state;

            // Retrieve the user.last_member_profile_used member with klubr.uuid
            const lastMemberProfileUsed =
                ctx.state.user?.last_member_profile_used;
            const host = await strapi.db
                .query('api::klubr-membre.klubr-membre')
                .findOne({
                    where: { uuid: lastMemberProfileUsed },
                    populate: { klubr: true },
                });

            /* Check MEMBER */
            const club: KlubrEntity = await strapi.db
                .query('api::klubr.klubr')
                .findOne({
                    where: {
                        $or: [{ code: code }, { codeLeader: code }],
                    },
                    populate: {
                        klubr_house: true,
                        logo: true,
                    },
                });
            if (!club)
                return ctx.notFound('Aucun club ne correspond au code fourni');

            if (email) {
                const response = await strapi.services[
                    'api::klubr.klubr'
                ].sendInvitationEmail(email, host, club, code);
                return true;
            }
            return false;
        },
        async postFileDocuments() {
            const ctx = strapi.requestContext.get();
            try {
                const { files } = ctx.request;

                /* FILE CHECK */
                if (!files) {
                    return ctx.badRequest('Aucun fichier téléchargé.');
                }

                /* KLUBR CHECK */
                const { uuid } = ctx.params;
                const entityWithUUID: KlubrEntity = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid },
                        populate: {
                            klubr_document: true,
                        },
                    });
                if (!entityWithUUID) {
                    return ctx.badRequest(`Klub avec UUID ${uuid} non trouvé`);
                }

                /* KLUBR DOCUMENT CHECK */
                let klubrDocument: KlubrDocumentEntity =
                    entityWithUUID.klubr_document;
                if (!klubrDocument) {
                    klubrDocument = await strapi
                        .documents('api::klubr-document.klubr-document')
                        .create({
                            data: {
                                klubr: entityWithUUID.id,
                            },
                        });
                }

                const filesObj = Object.entries(files);
                const data = {};

                /* FILE TYPE CHECK */
                for (const [fieldName, file] of filesObj) {
                    const allowedMimeTypes = [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    ];

                    const mimeType = mime.lookup(file['originalFilename']);
                    if (!allowedMimeTypes.includes(String(mimeType))) {
                        return ctx.badRequest(
                            'Invalid file type. Only PDF, DOC, and DOCX are allowed.',
                        );
                    }
                }

                /* FILE COPY */
                for (const [fieldName, file] of filesObj) {
                    const now = new Date();
                    const extension = path.extname(file['originalFilename']);
                    const formattedDate = now
                        .toISOString()
                        .slice(0, 16)
                        .replace('T', '-')
                        .replace(':', '-');
                    let fileName = `${formattedDate}-`;
                    let fileToUnlink = null;
                    switch (fieldName) {
                        case 'justifDomicileDirigeant':
                            fileName +=
                                'justificatif-de-domicile-du-dirigeant' +
                                extension;
                            if (
                                klubrDocument.justifDomicileDirigeant &&
                                klubrDocument.justifDomicileDirigeant['path']
                            ) {
                                fileToUnlink =
                                    klubrDocument.justifDomicileDirigeant[
                                        'path'
                                    ];
                            }
                            break;
                        case 'justifDesignationPresident':
                            fileName +=
                                'justificatif-d-habilitation-par-le-beneficiaire' +
                                extension;
                            if (
                                klubrDocument.justifDesignationPresident &&
                                klubrDocument.justifDesignationPresident['path']
                            ) {
                                fileToUnlink =
                                    klubrDocument.justifDesignationPresident[
                                        'path'
                                    ];
                            }
                            break;
                        case 'statutsAssociation':
                            fileName += 'statuts-de-l-association' + extension;
                            if (
                                klubrDocument.statutsAssociation &&
                                klubrDocument.statutsAssociation['path']
                            ) {
                                fileToUnlink =
                                    klubrDocument.statutsAssociation['path'];
                            }
                            break;
                        case 'ribAssociation':
                            fileName += 'rib-de-l-association' + extension;
                            if (
                                klubrDocument.ribAssociation &&
                                klubrDocument.ribAssociation['path']
                            ) {
                                fileToUnlink =
                                    klubrDocument.ribAssociation['path'];
                            }
                            break;
                        case 'avisSituationSIRENE':
                            fileName += 'avis-situation-sirene' + extension;
                            if (
                                klubrDocument.avisSituationSIRENE &&
                                klubrDocument.avisSituationSIRENE['path']
                            ) {
                                fileToUnlink =
                                    klubrDocument.avisSituationSIRENE['path'];
                            }
                            break;
                        case 'attestationAffiliationFederation':
                            fileName +=
                                'attestation-affiliation-federation' +
                                extension;
                            if (
                                klubrDocument.attestationAffiliationFederation &&
                                klubrDocument.attestationAffiliationFederation[
                                    'path'
                                ]
                            ) {
                                fileToUnlink =
                                    klubrDocument
                                        .attestationAffiliationFederation[
                                        'path'
                                    ];
                            }
                            break;
                        default:
                            return ctx.badRequest('Champ de fichier inconnu');
                    }

                    /* DELETE PREVIOUS FILES */
                    try {
                        if (fileToUnlink) {
                            fs.unlinkSync(fileToUnlink);
                        }
                    } catch (e) {
                        console.log('Error while deleting file', fileToUnlink);
                    }

                    /* FOLDER */
                    const uploadDir = path.join(
                        __dirname,
                        `../../../../../private-pdf/documents/${entityWithUUID.slug}`,
                    );
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }

                    /* COPY FILE */
                    const filePath = path.join(uploadDir, fileName);
                    fs.writeFileSync(
                        filePath,
                        fs.readFileSync(file['filepath']),
                    );
                    data[fieldName] = {
                        name: fileName,
                        size: file['size'],
                        path: filePath,
                        ext: path.extname(fileName).slice(1),
                        mime: file['type'],
                        updatedAt: now,
                    };
                }

                /* UPDATE KLUBR DOCUMENT */
                const updatedKlubrDocument: KlubrDocumentEntity = await strapi
                    .documents('api::klubr-document.klubr-document')
                    .update({
                        documentId: klubrDocument.documentId,
                        data,
                    });

                /* UPDATE KLUBR */
                let updatedKlubr: KlubrEntity = await strapi
                    .documents('api::klubr.klubr')
                    .findOne({
                        documentId: entityWithUUID.documentId,
                        populate: {
                            klubr_document: true,
                        },
                    });

                /* UPDATE KLUBR INFOS */
                const klubr_info = await strapi
                    .service('api::klubr.klubr')
                    .setKlubrInfosRequiredDocsCompletion(
                        entityWithUUID.id,
                        updatedKlubrDocument,
                    );

                if (klubr_info) {
                    updatedKlubr = {
                        ...updatedKlubr,
                        klubr_info,
                    };
                }

                return ctx.send(updatedKlubr);
            } catch (error) {
                console.error(error);
                return ctx.internalServerError(
                    'Erreur lors de la mise à jour du fichier',
                );
            }
        },
        async postKlubrDocuments() {
            const ctx = strapi.requestContext.get();
            try {
                console.log(
                    '****************CREATING KLUBR DOCUMENTS*******************',
                );
                /* KLUBR CHECK */
                const { uuid } = ctx.params;
                const entityWithUUID: KlubrEntity = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid },
                        populate: {
                            klubr_document: true,
                        },
                    });
                if (!entityWithUUID) {
                    return ctx.badRequest(`Klub avec UUID ${uuid} non trouvé`);
                }
                if (!!entityWithUUID.klubr_document) {
                    return ctx.badRequest(
                        `Le klubr avec UUID ${uuid} a déjà des documents`,
                    );
                }

                /* KLUBR DOCUMENT CREATE */
                const klubrDocuments: KlubrDocumentEntity = await strapi
                    .documents('api::klubr-document.klubr-document')
                    .create({
                        data: {
                            klubr: entityWithUUID.id,
                        },
                    });
                return ctx.send(klubrDocuments);
            } catch (error) {
                console.error(error);
                return ctx.internalServerError(
                    'Erreur lors de la création des documents',
                );
            }
        },
        async getFileDocuments() {
            const ctx = strapi.requestContext.get();
            try {
                /* KLUBR CHECK */
                const { uuid, doc } = ctx.params;
                const entityWithUUID: KlubrEntity = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid },
                        populate: {
                            klubr_document: true,
                        },
                    });
                if (!entityWithUUID) {
                    return ctx.badRequest(`Klub avec UUID ${uuid} non trouvé`);
                }

                /* KLUBR DOCUMENT CHECK */
                let klubrDocument: KlubrDocumentEntity =
                    entityWithUUID.klubr_document;
                if (!klubrDocument) {
                    return ctx.notFound('Aucun document trouvé');
                }

                let document = null;
                switch (doc) {
                    case 'justifDomicileDirigeant':
                    case 'justifDesignationPresident':
                    case 'statutsAssociation':
                    case 'ribAssociation':
                    case 'avisSituationSIRENE':
                    case 'attestationAffiliationFederation':
                        document = klubrDocument[doc];
                        break;
                    default:
                        return ctx.badRequest('Champ de fichier inconnu');
                }
                if (!document?.path) {
                    return ctx.notFound('Aucun document trouvé');
                }
                if (!fs.existsSync(document.path)) {
                    return ctx.notFound('Fichier introuvable');
                }

                const docType = mime.lookup(document.path);
                const pdfFile = fs.readFileSync(document.path);
                ctx.response.type = document.mime || 'application/pdf';
                ctx.response.attachment(
                    `${document.name || 'fichier'}.${document.ext}`,
                );
                ctx.set('Access-Control-Expose-Headers', 'Content-Disposition');
                ctx.body = pdfFile;
            } catch (e) {
                console.log(e);
                ctx.status = 500;
                ctx.body = { message: `Erreur interne du serveur, ${e}` };
            }
        },
        async validateDocuments() {
            const ctx = strapi.requestContext.get();
            try {
                const { uuid } = ctx.params;

                /* KLUBR CHECK */
                let entityWithUUID: KlubrEntity = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid },
                        populate: {
                            klubr_document: true,
                        },
                    });
                if (!entityWithUUID) {
                    return ctx.badRequest(`Klub avec UUID ${uuid} non trouvé`);
                }

                /* BODY CHECK */
                const acceptedDocTypes = [
                    'justifDomicileDirigeant',
                    'justifDesignationPresident',
                    'statutsAssociation',
                    'ribAssociation',
                    'avisSituationSIRENE',
                    'attestationAffiliationFederation',
                ].map((doc) => `${doc}Valide`);

                const data = {};
                for (const key in ctx.request.body.data) {
                    if (acceptedDocTypes.includes(key)) {
                        data[key] = ctx.request.body.data[key];
                    }
                }

                /* KLUBR DOCUMENT CHECK */
                let klubrDocument: KlubrDocumentEntity =
                    entityWithUUID.klubr_document;
                if (!klubrDocument) {
                    return ctx.notFound('Aucun document trouvé');
                }

                /* UPDATE KLUBR DOCUMENT */
                let updatedKlubrDocument = await strapi
                    .documents('api::klubr-document.klubr-document')
                    .update({
                        documentId: klubrDocument.documentId,
                        data,
                    });
                entityWithUUID.klubr_document = updatedKlubrDocument;

                /* UPDATE KLUBR INFOS */
                const klubr_info = await strapi
                    .service('api::klubr.klubr')
                    .setKlubrInfosRequiredDocsCompletion(
                        entityWithUUID.id,
                        updatedKlubrDocument,
                    );

                if (klubr_info) {
                    entityWithUUID = {
                        ...entityWithUUID,
                        klubr_info,
                    };
                }

                return entityWithUUID;
            } catch (e) {
                console.log(e);
                ctx.status = 500;
                ctx.body = { message: `Erreur interne du serveur, ${e}` };
            }
        },
        async createKlubrByMember() {
            const ctx = strapi.requestContext.get();
            try {
                const memberUuid = ctx.params['memberUuid'];

                if (!ctx.request.body?.data?.formToken) {
                    return ctx.badRequest('Missing reCaptcha token.');
                }
                const result = await createAssessment({
                    token: ctx.request.body?.data?.formToken,
                    recaptchaAction: 'CREATE_KLUBR_BY_MEMBER',
                });
                if (!result) {
                    return ctx.badRequest('Captcha verification failed');
                }

                if (!memberUuid) {
                    return ctx.badRequest(`KlubrMember uuid missing`);
                }

                const klubrMember: KlubrMemberEntity = await strapi.db
                    .query('api::klubr-membre.klubr-membre')
                    .findOne({
                        where: { uuid: memberUuid },
                        populate: { klubr: true },
                    });

                if (!klubrMember) {
                    return ctx.notFound(
                        `Entity with UUID ${memberUuid} not found`,
                    );
                }
                if (klubrMember.klubr) {
                    return ctx.badRequest(`Member already linked`);
                }

                /* SLUG */
                if (!ctx.request.body.data?.slug || ctx.request.body.data.slug === 'null') {
                    if (ctx.request.body.data.denomination) {
                        try {
                            ctx.request.body.data.slug = await strapi
                                .service('api::klubr.klubr')
                                .getSlug(ctx.request.body.data.denomination);
                        } catch (error) {
                            return ctx.badRequest(error.message);
                        }
                    }
                }

                /* GET DEFAULT TRADE POLICY */
                const defaultTradePolicyId: TradePolicyEntity = await strapi
                    .service('api::trade-policy.trade-policy')
                    .getDefaultTradePolicy();

                const gPlace = ctx.request.body.data.googlePlace;

                let federationId = isNaN(ctx.request.body.data.federationLink)
                    ? null
                    : Number(ctx.request.body.data.federationLink);

                if (federationId) {
                    const entity: FederationEntity = await strapi.db
                        .query('api::federation.federation')
                        .findOne({
                            where: { id: federationId },
                        });
                    federationId = entity ? (entity.id as number) : null;
                }

                /* CREATE KLUBR */
                const entity: KlubrEntity = await strapi
                    .documents('api::klubr.klubr')
                    .create({
                        // TODO: make fields optional to remove ts-ignore
                        // @ts-ignore
                        data: {
                            denomination: ctx.request.body.data.denomination,
                            acronyme: ctx.request.body.data.acronyme,
                            sportType: ctx.request.body.data.sportType,
                            legalStatus: ctx.request.body.data.legalStatus,
                            siegeSocialAdresse: getAddress(gPlace),
                            siegeSocialCP: getPostCode(gPlace),
                            siegeSocialVille: getCity(gPlace),
                            siegeSocialPays: getCountry(gPlace),
                            siegeSocialDepartement: getDistrict(gPlace),
                            siegeSocialRegion: getState(gPlace),
                            webSite: getWebSite(gPlace),
                            googlePlace: ctx.request.body.data.googlePlace,
                            trade_policy: defaultTradePolicyId,
                            federationLink: federationId,
                            slug: ctx.request.body.data.slug,
                        },
                    });

                /* CREATE KLUBR HOUSE */
                let klubrHouseSlug: string;
                try {
                    klubrHouseSlug = await strapi
                        .service('api::klubr-house.klubr-house')
                        .getSlug(ctx.request.body.data.denomination);
                } catch (error) {
                    return ctx.badRequest(error.message);
                }
                const res: KlubrHouseEntity = await strapi
                    .documents('api::klubr-house.klubr-house')
                    .create({
                        // TODO: make fields optional to remove ts-ignore
                        // @ts-ignore
                        data: {
                            title: ctx.request.body.data.denomination,
                            klubr: entity?.id,
                            slug: klubrHouseSlug,
                            description: [
                                {
                                    type: 'paragraph',
                                    children: [
                                        {
                                            type: 'text',
                                            text: 'Décrivez ici votre club (historique, objectifs, valeurs, etc.) ...',
                                        },
                                    ],
                                },
                            ],
                        },
                    });

                /* CREATE klubr-documents && klubr-infos */
                /* UPDATE KLUBR INFOS */
                const klubr_info1 = await strapi
                    .service('api::klubr.klubr')
                    .setKlubrInfosRequiredFieldsCompletion(entity, true);

                const klubr_info2 = {
                    requiredDocsValidatedCompletion: 0,
                    requiredDocsWaitingValidationCompletion: 0,
                    requiredDocsRefusedCompletion: 0,
                };
                await strapi.documents('api::klubr-info.klubr-info').create({
                    data: {
                        klubr: entity?.id,
                        ...klubr_info1,
                        ...klubr_info2,
                    },
                });
                await strapi
                    .documents('api::klubr-document.klubr-document')
                    .create({
                        data: {
                            klubr: entity?.id,
                        },
                    });

                const googleMap = getGmapObj(gPlace);
                const club_presentation = [
                    {
                        __component: 'club-presentation.localisation',
                        titre: 'Où sommes-nous ?',
                        telContact: getPhone(gPlace) || '',
                        emailContact: klubrMember.email || null,
                        adresseComplete: [
                            {
                                type: 'paragraph',
                                children: [
                                    {
                                        text: getAddress(gPlace) + ',',
                                        type: 'text',
                                    },
                                ],
                            },
                            {
                                type: 'paragraph',
                                children: [
                                    {
                                        text:
                                            getPostCode(gPlace) +
                                            ', ' +
                                            getCity(gPlace),
                                        type: 'text',
                                    },
                                ],
                            },
                            {
                                type: 'paragraph',
                                children: [
                                    {
                                        text:
                                            getDistrict(gPlace) +
                                            ', ' +
                                            getState(gPlace),
                                        type: 'text',
                                    },
                                ],
                            },
                        ],
                        googleMap,
                    },
                ];

                await strapi.documents('api::klubr-house.klubr-house').update({
                    documentId: res.documentId,
                    data: {
                        // TODO: make fields optional to remove ts-ignore
                        // @ts-ignore
                        club_presentation: club_presentation,
                    },
                });

                const member = await strapi
                    .documents('api::klubr-membre.klubr-membre')
                    .update({
                        documentId: klubrMember.documentId,
                        data: {
                            klubr: entity?.id,
                        },
                    });

                await strapi.services[
                    'api::klubr-membre.klubr-membre'
                ].sendClubCreationEmail({ ...member, klubr: entity });
                return entity;
            } catch (e) {
                console.log(e);
                return ctx.badRequest(
                    `An error occured while creating club: ${e}`,
                );
            }
        },
        async getKlubrStats() {
            const ctx = strapi.requestContext.get();
            try {
                /* KLUBR CHECK */
                const { uuid } = ctx.params;
                let result = {
                    infos: {
                        requiredFieldsCompletion: 0,
                        requiredDocsValidated: 0,
                    },
                    projects: {
                        nbPublishedProjects: 0,
                        nbProjectTmpl: undefined,
                    },
                    members: {
                        nbActiveMembers: 0,
                    },
                    donations: {
                        forKlub: {
                            fromPro: {
                                totalAmount: 0,
                                nbDonations: 0,
                            },
                            fromPart: {
                                totalAmount: 0,
                                nbDonations: 0,
                            },
                            total: {
                                totalAmount: 0,
                                nbDonations: 0,
                            },
                        },
                        forProjects: {
                            fromPro: {
                                totalAmount: 0,
                                nbDonations: 0,
                            },
                            fromPart: {
                                totalAmount: 0,
                                nbDonations: 0,
                            },
                            total: {
                                totalAmount: 0,
                                nbDonations: 0,
                            },
                        },
                        total: {
                            fromPro: {
                                totalAmount: 0,
                                nbDonations: 0,
                            },
                            fromPart: {
                                totalAmount: 0,
                                nbDonations: 0,
                            },
                            total: {
                                totalAmount: 0,
                                nbDonations: 0,
                            },
                        },
                    },
                };
                const entityWithUUID: KlubrEntity = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid },
                        populate: {
                            klubr_document: true,
                            klubr_info: true,
                            template_projects_libraries: true,
                        },
                    });
                if (!entityWithUUID) {
                    return ctx.badRequest(`Klub avec UUID ${uuid} non trouvé`);
                }
                const klubId = entityWithUUID.id;
                /* INFOS */
                result.infos.requiredFieldsCompletion =
                    entityWithUUID.klubr_info?.requiredFieldsCompletion || 0;
                result.infos.requiredDocsValidated =
                    ((entityWithUUID.klubr_info
                        ?.requiredDocsValidatedCompletion || 0) /
                        100) *
                    5;

                /* NB PROJETS */
                try {
                    const klubrFilters = [
                        {
                            klubr: {
                                id: {
                                    $eq: klubId,
                                },
                            },
                            status: {
                                $eq: 'published',
                            },
                        },
                    ];

                    const filters = {
                        $and: [
                            ...[{ isTemplate: { $eq: false } }],
                            ...klubrFilters,
                        ],
                    };

                    result.projects.nbPublishedProjects = await strapi.db
                        .query('api::klub-projet.klub-projet')
                        .count({ where: filters });
                } catch (e) {
                    console.error('error getting projects by club', e);
                }

                /* NB PROJETS TMPL */
                try {
                    const klubrFilters = [
                        {
                            klubr: {
                                id: {
                                    $eq: klubId,
                                },
                            },
                        },
                    ];

                    const filters = {
                        $and: [
                            ...[{ isTemplate: { $eq: true } }],
                            ...klubrFilters,
                        ],
                    };

                    result.projects.nbProjectTmpl = await strapi.db
                        .query('api::klub-projet.klub-projet')
                        .count({ where: filters });
                } catch (e) {
                    console.error('error getting project templates', e);
                }

                /* Nb Dons */
                try {
                    const [donations, DonationCount] = await strapi.db
                        .query('api::klub-don.klub-don')
                        .findWithCount({
                            select: [
                                'documentId',
                                'montant',
                                'attestationNumber',
                                'id',
                                'estOrganisme',
                            ],
                            where: {
                                klubr: {
                                    id: {
                                        $eq: klubId,
                                    },
                                },
                                statusPaiment: {
                                    $eq: 'success',
                                },
                            },
                            populate: {
                                klub_projet: {
                                    fields: ['id'],
                                },
                            },
                        });
                    donations.map((donation: KlubDonEntity) =>
                        console.log(
                            '>>>>',
                            donation.montant,
                            donation.attestationNumber,
                            donation.klub_projet?.id,
                        ),
                    );
                    /* Nb Dons: For Project */
                    const projectDonations = (
                        donations as Array<KlubDonEntity>
                    ).filter((don) => !!don.klub_projet);
                    const projectDonationsFromPro = projectDonations.filter(
                        (don) => don.estOrganisme,
                    );
                    const projectDonationsFromPart = projectDonations.filter(
                        (don) => !don.estOrganisme,
                    );
                    result.donations.forProjects.fromPro.totalAmount =
                        projectDonationsFromPro.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forProjects.fromPro.nbDonations =
                        projectDonationsFromPro.length;
                    result.donations.forProjects.fromPart.totalAmount =
                        projectDonationsFromPart.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forProjects.fromPart.nbDonations =
                        projectDonationsFromPart.length;
                    result.donations.forProjects.total.totalAmount =
                        projectDonations.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forProjects.total.nbDonations =
                        projectDonations.length;

                    /* Nb Dons: For Klub */
                    const klubDonations = (
                        donations as Array<KlubDonEntity>
                    ).filter((don) => !don.klub_projet);
                    const klubDonationsFromPro = klubDonations.filter(
                        (don) => don.estOrganisme,
                    );
                    const klubDonationsFromPart = klubDonations.filter(
                        (don) => !don.estOrganisme,
                    );
                    result.donations.forKlub.fromPro.totalAmount =
                        klubDonationsFromPro.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forKlub.fromPro.nbDonations =
                        klubDonationsFromPro.length;
                    result.donations.forKlub.fromPart.totalAmount =
                        klubDonationsFromPart.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forKlub.fromPart.nbDonations =
                        klubDonationsFromPart.length;
                    result.donations.forKlub.total.totalAmount =
                        klubDonations.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forKlub.total.nbDonations =
                        klubDonations.length;

                    /* Nb Dons: Totals */
                    const donationsFromPro = (
                        donations as Array<KlubDonEntity>
                    ).filter((don) => don.estOrganisme);
                    const donationsFromPart = (
                        donations as Array<KlubDonEntity>
                    ).filter((don) => !don.estOrganisme);
                    result.donations.total.fromPro.totalAmount =
                        donationsFromPro.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.total.fromPro.nbDonations =
                        donationsFromPro.length;
                    result.donations.total.fromPart.totalAmount =
                        donationsFromPart.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.total.fromPart.nbDonations =
                        donationsFromPart.length;
                    result.donations.total.total.totalAmount = donations.reduce(
                        (acc, entry) => acc + entry.montant,
                        0,
                    );
                    result.donations.total.total.nbDonations = donations.length;
                } catch (e) {
                    console.error('error getting donations by club', e);
                }

                /* Nb Membres */
                try {
                    const [membersOfklub, membersOfklubCount] = await strapi.db
                        .query('api::klubr-membre.klubr-membre')
                        .findWithCount({
                            select: ['id', 'documentId'],
                            where: {
                                klubr: {
                                    id: {
                                        $eq: klubId,
                                    },
                                },
                                $and: [
                                    {
                                        role: {
                                            $ne: 'AdminEditor',
                                        },
                                    },
                                    {
                                        role: {
                                            $ne: 'Admin',
                                        },
                                    },
                                ],
                                users_permissions_user: {
                                    $ne: null,
                                },
                            },
                        });
                    result.members.nbActiveMembers = membersOfklubCount;
                } catch (e) {
                    console.error('error getting members by club', e);
                }

                return result;
            } catch (e) {
                console.log(e);
                ctx.status = 500;
                ctx.body = { message: `Erreur interne du serveur, ${e}` };
            }
        },
        async getAllKlubrStats() {
            const ctx = strapi.requestContext.get();
            let result = {
                projects: {
                    nbPublishedProjects: 0,
                    nbProjectTmpl: undefined,
                },
                members: {
                    nbActiveMembers: 0,
                },
                donations: {
                    forKlub: {
                        fromPro: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        fromPart: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        total: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                    },
                    forProjects: {
                        fromPro: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        fromPart: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        total: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                    },
                    forKlubContribution: {
                        fromPro: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        fromPart: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        total: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                    },
                    forProjectsContribution: {
                        fromPro: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        fromPart: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        total: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                    },
                    total: {
                        fromPro: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        fromPart: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        total: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                    },
                    totalContribution: {
                        fromPro: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        fromPart: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                        total: {
                            totalAmount: 0,
                            nbDonations: 0,
                        },
                    },
                },
            };
            try {
                /* NB PROJETS */
                try {
                    const klubrFilters = [
                        {
                            status: {
                                $eq: 'published',
                            },
                        },
                    ];

                    const filters = {
                        $and: [
                            ...[{ isTemplate: { $eq: false } }],
                            ...klubrFilters,
                        ],
                    };

                    result.projects.nbPublishedProjects = await strapi.db
                        .query('api::klub-projet.klub-projet')
                        .count({ where: filters });
                } catch (e) {
                    console.error('error getting projects by club', e);
                }

                /* NB PROJETS TMPL */
                try {
                    const filters = {
                        $and: [...[{ isTemplate: { $eq: true } }]],
                    };

                    result.projects.nbProjectTmpl = await strapi.db
                        .query('api::klub-projet.klub-projet')
                        .count({ where: filters });
                } catch (e) {
                    console.error('error getting project templates', e);
                }

                /* Nb Dons */
                try {
                    const [donations, donationCount] = await strapi.db
                        .query('api::klub-don.klub-don')
                        .findWithCount({
                            select: [
                                'documentId',
                                'montant',
                                'attestationNumber',
                                'id',
                                'estOrganisme',
                                'isContributionDonation',
                            ],
                            where: {
                                statusPaiment: {
                                    $eq: 'success',
                                },
                                isContributionDonation: {
                                    $eq: false,
                                },
                            },
                            populate: {
                                klub_projet: {
                                    fields: ['id'],
                                },
                            },
                        });
                    const [contributions, contributionCount] = await strapi.db
                        .query('api::klub-don.klub-don')
                        .findWithCount({
                            select: [
                                'documentId',
                                'montant',
                                'attestationNumber',
                                'id',
                                'estOrganisme',
                                'isContributionDonation',
                            ],
                            where: {
                                statusPaiment: {
                                    $eq: 'success',
                                },
                                isContributionDonation: {
                                    $eq: true,
                                },
                            },
                            populate: {
                                klub_don: {
                                    populate: {
                                        klub_projet: {
                                            fields: ['id'],
                                        },
                                    },
                                },
                            },
                        });
                    /* Nb Dons: For Project */
                    const projectDonations = (
                        donations as Array<KlubDonEntity>
                    ).filter((don) => !!don.klub_projet);
                    const projectDonationsFromPro = projectDonations.filter(
                        (don) => don.estOrganisme,
                    );
                    const projectDonationsFromPart = projectDonations.filter(
                        (don) => !don.estOrganisme,
                    );
                    result.donations.forProjects.fromPro.totalAmount =
                        projectDonationsFromPro.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forProjects.fromPro.nbDonations =
                        projectDonationsFromPro.length;
                    result.donations.forProjects.fromPart.totalAmount =
                        projectDonationsFromPart.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forProjects.fromPart.nbDonations =
                        projectDonationsFromPart.length;
                    result.donations.forProjects.total.totalAmount =
                        projectDonations.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forProjects.total.nbDonations =
                        projectDonations.length;

                    /* Nb Contribution: For Project */
                    const projectContributionDonations = (
                        contributions as Array<KlubDonEntity>
                    ).filter((don) => !!don.klub_don?.klub_projet);
                    const projectContributionDonationsFromPro =
                        projectContributionDonations.filter(
                            (don) => don.estOrganisme,
                        );
                    const projectContributionDonationsFromPart =
                        projectContributionDonations.filter(
                            (don) => !don.estOrganisme,
                        );
                    result.donations.forProjectsContribution.fromPro.totalAmount =
                        projectContributionDonationsFromPro.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forProjectsContribution.fromPro.nbDonations =
                        projectContributionDonationsFromPro.length;
                    result.donations.forProjectsContribution.fromPart.totalAmount =
                        projectContributionDonationsFromPart.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forProjectsContribution.fromPart.nbDonations =
                        projectContributionDonationsFromPart.length;
                    result.donations.forProjectsContribution.total.totalAmount =
                        projectContributionDonations.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forProjectsContribution.total.nbDonations =
                        projectContributionDonations.length;

                    /* Nb Dons: For Klub */
                    const klubDonations = (
                        donations as Array<KlubDonEntity>
                    ).filter((don) => !don.klub_projet);
                    const klubDonationsFromPro = klubDonations.filter(
                        (don) => don.estOrganisme,
                    );
                    const klubDonationsFromPart = klubDonations.filter(
                        (don) => !don.estOrganisme,
                    );
                    result.donations.forKlub.fromPro.totalAmount =
                        klubDonationsFromPro.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forKlub.fromPro.nbDonations =
                        klubDonationsFromPro.length;
                    result.donations.forKlub.fromPart.totalAmount =
                        klubDonationsFromPart.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forKlub.fromPart.nbDonations =
                        klubDonationsFromPart.length;
                    result.donations.forKlub.total.totalAmount =
                        klubDonations.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forKlub.total.nbDonations =
                        klubDonations.length;

                    /* Nb Contribution: For Klub */
                    const klubContributionDonations = (
                        contributions as Array<KlubDonEntity>
                    ).filter((don) => !don.klub_don?.klub_projet);
                    const klubContributionDonationsFromPro =
                        klubContributionDonations.filter(
                            (don) => don.estOrganisme,
                        );
                    const klubContributionDonationsFromPart =
                        klubContributionDonations.filter(
                            (don) => !don.estOrganisme,
                        );
                    result.donations.forKlubContribution.fromPro.totalAmount =
                        klubContributionDonationsFromPro.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forKlubContribution.fromPro.nbDonations =
                        klubContributionDonationsFromPro.length;
                    result.donations.forKlubContribution.fromPart.totalAmount =
                        klubContributionDonationsFromPart.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forKlubContribution.fromPart.nbDonations =
                        klubContributionDonationsFromPart.length;
                    result.donations.forKlubContribution.total.totalAmount =
                        klubContributionDonations.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.forKlubContribution.total.nbDonations =
                        klubContributionDonations.length;

                    /* Nb Dons: Totals */
                    const donationsFromPro = (
                        donations as Array<KlubDonEntity>
                    ).filter((don) => don.estOrganisme);
                    const donationsFromPart = (
                        donations as Array<KlubDonEntity>
                    ).filter((don) => !don.estOrganisme);
                    result.donations.total.fromPro.totalAmount =
                        donationsFromPro.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.total.fromPro.nbDonations =
                        donationsFromPro.length;
                    result.donations.total.fromPart.totalAmount =
                        donationsFromPart.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.total.fromPart.nbDonations =
                        donationsFromPart.length;
                    result.donations.total.total.totalAmount = (
                        donations as Array<KlubDonEntity>
                    ).reduce((acc, entry) => acc + entry.montant, 0);
                    result.donations.total.total.nbDonations = (
                        donations as Array<KlubDonEntity>
                    ).length;

                    /* Nb Contributions: Totals */
                    const contributionDonationsFromPro = (
                        contributions as Array<KlubDonEntity>
                    ).filter((don) => don.estOrganisme);
                    const contributionDonationsFromPart = (
                        contributions as Array<KlubDonEntity>
                    ).filter((don) => !don.estOrganisme);
                    result.donations.totalContribution.fromPro.totalAmount =
                        contributionDonationsFromPro.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.totalContribution.fromPro.nbDonations =
                        contributionDonationsFromPro.length;
                    result.donations.totalContribution.fromPart.totalAmount =
                        contributionDonationsFromPart.reduce(
                            (acc, entry) => acc + entry.montant,
                            0,
                        );
                    result.donations.totalContribution.fromPart.nbDonations =
                        contributionDonationsFromPart.length;
                    result.donations.totalContribution.total.totalAmount = (
                        contributions as Array<KlubDonEntity>
                    ).reduce((acc, entry) => acc + entry.montant, 0);
                    result.donations.totalContribution.total.nbDonations = (
                        contributions as Array<KlubDonEntity>
                    ).length;
                } catch (e) {
                    console.error('error getting donations by club', e);
                }

                /* Nb Membres */
                try {
                    const [membersOfklub, membersOfklubCount] = await strapi.db
                        .query('api::klubr-membre.klubr-membre')
                        .findWithCount({
                            select: ['id', 'documentId'],
                            where: {
                                $and: [
                                    {
                                        role: {
                                            $ne: 'AdminEditor',
                                        },
                                    },
                                    {
                                        role: {
                                            $ne: 'Admin',
                                        },
                                    },
                                ],
                                users_permissions_user: {
                                    $ne: null,
                                },
                            },
                        });
                    result.members.nbActiveMembers = membersOfklubCount;
                } catch (e) {
                    console.error('error getting members by club', e);
                }

                return result;
            } catch (e) {
                console.log(e);
                ctx.status = 500;
                ctx.body = { message: `Erreur interne du serveur, ${e}` };
            }
        },
    }),
);
