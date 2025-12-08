/**
 * klub-projet controller
 */

import { Core, factories } from '@strapi/strapi';
import {
    KlubProjetEntity,
    KlubrEntity,
    KlubrMemberEntity,
    PageHomeEntity,
    PaginationEntity,
    TemplateProjectsCategoryEntity,
    UserEntity,
} from '../../../_types';
import { removeCodes, removeId } from '../../../helpers/sanitizeHelpers';
import {
    memberIsMember,
    profileIsKlubrAdmin,
    profileIsKlubrAdminEditor,
    profileIsKlubrLeader,
    profileIsKlubrNetwork,
} from '../../../helpers/permissions';
import { PROJECT_STATUS } from '../../../helpers/projectStatus';
import {
    BREVO_TEMPLATES,
    sendBrevoTransacEmail,
} from '../../../helpers/emails/sendBrevoTransacEmail';
import {
    checkSvgAndTransform,
    MEDIAS_TRANSFORMATIONS,
} from '../../../helpers/medias';
import GeneratePoster from '../../../helpers/klubrPDF/generatePoster';
import convertPdfToImage from '../../../helpers/klubrPDF/funcs/convertPdfToImage';

export default factories.createCoreController(
    'api::klub-projet.klub-projet',
    ({ strapi }: { strapi: Core.Strapi }) => ({
        async findOne() {
            const ctx = strapi.requestContext.get();
            try {
                const { id } = ctx.params;
                if (!id) {
                    return ctx.badRequest('Missing project uuid.');
                }
                ctx.query = {
                    ...ctx.query,
                    filters: {
                        uuid: id,
                        ...(ctx.query.filters as Record<string, any>),
                    },
                };
                await this.validateQuery(ctx);

                const sanitizedQueryParams = await this.sanitizeQuery(ctx);

                const {
                    results,
                    pagination,
                }: {
                    results: Array<KlubProjetEntity>;
                    pagination: PaginationEntity;
                } = await strapi
                    .service('api::klub-projet.klub-projet')
                    .find(sanitizedQueryParams);

                if (results.length === 0) {
                    return ctx.notFound('Project not found');
                }

                const entity = results[0];
                const sanitizedResult = await this.sanitizeOutput(entity, ctx);
                return removeId(removeCodes(sanitizedResult));
            } catch (e) {
                console.log('Error retrieving Project', e);
            }
        },

        async find() {
            const ctx = strapi.requestContext.get();
            try {
                if (ctx.query?.filters && ctx.query?.filters['id']) {
                    delete ctx.query.filters['id'];
                }

                await this.validateQuery(ctx);
                const sanitizedQueryParams: Record<string, any> =
                    await this.sanitizeQuery(ctx);
                if (
                    sanitizedQueryParams?.populate &&
                    sanitizedQueryParams?.populate['length']
                ) {
                    sanitizedQueryParams.populate = [
                        ...(sanitizedQueryParams.populate as any),
                        'tmplReference.klubr.logo',
                        'tmplReference.template_projects_category.template_projects_library',
                    ];
                } else {
                    sanitizedQueryParams.populate = {
                        ...(sanitizedQueryParams.populate as any),
                        tmplReference: {
                            populate: {
                                klubr: {
                                    populate: {
                                        logo: true,
                                    },
                                },
                                template_projects_category: {
                                    populate: {
                                        template_projects_library: true,
                                    },
                                },
                            },
                        },
                    };
                }
                let resultsFeatured = [];

                if (ctx.query['featured']) {
                    // Get featured clubs from home page
                    const homePage: PageHomeEntity = await strapi.db
                        .query('api::page-home.page-home')
                        .findOne({ populate: ['klub_projets_featured'] });
                    const homePageFeaturedProjects =
                        homePage.klub_projets_featured.map(
                            (klub: KlubrEntity) => klub.id,
                        );
                    // Create a new query to get featured clubs
                    // @ts-ignore
                    const { featured, ...sanitizedQueryParamsFeatured } = {
                        ...sanitizedQueryParams,
                    };
                    sanitizedQueryParamsFeatured['filters'] = {
                        id: {
                            $in: homePageFeaturedProjects,
                        },
                    };
                    // Get featured clubs
                    try {
                        resultsFeatured = await strapi
                            .documents('api::klub-projet.klub-projet')
                            .findMany(sanitizedQueryParamsFeatured);
                    } catch (e) {
                        console.error('error getting featured Projects', e);
                    }
                    // Update the query to get the remaining clubs
                    if (
                        +sanitizedQueryParams.pagination?.pageSize >
                        resultsFeatured?.length
                    ) {
                        sanitizedQueryParams.pagination.pageSize = `${
                            +sanitizedQueryParams.pagination.pageSize -
                            resultsFeatured.length
                        }`;
                    } else {
                        if (
                            +sanitizedQueryParams.pagination?.pageSize <
                            resultsFeatured?.length
                        ) {
                            resultsFeatured = resultsFeatured.slice(
                                0,
                                +sanitizedQueryParams.pagination.pageSize,
                            );
                        }
                        sanitizedQueryParams.pagination.pageSize = '0';
                    }
                    // Remove featured clubs from the query
                    sanitizedQueryParams.filters =
                        sanitizedQueryParams.filters || {};
                    sanitizedQueryParams.filters.id = {
                        $notIn: homePageFeaturedProjects,
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
                    results: Array<KlubProjetEntity>;
                    pagination: PaginationEntity;
                } =
                    sanitizedQueryParams.pagination?.pageSize !== '0'
                        ? await strapi
                              .service('api::klub-projet.klub-projet')
                              .find(sanitizedQueryParams)
                        : { results: [], pagination: {} };

                results = [...resultsFeatured, ...results];

                results =
                    await strapi.services[
                        'api::klub-projet.klub-projet'
                    ].populateTmplRef(results);

                const sanitizedResult = await this.sanitizeOutput(results, ctx);
                return {
                    data: removeId(removeCodes(sanitizedResult)),
                    meta: { pagination },
                };
            } catch (e) {
                console.log('Error retrieving Projects', e);
                return [];
            }
        },

        async findBySlug() {
            const ctx = strapi.requestContext.get();
            try {
                const { id } = ctx.params;
                if (!id) {
                    return ctx.badRequest('Missing project slug parameter.');
                }
                if (!isNaN(Number(id))) {
                    console.log('La valeur est un nombre.');
                } else {
                    console.log("La valeur n'est pas un nombre.");
                }
                console.log('findBySlug > filters', ctx.query.filters);
                let entries: Array<KlubProjetEntity> = await strapi
                    .documents('api::klub-projet.klub-projet')
                    .findMany({
                        filters: {
                            $and: [
                                { isTemplate: { $eq: false } },
                                {
                                    slug: {
                                        $eq: id,
                                    },
                                },
                                ctx.query.filters,
                            ],
                        },
                        populate: {
                            tmplReference: {
                                populate: {
                                    klubr: {
                                        populate: {
                                            logo: true,
                                        },
                                    },
                                    template_projects_category: {
                                        populate: {
                                            template_projects_library: true,
                                        },
                                    },
                                },
                            },
                            klubr: true,
                            couverture: true,
                            klubr_membre: {
                                populate: {
                                    avatar: true,
                                    // TODO: Find a way to add count
                                    /*klub_projets: {
                                        count: true,
                                    },*/
                                },
                            },
                            contenu: {
                                on: {
                                    'composant-atoms.section-texte-image': {
                                        populate: {
                                            image: true,
                                        },
                                    },
                                    'composant-atoms.slider': {
                                        populate: {
                                            media: true,
                                        },
                                    },
                                },
                            },
                            realisations: {
                                on: {
                                    'composant-atoms.section-texte-image': {
                                        populate: {
                                            image: true,
                                        },
                                    },
                                },
                            },
                        },
                    });
                console.log('ENTRIES', entries);
                if (entries.length === 0) {
                    return ctx.notFound('Project not found');
                }
                entries =
                    await strapi.services[
                        'api::klub-projet.klub-projet'
                    ].populateTmplRef(entries);

                const sanitizedResult = await this.sanitizeOutput(
                    entries[0],
                    ctx,
                );
                return removeId(removeCodes(sanitizedResult));
            } catch (e) {
                console.log('Error retrieving Project by slug', e);
                return ctx.badRequest('Error retrieving Project by slug');
            }
        },

        async findByKlubId() {
            const ctx = strapi.requestContext.get();
            try {
                let { start, limit, pagination, exceptId } = ctx.query as {
                    start?: string;
                    limit?: string;
                    pagination?: { page: string; pageSize: string };
                    exceptId?: string;
                };
                const { id } = ctx.params;
                if (pagination?.page && pagination?.pageSize) {
                    start = `${
                        (parseInt(pagination.page) - 1) *
                        parseInt(pagination.pageSize)
                    }`;
                    limit = pagination.pageSize;
                } else {
                    start = start || '0';
                    limit = limit || '10';
                }
                const klubrFilters = !!id
                    ? [
                          {
                              klubr: {
                                  uuid: {
                                      $eq: id,
                                  },
                              },
                          },
                      ]
                    : [];
                const exceptFilter = !!exceptId
                    ? [
                          {
                              uuid: {
                                  $ne: exceptId,
                              },
                          },
                      ]
                    : [];

                const filters = {
                    $and: [
                        ...[{ isTemplate: { $eq: false } }],
                        ...klubrFilters,
                        ...exceptFilter,
                        ctx.query.filters || {},
                    ],
                };

                const count = await strapi.db
                    .query('api::klub-projet.klub-projet')
                    .count({ where: filters });

                let entries: Array<KlubProjetEntity> = await strapi
                    .documents('api::klub-projet.klub-projet')
                    .findMany({
                        start: Number(start),
                        limit: Number(limit),
                        sort: ctx.query.sort || 'createdAt:desc',
                        filters,
                        populate: {
                            tmplReference: {
                                populate: {
                                    klubr: {
                                        populate: {
                                            logo: true,
                                        },
                                    },
                                    template_projects_category: {
                                        populate: {
                                            template_projects_library: true,
                                        },
                                    },
                                },
                            },
                            couverture: true,
                            klubr_membre: {
                                populate: {
                                    avatar: true,
                                    // klub_projets: {
                                    //     count: true,
                                    // },
                                },
                            },
                        },
                    });

                entries = await strapi.services[
                    'api::klub-projet.klub-projet'
                ].populateTmplRef(entries, id);

                const sanitizedResult = await this.sanitizeOutput(entries, ctx);

                const pageSize = parseInt(limit as string) || count;
                const paginationOutput = {
                    total: count,
                    pageSize,
                    pageCount: Math.ceil(count / (pageSize || 1)),
                    currentPage: Math.floor(
                        (Number(start) || 1) / (Number(limit) || 0) + 1,
                    ),
                };
                ctx.body = {
                    data: removeId(removeCodes(sanitizedResult)),
                    pagination: paginationOutput,
                };
            } catch (e) {
                console.log('Error retrieving Project by Klub UUID', e);
            }
        },

        async update() {
            const ctx = strapi.requestContext.get();
            // prevent filtering by id, but by uuid
            const { id } = ctx.params;
            const { user }: { user?: UserEntity } = ctx.state;
            let sendEmailConfig = null;
            if (!id) {
                return ctx.badRequest('Missing UUID.');
            }

            // GET CURRENT PROFILE
            let profile: KlubrMemberEntity;
            if (user?.last_member_profile_used) {
                profile = await strapi.db
                    .query('api::klubr-membre.klubr-membre')
                    .findOne({
                        where: { uuid: user.last_member_profile_used },
                        populate: { klubr: true },
                    });
            } else {
                return ctx.unauthorized('Unauthorized');
            }

            // GET ENTITY WITH UUID
            const entityWithUUID: KlubProjetEntity = await strapi.db
                .query('api::klub-projet.klub-projet')
                .findOne({
                    select: [
                        'id',
                        'documentId',
                        'uuid',
                        'status',
                        'titre',
                        'montantAFinancer',
                        'slug',
                    ],
                    populate: {
                        couverture: true,
                        klubr_membre: {
                            fields: ['id', 'uuid', 'nom'],
                            populate: {
                                users_permissions_user: {
                                    fields: ['email'],
                                },
                            },
                        },
                        klubr: {
                            fields: ['id', 'uuid', 'slug'],
                            populate: {
                                logo: true,
                                klubr_house: {
                                    fields: [
                                        'primary_color',
                                        'secondary_color',
                                        'header_text_color',
                                    ],
                                },
                            },
                        },
                        invoice_line: true,
                    },
                    where: { uuid: id },
                });
            if (!entityWithUUID) {
                return ctx.badRequest(`Entity with UUID ${id} not found`);
            }

            const projectClubID = entityWithUUID.klubr?.uuid;
            if (!projectClubID) {
                return ctx.badRequest(`Project Klub not found`);
            }

            // CHECK PERMISSIONS (DEPENDS ON PROFILE ROLE)
            if (
                !profileIsKlubrAdmin(profile) &&
                !profileIsKlubrAdminEditor(profile, projectClubID) &&
                !profileIsKlubrNetwork(profile, projectClubID) &&
                !profileIsKlubrLeader(profile, projectClubID) &&
                !(
                    memberIsMember(profile) &&
                    profile.uuid === entityWithUUID.klubr_membre.uuid
                )
            ) {
                return ctx.unauthorized(
                    'Unauthorized: Not allowed to update this project',
                );
            }
            // CHECK STATUS OF PROJECT (MUST NOT BE DELETED)
            if (entityWithUUID.status === PROJECT_STATUS.DELETED) {
                return ctx.badRequest('Update forbidden: Project is deleted');
            }

            // CHECK STATUS OF PROJECT (MEMBER CAN'T UPDATE PROJECT IF NOT DRAFT OR WAITING_APPROVAL)
            if (memberIsMember(profile)) {
                if (
                    entityWithUUID.status !== PROJECT_STATUS.WAITING_APPROVAL &&
                    entityWithUUID.status !== PROJECT_STATUS.DRAFT
                ) {
                    return ctx.unauthorized(
                        'Unauthorized: Not allowed to update non DRAFT projects',
                    );
                }
            }

            // CHECK STATUS OF PROJECT AND SEND EMAILS
            const { status } = ctx.request.body.data;
            if (status) {
                // CHECK STATUS OF PROJECT (MUST NOT BE BILLED)
                if (entityWithUUID.invoice_line) {
                    return ctx.badRequest(
                        'Update forbidden: Project is already billed',
                    );
                }
                if (memberIsMember(profile)) {
                    if (
                        !(
                            status === PROJECT_STATUS.DRAFT ||
                            status === PROJECT_STATUS.WAITING_APPROVAL
                        )
                    ) {
                        return ctx.unauthorized(
                            'Unauthorized: Not allowed to update status to this value',
                        );
                    } else if (status === PROJECT_STATUS.WAITING_APPROVAL) {
                        /* SEND EMAIL TO CLUB LEADER */
                        const destinatairesTypes = ['KlubMemberLeader'];
                        // Get destination emails for KLUB MEMBER LEADER & send email
                        const klubLeaders: KlubrMemberEntity[] =
                            await strapi.services[
                                'api::klubr-membre.klubr-membre'
                            ].getKlubMembres(
                                entityWithUUID.klubr?.id,
                                destinatairesTypes,
                            );

                        klubLeaders
                            .filter(
                                (membre) =>
                                    membre.users_permissions_user?.email,
                            )
                            .map(async (membre) => {
                                const project = {
                                    ...entityWithUUID,
                                    ...ctx.request.body.data,
                                };
                                const author = entityWithUUID.klubr_membre;
                                if (membre.users_permissions_user?.email) {
                                    sendEmailConfig = {
                                        to: [
                                            {
                                                email: membre
                                                    .users_permissions_user
                                                    ?.email,
                                            },
                                        ],
                                        templateId:
                                            BREVO_TEMPLATES.PROJECT_VALIDATION,
                                        params: {
                                            RECEIVER_FULLNAME: `${membre?.prenom} ${membre?.nom}`,
                                            SENDER_FULLNAME: `${author?.prenom} ${author?.nom}`,
                                            CLUB_LOGO_URL: checkSvgAndTransform(
                                                project?.klubr?.logo,
                                                [
                                                    MEDIAS_TRANSFORMATIONS.EMAIL_CLUB_LOGO,
                                                ],
                                            ),
                                            CLUB_LOGO_ALT:
                                                project?.klubr?.logo
                                                    ?.alternativeText,
                                            PROJECT_COUVERTURE_URL:
                                                checkSvgAndTransform(
                                                    project?.couverture,
                                                    [
                                                        MEDIAS_TRANSFORMATIONS.EMAIL_PROJECT_COVER,
                                                    ],
                                                ),
                                            PROJECT_COUVERTURE_ALT:
                                                project?.couverture
                                                    ?.alternativeText,
                                            PROJECT_TITLE: project?.titre,
                                            PROJECT_AMOUNT:
                                                project.montantAFinancer,
                                            PROJECT_UUID: project?.uuid,
                                        },
                                        tags: [
                                            'email-project-request-validation',
                                            ...(project.klubr?.slug
                                                ? [`${project.klubr?.slug}`]
                                                : []),
                                        ],
                                    };
                                }
                            });
                    }
                } else if (status === PROJECT_STATUS.PUBLISHED) {
                    if (!ctx.request.body.data.startDate) {
                        ctx.request.body.data.startDate = new Date();
                    }
                    if (
                        entityWithUUID.status ===
                        PROJECT_STATUS.WAITING_APPROVAL
                    ) {
                        /* SEND EMAIL TO AUTHOR */
                        const project = {
                            ...entityWithUUID,
                            ...ctx.request.body.data,
                        };
                        const author = entityWithUUID.klubr_membre;
                        if (author.users_permissions_user?.email) {
                            sendEmailConfig = {
                                subject: `Votre projet ${entityWithUUID.titre} a été validé`,
                                to: [
                                    {
                                        email: author.users_permissions_user
                                            ?.email,
                                    },
                                ],
                                templateId: BREVO_TEMPLATES.PROJECT_VALIDATION,
                                params: {
                                    RECEIVER_FULLNAME: `${author?.prenom} ${author?.nom}`,
                                    SENDER_FULLNAME: `${profile?.prenom} ${profile?.nom}`,
                                    CLUB_LOGO_URL: checkSvgAndTransform(
                                        project?.klubr?.logo,
                                        [
                                            MEDIAS_TRANSFORMATIONS.EMAIL_CLUB_LOGO,
                                        ],
                                    ),
                                    CLUB_LOGO_ALT:
                                        project?.klubr?.logo?.alternativeText,
                                    CLUB_SLUG: project?.klubr?.slug,
                                    PROJECT_COUVERTURE_URL:
                                        checkSvgAndTransform(
                                            project?.couverture,
                                            [
                                                MEDIAS_TRANSFORMATIONS.EMAIL_PROJECT_COVER,
                                            ],
                                        ),
                                    PROJECT_COUVERTURE_ALT:
                                        project?.couverture?.alternativeText,
                                    PROJECT_TITLE: project?.titre,
                                    PROJECT_AMOUNT: project.montantAFinancer,
                                    PROJECT_UUID: project?.uuid,
                                    PROJECT_SLUG: project?.slug,
                                    IS_VALIDATED: true,
                                },
                                tags: [
                                    'email-project-validation',
                                    ...(project.klubr?.slug
                                        ? [`${project.klubr?.slug}`]
                                        : []),
                                ],
                            };
                        }
                    }
                }
            }
            if (ctx.request.body?.data?.klubr_membre) {
                const klubr_membre = await strapi.db
                    .query('api::klubr-membre.klubr-membre')
                    .findOne({
                        where: { uuid: ctx.request.body?.data?.klubr_membre },
                    });
                ctx.request.body.data.klubr_membre = klubr_membre.id;
            }
            if (ctx.request.body?.data?.klubr) {
                const klubr = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid: ctx.request.body?.data?.klubr },
                    });
                ctx.request.body.data.klubr = klubr.id;
            }
            if (ctx.request.body?.data?.template_projects_category) {
                const tmplCat = await strapi.db
                    .query(
                        'api::template-projects-category.template-projects-category',
                    )
                    .findOne({
                        where: {
                            uuid: ctx.request.body?.data
                                ?.template_projects_category,
                        },
                    });
                ctx.request.body.data.template_projects_category = tmplCat.id;
            }

            const entity = await strapi
                .documents('api::klub-projet.klub-projet')
                .update({
                    documentId: entityWithUUID.documentId,
                    data: ctx.request.body.data,
                    populate: ctx.query.populate,
                });
            if (sendEmailConfig) {
                await sendBrevoTransacEmail(sendEmailConfig);
            }
            // prevent returning ids
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(removeCodes(sanitizedResult));
        },

        async create() {
            const ctx = strapi.requestContext.get();
            const { status } = ctx.request.body.data;
            if (!status) {
                ctx.request.body.data.status = PROJECT_STATUS.DRAFT;
            }
            if (
                !(
                    status === PROJECT_STATUS.DRAFT ||
                    status === PROJECT_STATUS.WAITING_APPROVAL
                )
            ) {
                return ctx.unauthorized(
                    'Unauthorized: Not allowed to create project with this status',
                );
            }
            if (ctx.request.body?.data?.klubr_membre) {
                const klubr_membre: KlubrMemberEntity = await strapi.db
                    .query('api::klubr-membre.klubr-membre')
                    .findOne({
                        where: { uuid: ctx.request.body?.data?.klubr_membre },
                    });
                ctx.request.body.data.klubr_membre = klubr_membre.id;
            }
            if (ctx.request.body?.data?.klubr) {
                const klubr: KlubrEntity = await strapi.db
                    .query('api::klubr.klubr')
                    .findOne({
                        where: { uuid: ctx.request.body?.data?.klubr },
                    });
                ctx.request.body.data.klubr = klubr.id;
            }
            if (ctx.request.body?.data?.template_projects_category) {
                const tmplCat: TemplateProjectsCategoryEntity = await strapi.db
                    .query(
                        'api::template-projects-category.template-projects-category',
                    )
                    .findOne({
                        where: {
                            uuid: ctx.request.body?.data
                                ?.template_projects_category,
                        },
                    });
                ctx.request.body.data.template_projects_category = tmplCat.id;
            }
            if (ctx.request.body?.data?.tmplReference) {
                const tmplProject: KlubProjetEntity = await strapi.db
                    .query('api::klub-projet.klub-projet')
                    .findOne({
                        where: { uuid: ctx.request.body?.data?.tmplReference },
                    });
                ctx.request.body.data.tmplReference = tmplProject.id;
            }

            const entity = await super.create(ctx);
            // prevent returning ids
            const sanitizedResult = await this.sanitizeOutput(entity, ctx);
            return removeId(removeCodes(sanitizedResult));
        },

        async posterPdf() {
            const ctx = strapi.requestContext.get();
            try {
                const { id } = ctx.params;

                if (!id) {
                    return ctx.badRequest('Missing klub uuid parameter.');
                }

                const entity: KlubProjetEntity = await strapi.db
                    .query('api::klub-projet.klub-projet')
                    .findOne({
                        where: { uuid: id },
                    });

                if (!entity?.id) {
                    return ctx.badRequest('Klub project not found');
                }

                const entry = await strapi
                    .documents('api::klub-projet.klub-projet')
                    .findOne({
                        documentId: entity.documentId,
                        populate: {
                            couverture: true,
                            klubr: {
                                populate: {
                                    logo: true,
                                    klubr_house: true,
                                },
                            },
                        },
                    });

                const result = await GeneratePoster(entry, 'PROJECT');
                if (result['errors']) {
                    ctx.status = 400;
                    ctx.body = {
                        error: {
                            message: 'Erreur lors de la génération du PDF',
                            details: result['errors'],
                        },
                    };
                    return;
                }
                const pdfFile = Buffer.from(result['file']);
                const pdfName = entry?.slug
                    ?.split('-')
                    ?.reduce((prev, curr) => {
                        prev.push(curr[0]?.toUpperCase() + curr?.slice(1));
                        return prev;
                    }, [])
                    ?.join('-');

                const imgBuffer = !!ctx.query.asImage
                    ? await convertPdfToImage(pdfFile, pdfName)
                    : null;

                ctx.response.type = imgBuffer ? 'image/png' : 'application/pdf';
                ctx.response.attachment(
                    `Affiche-${pdfName}.${imgBuffer ? 'png' : 'pdf'}`,
                );
                ctx.set('Access-Control-Expose-Headers', 'Content-Disposition');
                ctx.body = imgBuffer || pdfFile;
                return entry;
            } catch (e) {
                console.log(e);
                ctx.status = 500;
                ctx.body = { message: `Erreur interne du serveur, ${e}` };
            }
        },
    }),
);
