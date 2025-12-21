import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
    collectionName: 'strapi_api_tokens';
    info: {
        description: '';
        displayName: 'Api Token';
        name: 'Api Token';
        pluralName: 'api-tokens';
        singularName: 'api-token';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        accessKey: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        description: Schema.Attribute.String &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }> &
            Schema.Attribute.DefaultTo<''>;
        encryptedKey: Schema.Attribute.Text &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        expiresAt: Schema.Attribute.DateTime;
        lastUsedAt: Schema.Attribute.DateTime;
        lifespan: Schema.Attribute.BigInteger;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'admin::api-token'
        > &
            Schema.Attribute.Private;
        name: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.Unique &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        permissions: Schema.Attribute.Relation<
            'oneToMany',
            'admin::api-token-permission'
        >;
        publishedAt: Schema.Attribute.DateTime;
        type: Schema.Attribute.Enumeration<
            ['read-only', 'full-access', 'custom']
        > &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'read-only'>;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
    };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
    collectionName: 'strapi_api_token_permissions';
    info: {
        description: '';
        displayName: 'API Token Permission';
        name: 'API Token Permission';
        pluralName: 'api-token-permissions';
        singularName: 'api-token-permission';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        action: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'admin::api-token-permission'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
    };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
    collectionName: 'admin_permissions';
    info: {
        description: '';
        displayName: 'Permission';
        name: 'Permission';
        pluralName: 'permissions';
        singularName: 'permission';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        action: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        actionParameters: Schema.Attribute.JSON &
            Schema.Attribute.DefaultTo<{}>;
        conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'admin::permission'
        > &
            Schema.Attribute.Private;
        properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
        publishedAt: Schema.Attribute.DateTime;
        role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
        subject: Schema.Attribute.String &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
    };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
    collectionName: 'admin_roles';
    info: {
        description: '';
        displayName: 'Role';
        name: 'Role';
        pluralName: 'roles';
        singularName: 'role';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        code: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.Unique &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        description: Schema.Attribute.String;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
            Schema.Attribute.Private;
        name: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.Unique &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        permissions: Schema.Attribute.Relation<
            'oneToMany',
            'admin::permission'
        >;
        publishedAt: Schema.Attribute.DateTime;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
    };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
    collectionName: 'strapi_transfer_tokens';
    info: {
        description: '';
        displayName: 'Transfer Token';
        name: 'Transfer Token';
        pluralName: 'transfer-tokens';
        singularName: 'transfer-token';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        accessKey: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        description: Schema.Attribute.String &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }> &
            Schema.Attribute.DefaultTo<''>;
        expiresAt: Schema.Attribute.DateTime;
        lastUsedAt: Schema.Attribute.DateTime;
        lifespan: Schema.Attribute.BigInteger;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'admin::transfer-token'
        > &
            Schema.Attribute.Private;
        name: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.Unique &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        permissions: Schema.Attribute.Relation<
            'oneToMany',
            'admin::transfer-token-permission'
        >;
        publishedAt: Schema.Attribute.DateTime;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
    };
}

export interface AdminTransferTokenPermission
    extends Struct.CollectionTypeSchema {
    collectionName: 'strapi_transfer_token_permissions';
    info: {
        description: '';
        displayName: 'Transfer Token Permission';
        name: 'Transfer Token Permission';
        pluralName: 'transfer-token-permissions';
        singularName: 'transfer-token-permission';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        action: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'admin::transfer-token-permission'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
    };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
    collectionName: 'admin_users';
    info: {
        description: '';
        displayName: 'User';
        name: 'User';
        pluralName: 'users';
        singularName: 'user';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        blocked: Schema.Attribute.Boolean &
            Schema.Attribute.Private &
            Schema.Attribute.DefaultTo<false>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        email: Schema.Attribute.Email &
            Schema.Attribute.Required &
            Schema.Attribute.Private &
            Schema.Attribute.Unique &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 6;
            }>;
        firstname: Schema.Attribute.String &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        isActive: Schema.Attribute.Boolean &
            Schema.Attribute.Private &
            Schema.Attribute.DefaultTo<false>;
        lastname: Schema.Attribute.String &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
            Schema.Attribute.Private;
        password: Schema.Attribute.Password &
            Schema.Attribute.Private &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 6;
            }>;
        preferedLanguage: Schema.Attribute.String;
        publishedAt: Schema.Attribute.DateTime;
        registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
        resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
        roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
            Schema.Attribute.Private;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        username: Schema.Attribute.String;
    };
}

export interface ApiBlogBlog extends Struct.CollectionTypeSchema {
    collectionName: 'blogs';
    info: {
        description: '';
        displayName: 'Blog';
        pluralName: 'blogs';
        singularName: 'blog';
    };
    options: {
        draftAndPublish: true;
    };
    pluginOptions: {
        'import-export-entries': {
            idField: 'invoiceNumber';
        };
    };
    attributes: {
        author: Schema.Attribute.String & Schema.Attribute.Required;
        authorImg: Schema.Attribute.Media<'images'>;
        btnText: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'Read More'>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::blog.blog'
        > &
            Schema.Attribute.Private;
        longDescription: Schema.Attribute.RichText & Schema.Attribute.Required;
        nom: Schema.Attribute.String;
        publishedAt: Schema.Attribute.DateTime;
        shortDescription: Schema.Attribute.Text & Schema.Attribute.Required;
        slug: Schema.Attribute.UID<'title'>;
        title: Schema.Attribute.String & Schema.Attribute.Required;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiCguKlubCguKlub extends Struct.SingleTypeSchema {
    collectionName: 'cgu_klubs';
    info: {
        description: '';
        displayName: 'CGU Klub';
        pluralName: 'cgu-klubs';
        singularName: 'cgu-klub';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        content: Schema.Attribute.Blocks;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::cgu-klub.cgu-klub'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        titre: Schema.Attribute.String;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiCguCgu extends Struct.SingleTypeSchema {
    collectionName: 'cgus';
    info: {
        description: '';
        displayName: 'CGU';
        pluralName: 'cgus';
        singularName: 'cgu';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'import-export-entries': {
            idField: 'slug';
        };
    };
    attributes: {
        content: Schema.Attribute.Blocks;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<'oneToMany', 'api::cgu.cgu'> &
            Schema.Attribute.Private;
        metaDescription: Schema.Attribute.Text;
        metaTitle: Schema.Attribute.String;
        publishedAt: Schema.Attribute.DateTime;
        slug: Schema.Attribute.UID<'titre'> & Schema.Attribute.Required;
        titre: Schema.Attribute.String &
            Schema.Attribute.DefaultTo<"Conditions G\u00E9n\u00E9rales d'Utilisation">;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiConnectedAccountConnectedAccount
    extends Struct.CollectionTypeSchema {
    collectionName: 'connected_accounts';
    info: {
        description: 'Stripe Connect account information for klubrs';
        displayName: 'Connected Account';
        pluralName: 'connected-accounts';
        singularName: 'connected-account';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        account_status: Schema.Attribute.Enumeration<
            ['pending', 'active', 'restricted', 'disabled']
        > &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'pending'>;
        business_type: Schema.Attribute.Enumeration<
            ['individual', 'company', 'non_profit']
        >;
        capabilities: Schema.Attribute.JSON;
        country: Schema.Attribute.String & Schema.Attribute.DefaultTo<'FR'>;
        created_at_stripe: Schema.Attribute.DateTime;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        klubr: Schema.Attribute.Relation<'oneToOne', 'api::klubr.klubr'>;
        last_sync: Schema.Attribute.DateTime;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::connected-account.connected-account'
        > &
            Schema.Attribute.Private;
        onboarding_completed: Schema.Attribute.Boolean &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<false>;
        publishedAt: Schema.Attribute.DateTime;
        requirements: Schema.Attribute.JSON;
        stripe_account_id: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.Unique;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
        verification_status: Schema.Attribute.Enumeration<
            ['unverified', 'pending', 'verified', 'rejected']
        > &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'unverified'>;
    };
}

export interface ApiContactContact extends Struct.CollectionTypeSchema {
    collectionName: 'contacts';
    info: {
        description: '';
        displayName: 'Contact';
        pluralName: 'contacts';
        singularName: 'contact';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        email: Schema.Attribute.Email;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::contact.contact'
        > &
            Schema.Attribute.Private;
        msg: Schema.Attribute.Text;
        object: Schema.Attribute.String;
        origin: Schema.Attribute.Enumeration<
            ['web-site-page-contact', 'admin-centre-aide']
        > &
            Schema.Attribute.DefaultTo<'web-site-page-contact'>;
        publishedAt: Schema.Attribute.DateTime;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': false;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': false;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiFederationFederation extends Struct.CollectionTypeSchema {
    collectionName: 'federations';
    info: {
        description: '';
        displayName: 'Federation';
        pluralName: 'federations';
        singularName: 'federation';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        acronym: Schema.Attribute.String;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        klubr: Schema.Attribute.Relation<'oneToOne', 'api::klubr.klubr'>;
        klubrs: Schema.Attribute.Relation<'oneToMany', 'api::klubr.klubr'>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::federation.federation'
        > &
            Schema.Attribute.Private;
        name: Schema.Attribute.String & Schema.Attribute.Required;
        publishedAt: Schema.Attribute.DateTime;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiFinancialAuditLogFinancialAuditLog
    extends Struct.CollectionTypeSchema {
    collectionName: 'financial_audit_logs';
    info: {
        description: 'Audit trail for financial transactions and operations';
        displayName: 'Financial Audit Log';
        pluralName: 'financial-audit-logs';
        singularName: 'financial-audit-log';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        action_type: Schema.Attribute.Enumeration<
            [
                'transfer_created',
                'payout_initiated',
                'refund_processed',
                'fee_calculated',
            ]
        > &
            Schema.Attribute.Required;
        amount: Schema.Attribute.Decimal;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        currency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'EUR'>;
        klub_don: Schema.Attribute.Relation<
            'manyToOne',
            'api::klub-don.klub-don'
        >;
        klubr: Schema.Attribute.Relation<'manyToOne', 'api::klubr.klubr'>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::financial-audit-log.financial-audit-log'
        > &
            Schema.Attribute.Private;
        metadata: Schema.Attribute.JSON;
        performed_at: Schema.Attribute.DateTime;
        performed_by: Schema.Attribute.Relation<
            'manyToOne',
            'plugin::users-permissions.user'
        >;
        publishedAt: Schema.Attribute.DateTime;
        stripe_object_id: Schema.Attribute.String;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiInvoiceLineInvoiceLine extends Struct.CollectionTypeSchema {
    collectionName: 'invoice_lines';
    info: {
        description: '';
        displayName: 'Invoice line';
        pluralName: 'invoice-lines';
        singularName: 'invoice-line';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        amountExcludingTax: Schema.Attribute.Decimal &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<0>;
        closingDate: Schema.Attribute.Date;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        description: Schema.Attribute.String;
        invoice: Schema.Attribute.Relation<'manyToOne', 'api::invoice.invoice'>;
        invoiceLineNumber: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.Unique;
        isCreditLine: Schema.Attribute.Boolean &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<false>;
        klub_dons: Schema.Attribute.Relation<
            'oneToMany',
            'api::klub-don.klub-don'
        >;
        klub_projet: Schema.Attribute.Relation<
            'oneToOne',
            'api::klub-projet.klub-projet'
        >;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::invoice-line.invoice-line'
        > &
            Schema.Attribute.Private;
        nbDonations: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
        publishedAt: Schema.Attribute.DateTime;
        quantity: Schema.Attribute.Integer &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<0>;
        reference: Schema.Attribute.String & Schema.Attribute.Required;
        unitPriceExcludingTax: Schema.Attribute.Decimal &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<0>;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiInvoiceInvoice extends Struct.CollectionTypeSchema {
    collectionName: 'invoices';
    info: {
        description: '';
        displayName: 'Invoice';
        pluralName: 'invoices';
        singularName: 'invoice';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'import-export-entries': {
            idField: 'invoiceNumber';
        };
    };
    attributes: {
        amountExcludingTax: Schema.Attribute.Decimal &
            Schema.Attribute.DefaultTo<0>;
        amountIncludingTax: Schema.Attribute.Decimal &
            Schema.Attribute.DefaultTo<0>;
        averageBasket: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
        billingPeriod: Schema.Attribute.String & Schema.Attribute.Required;
        billingPeriodSmall: Schema.Attribute.String & Schema.Attribute.Required;
        commissionPercentage: Schema.Attribute.Decimal;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        creditTotalAmount: Schema.Attribute.Decimal &
            Schema.Attribute.DefaultTo<0>;
        dateBankTransfer: Schema.Attribute.DateTime;
        dateInvoice: Schema.Attribute.Date & Schema.Attribute.Required;
        firstSentEmailDate: Schema.Attribute.DateTime;
        invoice_lines: Schema.Attribute.Relation<
            'oneToMany',
            'api::invoice-line.invoice-line'
        >;
        invoiceNumber: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.Unique;
        invoicePdfPath: Schema.Attribute.String;
        klub_dons: Schema.Attribute.Relation<
            'oneToMany',
            'api::klub-don.klub-don'
        >;
        klubr: Schema.Attribute.Relation<'oneToOne', 'api::klubr.klubr'>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::invoice.invoice'
        > &
            Schema.Attribute.Private;
        nbDonations: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
        publishedAt: Schema.Attribute.DateTime;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
        VAT: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    };
}

export interface ApiKlubDonPaymentKlubDonPayment
    extends Struct.CollectionTypeSchema {
    collectionName: 'klub_don_payments';
    info: {
        description: '';
        displayName: 'Klub don payment';
        pluralName: 'klub-don-payments';
        singularName: 'klub-don-payment';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        amount: Schema.Attribute.BigInteger & Schema.Attribute.Required;
        application_fee_amount: Schema.Attribute.Decimal;
        client_secret: Schema.Attribute.String & Schema.Attribute.Required;
        created: Schema.Attribute.BigInteger & Schema.Attribute.Required;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        currency: Schema.Attribute.String & Schema.Attribute.Required;
        error_code: Schema.Attribute.String;
        idempotency_key: Schema.Attribute.String & Schema.Attribute.Unique;
        intent_id: Schema.Attribute.String & Schema.Attribute.Required;
        klub_don: Schema.Attribute.Relation<
            'manyToOne',
            'api::klub-don.klub-don'
        >;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::klub-don-payment.klub-don-payment'
        > &
            Schema.Attribute.Private;
        payment_method: Schema.Attribute.String & Schema.Attribute.Required;
        platform_fee_amount: Schema.Attribute.Decimal;
        publishedAt: Schema.Attribute.DateTime;
        refund_status: Schema.Attribute.Enumeration<
            ['none', 'pending', 'partial', 'full']
        > &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'none'>;
        status: Schema.Attribute.String;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiKlubDonKlubDon extends Struct.CollectionTypeSchema {
    collectionName: 'klub_dons';
    info: {
        description: '';
        displayName: 'Klub Don';
        pluralName: 'klub-dons';
        singularName: 'klub-don';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        attestationNumber: Schema.Attribute.String & Schema.Attribute.Unique;
        attestationPath: Schema.Attribute.String & Schema.Attribute.Private;
        contributionAKlubr: Schema.Attribute.Decimal;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        datePaiment: Schema.Attribute.DateTime;
        deductionFiscale: Schema.Attribute.Decimal;
        emailSent: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
        estOrganisme: Schema.Attribute.Boolean;
        hasBeenRelaunched: Schema.Attribute.Boolean &
            Schema.Attribute.Private &
            Schema.Attribute.DefaultTo<false>;
        invoice: Schema.Attribute.Relation<'manyToOne', 'api::invoice.invoice'>;
        invoice_line: Schema.Attribute.Relation<
            'manyToOne',
            'api::invoice-line.invoice-line'
        >;
        isContributionDonation: Schema.Attribute.Boolean &
            Schema.Attribute.DefaultTo<false>;
        klub_don: Schema.Attribute.Relation<
            'oneToOne',
            'api::klub-don.klub-don'
        >;
        klub_don_contribution: Schema.Attribute.Relation<
            'oneToOne',
            'api::klub-don.klub-don'
        >;
        klub_don_payments: Schema.Attribute.Relation<
            'oneToMany',
            'api::klub-don-payment.klub-don-payment'
        >;
        klub_projet: Schema.Attribute.Relation<
            'oneToOne',
            'api::klub-projet.klub-projet'
        >;
        klubDonateur: Schema.Attribute.Relation<
            'oneToOne',
            'api::klubr-donateur.klubr-donateur'
        >;
        klubr: Schema.Attribute.Relation<'oneToOne', 'api::klubr.klubr'>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::klub-don.klub-don'
        > &
            Schema.Attribute.Private;
        montant: Schema.Attribute.Decimal;
        montantAjouteAuMontantTotalDuProjet: Schema.Attribute.Boolean &
            Schema.Attribute.Private &
            Schema.Attribute.DefaultTo<false>;
        publishedAt: Schema.Attribute.DateTime;
        recuPath: Schema.Attribute.String & Schema.Attribute.Private;
        relaunchCode: Schema.Attribute.Integer &
            Schema.Attribute.SetMinMax<
                {
                    max: 9999;
                    min: 0;
                },
                number
            >;
        statusPaiment: Schema.Attribute.Enumeration<
            ['notDone', 'pending', 'success', 'error']
        >;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
        withTaxReduction: Schema.Attribute.Boolean &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<true>;
    };
}

export interface ApiKlubProjetKlubProjet extends Struct.CollectionTypeSchema {
    collectionName: 'klub_projets';
    info: {
        description: '';
        displayName: 'Klub Projet';
        pluralName: 'klub-projets';
        singularName: 'klub-projet';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'import-export-entries': {
            idField: 'slug';
        };
    };
    attributes: {
        contenu: Schema.Attribute.DynamicZone<
            ['composant-atoms.section-texte-image', 'composant-atoms.slider']
        >;
        couverture: Schema.Attribute.Media<'images' | 'videos'>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        dateLimiteFinancementProjet: Schema.Attribute.Date;
        descriptionCourte: Schema.Attribute.Blocks;
        invoice_line: Schema.Attribute.Relation<
            'oneToOne',
            'api::invoice-line.invoice-line'
        >;
        isFromTemplate: Schema.Attribute.Boolean &
            Schema.Attribute.DefaultTo<false>;
        isTemplate: Schema.Attribute.Boolean &
            Schema.Attribute.DefaultTo<false>;
        klubr: Schema.Attribute.Relation<'oneToOne', 'api::klubr.klubr'>;
        klubr_membre: Schema.Attribute.Relation<
            'oneToOne',
            'api::klubr-membre.klubr-membre'
        >;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::klub-projet.klub-projet'
        > &
            Schema.Attribute.Private;
        metaDescription: Schema.Attribute.Text &
            Schema.Attribute.SetMinMaxLength<{
                maxLength: 250;
            }>;
        montantAFinancer: Schema.Attribute.Integer &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMax<
                {
                    max: 100000;
                    min: 0;
                },
                number
            >;
        montantTotalDonations: Schema.Attribute.Decimal;
        nbDons: Schema.Attribute.Integer;
        presentationDescription: Schema.Attribute.Blocks;
        presentationTitre: Schema.Attribute.String &
            Schema.Attribute.DefaultTo<'Notre Besoin'>;
        publishedAt: Schema.Attribute.DateTime;
        realisations: Schema.Attribute.DynamicZone<
            ['composant-atoms.section-texte-image']
        >;
        slug: Schema.Attribute.UID<'titre'> & Schema.Attribute.Required;
        startDate: Schema.Attribute.Date;
        status: Schema.Attribute.Enumeration<
            [
                'draft',
                'waitingApproval',
                'published',
                'closed',
                'deleted',
                'billed',
            ]
        > &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'draft'>;
        template_projects_category: Schema.Attribute.Relation<
            'manyToOne',
            'api::template-projects-category.template-projects-category'
        >;
        titre: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 3;
            }>;
        tmplReference: Schema.Attribute.Relation<
            'oneToOne',
            'api::klub-projet.klub-projet'
        > &
            Schema.Attribute.Private;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiKlubrDocumentKlubrDocument
    extends Struct.CollectionTypeSchema {
    collectionName: 'klubr_documents';
    info: {
        description: '';
        displayName: 'Klubr Documents';
        pluralName: 'klubr-documents';
        singularName: 'klubr-document';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        attestationAffiliationFederation: Schema.Attribute.JSON;
        attestationAffiliationFederationValide: Schema.Attribute.Boolean;
        avisSituationSIRENE: Schema.Attribute.JSON;
        avisSituationSIRENEValide: Schema.Attribute.Boolean;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        justifDesignationPresident: Schema.Attribute.JSON;
        justifDesignationPresidentValide: Schema.Attribute.Boolean;
        justifDomicileDirigeant: Schema.Attribute.JSON;
        justifDomicileDirigeantValide: Schema.Attribute.Boolean;
        klubr: Schema.Attribute.Relation<'oneToOne', 'api::klubr.klubr'>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::klubr-document.klubr-document'
        > &
            Schema.Attribute.Private;
        managerSignature: Schema.Attribute.JSON;
        managerSignatureValide: Schema.Attribute.Boolean;
        publishedAt: Schema.Attribute.DateTime;
        ribAssociation: Schema.Attribute.JSON;
        ribAssociationValide: Schema.Attribute.Boolean;
        statutsAssociation: Schema.Attribute.JSON;
        statutsAssociationValide: Schema.Attribute.Boolean;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiKlubrDonateurKlubrDonateur
    extends Struct.CollectionTypeSchema {
    collectionName: 'klubr_donateurs';
    info: {
        description: '';
        displayName: 'Klubr Donateur';
        pluralName: 'klubr-donateurs';
        singularName: 'klubr-donateur';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        adresse: Schema.Attribute.String;
        adresse2: Schema.Attribute.String;
        anonymized: Schema.Attribute.Boolean &
            Schema.Attribute.Private &
            Schema.Attribute.DefaultTo<false>;
        avatar: Schema.Attribute.Media<'images'>;
        civilite: Schema.Attribute.Enumeration<['Madame', 'Monsieur']> &
            Schema.Attribute.DefaultTo<'Madame'>;
        cp: Schema.Attribute.String &
            Schema.Attribute.SetMinMaxLength<{
                maxLength: 5;
            }>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        dateNaissance: Schema.Attribute.Date;
        donateurType: Schema.Attribute.Enumeration<
            ['Particulier', 'Organisme']
        > &
            Schema.Attribute.DefaultTo<'Particulier'>;
        email: Schema.Attribute.Email;
        formeJuridique: Schema.Attribute.String;
        klubDon: Schema.Attribute.Relation<
            'oneToOne',
            'api::klub-don.klub-don'
        >;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::klubr-donateur.klubr-donateur'
        > &
            Schema.Attribute.Private;
        logo: Schema.Attribute.Media<'images'>;
        nom: Schema.Attribute.String;
        optInAffMontant: Schema.Attribute.Boolean;
        optInAffNom: Schema.Attribute.Boolean;
        pays: Schema.Attribute.String & Schema.Attribute.DefaultTo<'France'>;
        place_id: Schema.Attribute.String;
        prenom: Schema.Attribute.String;
        publishedAt: Schema.Attribute.DateTime;
        raisonSocial: Schema.Attribute.String;
        SIREN: Schema.Attribute.String;
        tel: Schema.Attribute.String;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        users_permissions_user: Schema.Attribute.Relation<
            'oneToOne',
            'plugin::users-permissions.user'
        >;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
        ville: Schema.Attribute.String;
    };
}

export interface ApiKlubrHouseKlubrHouse extends Struct.CollectionTypeSchema {
    collectionName: 'klubr_houses';
    info: {
        description: '';
        displayName: 'Klubr House';
        pluralName: 'klubr-houses';
        singularName: 'klubr-house';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'import-export-entries': {
            idField: 'slug';
        };
    };
    attributes: {
        chiffres: Schema.Attribute.DynamicZone<['club-chiffres.chiffres']> &
            Schema.Attribute.SetMinMax<
                {
                    max: 3;
                    min: 1;
                },
                number
            >;
        club_presentation: Schema.Attribute.DynamicZone<
            [
                'club-presentation.mot-du-dirigeant',
                'club-presentation.section-citation',
                'club-presentation.pourquoi-klubr-accompagne',
                'club-presentation.localisation',
                'composant-atoms.section-texte-image',
            ]
        >;
        couvertureMedia: Schema.Attribute.Media<'images' | 'videos'>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        description: Schema.Attribute.Blocks;
        footer_text_color: Schema.Attribute.String &
            Schema.Attribute.CustomField<'plugin::color-picker.color'>;
        header_text_color: Schema.Attribute.String &
            Schema.Attribute.CustomField<'plugin::color-picker.color'>;
        klubr: Schema.Attribute.Relation<'oneToOne', 'api::klubr.klubr'>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::klubr-house.klubr-house'
        > &
            Schema.Attribute.Private;
        metaDescription: Schema.Attribute.Text &
            Schema.Attribute.SetMinMaxLength<{
                maxLength: 300;
            }>;
        partnerList: Schema.Attribute.DynamicZone<
            ['composant-atoms.partner-item']
        >;
        poster_media: Schema.Attribute.Media<'images'>;
        poster_primary_color: Schema.Attribute.String &
            Schema.Attribute.CustomField<'plugin::color-picker.color'>;
        primary_color: Schema.Attribute.String &
            Schema.Attribute.CustomField<'plugin::color-picker.color'>;
        publishedAt: Schema.Attribute.DateTime;
        secondary_color: Schema.Attribute.String &
            Schema.Attribute.CustomField<'plugin::color-picker.color'>;
        slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
        title: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'Le Klub'>;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiKlubrInfoKlubrInfo extends Struct.CollectionTypeSchema {
    collectionName: 'klubr_infos';
    info: {
        displayName: 'Klubr Info';
        pluralName: 'klubr-infos';
        singularName: 'klubr-info';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        klubr: Schema.Attribute.Relation<'oneToOne', 'api::klubr.klubr'>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::klubr-info.klubr-info'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        requiredDocsRefusedCompletion: Schema.Attribute.Decimal &
            Schema.Attribute.DefaultTo<0>;
        requiredDocsValidatedCompletion: Schema.Attribute.Decimal &
            Schema.Attribute.DefaultTo<0>;
        requiredDocsWaitingValidationCompletion: Schema.Attribute.Decimal &
            Schema.Attribute.DefaultTo<0>;
        requiredFieldsCompletion: Schema.Attribute.Decimal &
            Schema.Attribute.DefaultTo<0>;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiKlubrMembreKlubrMembre extends Struct.CollectionTypeSchema {
    collectionName: 'klubr_membres';
    info: {
        description: '';
        displayName: 'Klubr Membre';
        pluralName: 'klubr-membres';
        singularName: 'klubr-membre';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'import-export-entries': {
            idField: 'slug';
        };
    };
    attributes: {
        anonymized: Schema.Attribute.Boolean &
            Schema.Attribute.Private &
            Schema.Attribute.DefaultTo<false>;
        avatar: Schema.Attribute.Media<'images'>;
        birthDate: Schema.Attribute.Date;
        code: Schema.Attribute.String & Schema.Attribute.Unique;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        date_link_user: Schema.Attribute.DateTime;
        email: Schema.Attribute.Email;
        fonction: Schema.Attribute.String;
        isRelaunched: Schema.Attribute.Boolean &
            Schema.Attribute.Private &
            Schema.Attribute.DefaultTo<false>;
        klubr: Schema.Attribute.Relation<'oneToOne', 'api::klubr.klubr'>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::klubr-membre.klubr-membre'
        > &
            Schema.Attribute.Private;
        nom: Schema.Attribute.String & Schema.Attribute.Required;
        numLicence: Schema.Attribute.String;
        optin_mail_don_klub: Schema.Attribute.Boolean &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<true>;
        optin_mail_don_klub_project: Schema.Attribute.Boolean &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<true>;
        optin_mail_don_project: Schema.Attribute.Boolean &
            Schema.Attribute.DefaultTo<true>;
        optin_mail_invoice: Schema.Attribute.Boolean &
            Schema.Attribute.DefaultTo<false>;
        prenom: Schema.Attribute.String;
        publishedAt: Schema.Attribute.DateTime;
        role: Schema.Attribute.Enumeration<
            [
                'KlubMember',
                'KlubMemberLeader',
                'NetworkLeader',
                'AdminEditor',
                'Admin',
            ]
        > &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'KlubMember'>;
        slug: Schema.Attribute.UID<'nom'>;
        tel: Schema.Attribute.String;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        users_permissions_user: Schema.Attribute.Relation<
            'manyToOne',
            'plugin::users-permissions.user'
        >;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiKlubrSubscriptionKlubrSubscription
    extends Struct.CollectionTypeSchema {
    collectionName: 'klubr_subscriptions';
    info: {
        description: '';
        displayName: 'Klubr subscription';
        pluralName: 'klubr-subscriptions';
        singularName: 'klubr-subscription';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        apiToken: Schema.Attribute.Text &
            Schema.Attribute.Private &
            Schema.Attribute.Unique;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        host: Schema.Attribute.String & Schema.Attribute.Required;
        klubr: Schema.Attribute.Relation<'manyToOne', 'api::klubr.klubr'>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::klubr-subscription.klubr-subscription'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
        web_component: Schema.Attribute.String & Schema.Attribute.Required;
    };
}

export interface ApiKlubrKlubr extends Struct.CollectionTypeSchema {
    collectionName: 'klubrs';
    info: {
        description: '';
        displayName: 'Klubr';
        pluralName: 'klubrs';
        singularName: 'klubr';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'import-export-entries': {
            idField: 'slug';
        };
    };
    attributes: {
        acronyme: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMaxLength<{
                maxLength: 8;
            }>;
        associationType: Schema.Attribute.Enumeration<
            [
                'Sport',
                'Aide \u00E0 la personne',
                'Humanitaire',
                'Aide animale',
                'Religion',
            ]
        > &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'Sport'>;
        code: Schema.Attribute.String & Schema.Attribute.Unique;
        codeLeader: Schema.Attribute.String & Schema.Attribute.Unique;
        connected_account: Schema.Attribute.Relation<
            'oneToOne',
            'api::connected-account.connected-account'
        >;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        denomination: Schema.Attribute.String & Schema.Attribute.Required;
        donationEligible: Schema.Attribute.Boolean &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<false>;
        federation: Schema.Attribute.String;
        federationLink: Schema.Attribute.Relation<
            'manyToOne',
            'api::federation.federation'
        >;
        googlePlace: Schema.Attribute.JSON;
        hasRescritFiscal: Schema.Attribute.Boolean &
            Schema.Attribute.DefaultTo<false>;
        klubr_document: Schema.Attribute.Relation<
            'oneToOne',
            'api::klubr-document.klubr-document'
        >;
        klubr_house: Schema.Attribute.Relation<
            'oneToOne',
            'api::klubr-house.klubr-house'
        >;
        klubr_info: Schema.Attribute.Relation<
            'oneToOne',
            'api::klubr-info.klubr-info'
        >;
        klubr_subscriptions: Schema.Attribute.Relation<
            'oneToMany',
            'api::klubr-subscription.klubr-subscription'
        >;
        klubrAffiliations: Schema.Attribute.Relation<
            'manyToMany',
            'api::klubr.klubr'
        >;
        klubrsAffiliateds: Schema.Attribute.Relation<
            'manyToMany',
            'api::klubr.klubr'
        >;
        klubYearCreation: Schema.Attribute.Integer;
        legalStatus: Schema.Attribute.Enumeration<
            [
                'Association Loi 1901',
                'Association Loi 1905',
                'Association Loi 1908',
                'Associations professionnelles nationales de militaires',
                'Associations syndicales de propri\u00E9taires',
                'Collectivit\u00E9s territoriales',
                "Comit\u00E9 d'entreprise",
                'CSE',
                "Fabrique d'\u00E9glise",
                'Fondation',
                'Fonds de dotation',
                'Fonds de p\u00E9rennit\u00E9',
                'GIE',
                'GIP',
                'Mense curiale',
                'SCIC',
                'SCOP',
                'Autre',
            ]
        >;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::klubr.klubr'
        > &
            Schema.Attribute.Private;
        logo: Schema.Attribute.Media<'images'>;
        nbBenevoles: Schema.Attribute.Integer;
        nbMembres: Schema.Attribute.Integer;
        publishedAt: Schema.Attribute.DateTime;
        siegeSocialAdresse: Schema.Attribute.String;
        siegeSocialAdresse2: Schema.Attribute.String;
        siegeSocialCP: Schema.Attribute.String &
            Schema.Attribute.SetMinMaxLength<{
                maxLength: 5;
            }>;
        siegeSocialDepartement: Schema.Attribute.String;
        siegeSocialPays: Schema.Attribute.String &
            Schema.Attribute.DefaultTo<'France'>;
        siegeSocialRegion: Schema.Attribute.String;
        siegeSocialVille: Schema.Attribute.String;
        slogan: Schema.Attribute.String;
        slug: Schema.Attribute.UID<'denomination'> & Schema.Attribute.Required;
        sportType: Schema.Attribute.Enumeration<
            [
                'Autre',
                'A\u00EFkido',
                'Aquatique',
                'Athl\u00E9tisme',
                'Aviron',
                'Badminton',
                'Baseball',
                'Basket-ball',
                'Billard',
                'Boxe',
                'Can\u00F6e',
                'Char \u00E0 voile',
                'Course \u00E0 pied',
                'Danse',
                'Equitation',
                'Escalade',
                'Escrime',
                'Fl\u00E9chettes',
                'Football',
                'Golf',
                'Gymnastique',
                'Handball',
                'Hockey',
                'Hockey sur glace',
                'Judo',
                'Karat\u00E9',
                'Lutte',
                'Moto',
                'Natation',
                'Nautisme',
                'Patinage',
                'P\u00EAche',
                'P\u00E9tanque',
                'Planche \u00E0 voile',
                'Plong\u00E9e sous marine',
                'Ski alpin',
                'Ski de fond',
                'Ski nautique',
                'Sp\u00E9l\u00E9ologie',
                'Sports nautiques',
                'Sports automobiles',
                'Surf',
                'Taekwondo',
                'Tennis',
                'Tennis de table',
                "Tir \u00E0 l'arc",
                'Triathlon',
                'V\u00E9lo/BMX/VTT',
                'Voile',
                'Volleyball',
                'Waterpolo',
                'Trail',
            ]
        > &
            Schema.Attribute.DefaultTo<'Football'>;
        status: Schema.Attribute.Enumeration<
            ['draft', 'published', 'deleted']
        > &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'draft'>;
        template_projects_libraries: Schema.Attribute.Relation<
            'oneToMany',
            'api::template-projects-library.template-projects-library'
        >;
        trade_policy: Schema.Attribute.Relation<
            'oneToOne',
            'api::trade-policy.trade-policy'
        >;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
        webSite: Schema.Attribute.String;
    };
}

export interface ApiMecenatReassuranceMecenatReassurance
    extends Struct.SingleTypeSchema {
    collectionName: 'mecenat_reassurances';
    info: {
        description: '';
        displayName: 'M\u00E9c\u00E9nat R\u00E9assurance';
        pluralName: 'mecenat-reassurances';
        singularName: 'mecenat-reassurance';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'import-export-entries': {
            idField: 'slug';
        };
    };
    attributes: {
        bloc1Text: Schema.Attribute.Blocks;
        bloc1Titre: Schema.Attribute.String;
        bloc2Text: Schema.Attribute.Blocks;
        bloc2Titre: Schema.Attribute.String;
        bloc3Text: Schema.Attribute.Blocks;
        bloc3Titre: Schema.Attribute.String;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        ctaLabel: Schema.Attribute.String &
            Schema.Attribute.DefaultTo<'En savoir +'>;
        ctaUri: Schema.Attribute.String;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::mecenat-reassurance.mecenat-reassurance'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        slug: Schema.Attribute.UID<'titre'> & Schema.Attribute.Required;
        titre: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'Comment fonctionne le m\u00E9c\u00E9nat ?'>;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiNewsletterNewsletter extends Struct.CollectionTypeSchema {
    collectionName: 'newsletters';
    info: {
        displayName: 'Newsletter';
        pluralName: 'newsletters';
        singularName: 'newsletter';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        email: Schema.Attribute.Email &
            Schema.Attribute.Required &
            Schema.Attribute.Unique;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::newsletter.newsletter'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiPageContactPageContact extends Struct.SingleTypeSchema {
    collectionName: 'page_contacts';
    info: {
        description: '';
        displayName: 'Page Contact';
        pluralName: 'page-contacts';
        singularName: 'page-contact';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        contenu: Schema.Attribute.Blocks;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        FAQ: Schema.Attribute.Component<'page-sections.faqs', false>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::page-contact.page-contact'
        > &
            Schema.Attribute.Private;
        metaDescription: Schema.Attribute.Text;
        metaTitle: Schema.Attribute.String;
        publishedAt: Schema.Attribute.DateTime;
        slug: Schema.Attribute.UID;
        titre: Schema.Attribute.String;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
        visuel: Schema.Attribute.Media<'images'>;
    };
}

export interface ApiPageCookiePageCookie extends Struct.SingleTypeSchema {
    collectionName: 'page_cookies';
    info: {
        description: '';
        displayName: 'Page Cookie';
        pluralName: 'page-cookies';
        singularName: 'page-cookie';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        contenu: Schema.Attribute.Blocks;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::page-cookie.page-cookie'
        > &
            Schema.Attribute.Private;
        metaDescription: Schema.Attribute.Text;
        metaTitle: Schema.Attribute.String;
        publishedAt: Schema.Attribute.DateTime;
        slug: Schema.Attribute.UID;
        titre: Schema.Attribute.String;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiPageHomePageHome extends Struct.SingleTypeSchema {
    collectionName: 'page_homes';
    info: {
        description: '';
        displayName: 'Page Home';
        pluralName: 'page-homes';
        singularName: 'page-home';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        contenu: Schema.Attribute.DynamicZone<
            ['composant-atoms.section-texte-image']
        >;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        FAQ: Schema.Attribute.Component<'page-sections.faqs', false>;
        klub_projets_featured: Schema.Attribute.Relation<
            'oneToMany',
            'api::klub-projet.klub-projet'
        >;
        klubrs_featured: Schema.Attribute.Relation<
            'oneToMany',
            'api::klubr.klubr'
        >;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::page-home.page-home'
        > &
            Schema.Attribute.Private;
        metaDescription: Schema.Attribute.Text;
        metaTitle: Schema.Attribute.String;
        partnerList: Schema.Attribute.DynamicZone<
            ['composant-atoms.partner-item']
        >;
        publishedAt: Schema.Attribute.DateTime;
        slider: Schema.Attribute.DynamicZone<['composant-atoms.slider-hp']>;
        slug: Schema.Attribute.UID;
        titre: Schema.Attribute.String;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiPageListeDonPageListeDon extends Struct.SingleTypeSchema {
    collectionName: 'page_liste_dons';
    info: {
        displayName: 'Page Liste des dons';
        pluralName: 'page-liste-dons';
        singularName: 'page-liste-don';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        FAQ: Schema.Attribute.Component<'page-sections.faqs', false>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::page-liste-don.page-liste-don'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiPageMecenatPageMecenat extends Struct.SingleTypeSchema {
    collectionName: 'page_mecenats';
    info: {
        description: '';
        displayName: 'Page m\u00E9c\u00E9nat';
        pluralName: 'page-mecenats';
        singularName: 'page-mecenat';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'import-export-entries': {
            idField: 'slug';
        };
    };
    attributes: {
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        FAQ: Schema.Attribute.Component<'page-sections.faqs', false>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::page-mecenat.page-mecenat'
        > &
            Schema.Attribute.Private;
        metaDescription: Schema.Attribute.String;
        metaTitle: Schema.Attribute.String;
        publishedAt: Schema.Attribute.DateTime;
        slider: Schema.Attribute.DynamicZone<['composant-atoms.slider-hp']>;
        slug: Schema.Attribute.UID<'titre'> & Schema.Attribute.Required;
        titre: Schema.Attribute.String;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiReceiptCancellationReceiptCancellation
    extends Struct.CollectionTypeSchema {
    collectionName: 'receipt_cancellations';
    info: {
        description: 'Donation receipt cancellation workflow';
        displayName: 'Receipt Cancellation';
        pluralName: 'receipt-cancellations';
        singularName: 'receipt-cancellation';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        cancellation_reason: Schema.Attribute.Enumeration<
            ['donor_request', 'duplicate', 'error', 'fraud', 'other']
        > &
            Schema.Attribute.Required;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::receipt-cancellation.receipt-cancellation'
        > &
            Schema.Attribute.Private;
        notes: Schema.Attribute.Text;
        original_donation: Schema.Attribute.Relation<
            'manyToOne',
            'api::klub-don.klub-don'
        >;
        processed_at: Schema.Attribute.DateTime;
        processed_by: Schema.Attribute.Relation<
            'manyToOne',
            'plugin::users-permissions.user'
        >;
        publishedAt: Schema.Attribute.DateTime;
        refund_amount: Schema.Attribute.Decimal;
        refund_stripe_id: Schema.Attribute.String;
        requested_at: Schema.Attribute.DateTime;
        requested_by: Schema.Attribute.Relation<
            'manyToOne',
            'plugin::users-permissions.user'
        >;
        status: Schema.Attribute.Enumeration<
            ['pending', 'approved', 'rejected', 'completed']
        > &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'pending'>;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiTemplateProjectsCategoryTemplateProjectsCategory
    extends Struct.CollectionTypeSchema {
    collectionName: 'template_projects_categories';
    info: {
        description: '';
        displayName: 'Template Projects Category';
        pluralName: 'template-projects-categories';
        singularName: 'template-projects-category';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        icon: Schema.Attribute.String;
        klub_projets: Schema.Attribute.Relation<
            'oneToMany',
            'api::klub-projet.klub-projet'
        >;
        label: Schema.Attribute.String & Schema.Attribute.Required;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::template-projects-category.template-projects-category'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        sportType: Schema.Attribute.Enumeration<
            [
                'Autre',
                'A\u00EFkido',
                'Aquatique',
                'Athl\u00E9tisme',
                'Badminton',
                'Baseball',
                'Basket-ball',
                'Billard',
                'Boxe',
                'Can\u00F6e',
                'Course \u00E0 pied',
                'Danse',
                'Equitation',
                'Escalade',
                'Escrime',
                'Fl\u00E9chettes',
                'Football',
                'Golf',
                'Gymnastique',
                'Handball',
                'Hockey',
                'Hockey sur glace',
                'Judo',
                'Karat\u00E9',
                'Lutte',
                'Moto',
                'Natation',
                'Nautisme',
                'Patinage',
                'P\u00EAche',
                'P\u00E9tanque',
                'Planche \u00E0 voile',
                'Plong\u00E9e sous marine',
                'Ski alpin',
                'Ski de fond',
                'Ski nautique',
                'Sp\u00E9l\u00E9ologie',
                'Sports automobiles',
                'Taekwondo',
                'Tennis',
                'Tennis de table',
                "Tir \u00E0 l'arc",
                'Triathlon',
                'V\u00E9lo/BMX/VTT',
                'Volleyball',
                'Waterpolo',
                'Trail',
            ]
        >;
        template_projects_library: Schema.Attribute.Relation<
            'manyToOne',
            'api::template-projects-library.template-projects-library'
        >;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface ApiTemplateProjectsLibraryTemplateProjectsLibrary
    extends Struct.CollectionTypeSchema {
    collectionName: 'template_projects_libraries';
    info: {
        description: '';
        displayName: 'Template Projects Library';
        pluralName: 'template-projects-libraries';
        singularName: 'template-projects-library';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        klubr: Schema.Attribute.Relation<'manyToOne', 'api::klubr.klubr'>;
        label: Schema.Attribute.String & Schema.Attribute.Required;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::template-projects-library.template-projects-library'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        sportType: Schema.Attribute.Enumeration<
            [
                'Autre',
                'A\u00EFkido',
                'Aquatique',
                'Athl\u00E9tisme',
                'Badminton',
                'Baseball',
                'Basket-ball',
                'Billard',
                'Boxe',
                'Can\u00F6e',
                'Course \u00E0 pied',
                'Danse',
                'Equitation',
                'Escalade',
                'Escrime',
                'Fl\u00E9chettes',
                'Football',
                'Golf',
                'Gymnastique',
                'Handball',
                'Hockey',
                'Hockey sur glace',
                'Judo',
                'Karat\u00E9',
                'Lutte',
                'Moto',
                'Natation',
                'Nautisme',
                'Patinage',
                'P\u00EAche',
                'P\u00E9tanque',
                'Planche \u00E0 voile',
                'Plong\u00E9e sous marine',
                'Ski alpin',
                'Ski de fond',
                'Ski nautique',
                'Sp\u00E9l\u00E9ologie',
                'Sports automobiles',
                'Taekwondo',
                'Tennis',
                'Tennis de table',
                "Tir \u00E0 l'arc",
                'Triathlon',
                'V\u00E9lo/BMX/VTT',
                'Volleyball',
                'Waterpolo',
                'Trail',
            ]
        >;
        template_projects_categories: Schema.Attribute.Relation<
            'oneToMany',
            'api::template-projects-category.template-projects-category'
        >;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
        weight: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    };
}

export interface ApiTradePolicyTradePolicy extends Struct.CollectionTypeSchema {
    collectionName: 'trade_policies';
    info: {
        description: '';
        displayName: 'Trade policy';
        pluralName: 'trade-policies';
        singularName: 'trade-policy';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        allowKlubrContribution: Schema.Attribute.Boolean &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<true>;
        billingDescription: Schema.Attribute.String;
        commissionPercentage: Schema.Attribute.Decimal &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<6>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        defaultTradePolicy: Schema.Attribute.Boolean &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<false>;
        donor_pays_fee: Schema.Attribute.Boolean &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<false>;
        fee_model: Schema.Attribute.Enumeration<
            ['percentage_only', 'fixed_only', 'percentage_plus_fixed']
        > &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'percentage_only'>;
        fixed_amount: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
        klubDonationDescription: Schema.Attribute.String;
        klubDonationPercentage: Schema.Attribute.Decimal &
            Schema.Attribute.DefaultTo<0>;
        klubDonationReference: Schema.Attribute.String;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::trade-policy.trade-policy'
        > &
            Schema.Attribute.Private;
        noBilling: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
        perDonationCost: Schema.Attribute.Decimal &
            Schema.Attribute.DefaultTo<0>;
        publishedAt: Schema.Attribute.DateTime;
        reference: Schema.Attribute.String;
        tradePolicyLabel: Schema.Attribute.String & Schema.Attribute.Required;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
        VATPercentage: Schema.Attribute.Decimal &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<20>;
    };
}

export interface ApiWebhookLogWebhookLog extends Struct.CollectionTypeSchema {
    collectionName: 'webhook_logs';
    info: {
        description: 'Stripe webhook event logs';
        displayName: 'Webhook Log';
        pluralName: 'webhook-logs';
        singularName: 'webhook-log';
    };
    options: {
        draftAndPublish: false;
    };
    attributes: {
        account_id: Schema.Attribute.String;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        error_message: Schema.Attribute.Text;
        event_id: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.Unique;
        event_type: Schema.Attribute.String & Schema.Attribute.Required;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'api::webhook-log.webhook-log'
        > &
            Schema.Attribute.Private;
        payload: Schema.Attribute.JSON;
        processed: Schema.Attribute.Boolean &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<false>;
        processed_at: Schema.Attribute.DateTime;
        publishedAt: Schema.Attribute.DateTime;
        retry_count: Schema.Attribute.Integer &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<0>;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

export interface PluginContentReleasesRelease
    extends Struct.CollectionTypeSchema {
    collectionName: 'strapi_releases';
    info: {
        displayName: 'Release';
        pluralName: 'releases';
        singularName: 'release';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        actions: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::content-releases.release-action'
        >;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::content-releases.release'
        > &
            Schema.Attribute.Private;
        name: Schema.Attribute.String & Schema.Attribute.Required;
        publishedAt: Schema.Attribute.DateTime;
        releasedAt: Schema.Attribute.DateTime;
        scheduledAt: Schema.Attribute.DateTime;
        status: Schema.Attribute.Enumeration<
            ['ready', 'blocked', 'failed', 'done', 'empty']
        > &
            Schema.Attribute.Required;
        timezone: Schema.Attribute.String;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
    };
}

export interface PluginContentReleasesReleaseAction
    extends Struct.CollectionTypeSchema {
    collectionName: 'strapi_release_actions';
    info: {
        displayName: 'Release Action';
        pluralName: 'release-actions';
        singularName: 'release-action';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        contentType: Schema.Attribute.String & Schema.Attribute.Required;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        entryDocumentId: Schema.Attribute.String;
        isEntryValid: Schema.Attribute.Boolean;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::content-releases.release-action'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        release: Schema.Attribute.Relation<
            'manyToOne',
            'plugin::content-releases.release'
        >;
        type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
            Schema.Attribute.Required;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
    };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
    collectionName: 'i18n_locale';
    info: {
        collectionName: 'locales';
        description: '';
        displayName: 'Locale';
        pluralName: 'locales';
        singularName: 'locale';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        code: Schema.Attribute.String & Schema.Attribute.Unique;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::i18n.locale'
        > &
            Schema.Attribute.Private;
        name: Schema.Attribute.String &
            Schema.Attribute.SetMinMax<
                {
                    max: 50;
                    min: 1;
                },
                number
            >;
        publishedAt: Schema.Attribute.DateTime;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
    };
}

export interface PluginReviewWorkflowsWorkflow
    extends Struct.CollectionTypeSchema {
    collectionName: 'strapi_workflows';
    info: {
        description: '';
        displayName: 'Workflow';
        name: 'Workflow';
        pluralName: 'workflows';
        singularName: 'workflow';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        contentTypes: Schema.Attribute.JSON &
            Schema.Attribute.Required &
            Schema.Attribute.DefaultTo<'[]'>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::review-workflows.workflow'
        > &
            Schema.Attribute.Private;
        name: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.Unique;
        publishedAt: Schema.Attribute.DateTime;
        stageRequiredToPublish: Schema.Attribute.Relation<
            'oneToOne',
            'plugin::review-workflows.workflow-stage'
        >;
        stages: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::review-workflows.workflow-stage'
        >;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
    };
}

export interface PluginReviewWorkflowsWorkflowStage
    extends Struct.CollectionTypeSchema {
    collectionName: 'strapi_workflows_stages';
    info: {
        description: '';
        displayName: 'Stages';
        name: 'Workflow Stage';
        pluralName: 'workflow-stages';
        singularName: 'workflow-stage';
    };
    options: {
        draftAndPublish: false;
        version: '1.1.0';
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::review-workflows.workflow-stage'
        > &
            Schema.Attribute.Private;
        name: Schema.Attribute.String;
        permissions: Schema.Attribute.Relation<
            'manyToMany',
            'admin::permission'
        >;
        publishedAt: Schema.Attribute.DateTime;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        workflow: Schema.Attribute.Relation<
            'manyToOne',
            'plugin::review-workflows.workflow'
        >;
    };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
    collectionName: 'files';
    info: {
        description: '';
        displayName: 'File';
        pluralName: 'files';
        singularName: 'file';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        alternativeText: Schema.Attribute.String;
        caption: Schema.Attribute.String;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        ext: Schema.Attribute.String;
        folder: Schema.Attribute.Relation<
            'manyToOne',
            'plugin::upload.folder'
        > &
            Schema.Attribute.Private;
        folderPath: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.Private &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        formats: Schema.Attribute.JSON;
        hash: Schema.Attribute.String & Schema.Attribute.Required;
        height: Schema.Attribute.Integer;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::upload.file'
        > &
            Schema.Attribute.Private;
        mime: Schema.Attribute.String & Schema.Attribute.Required;
        name: Schema.Attribute.String & Schema.Attribute.Required;
        previewUrl: Schema.Attribute.String;
        provider: Schema.Attribute.String & Schema.Attribute.Required;
        provider_metadata: Schema.Attribute.JSON;
        publishedAt: Schema.Attribute.DateTime;
        related: Schema.Attribute.Relation<'morphToMany'>;
        size: Schema.Attribute.Decimal & Schema.Attribute.Required;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        url: Schema.Attribute.String & Schema.Attribute.Required;
        width: Schema.Attribute.Integer;
    };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
    collectionName: 'upload_folders';
    info: {
        displayName: 'Folder';
        pluralName: 'folders';
        singularName: 'folder';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        children: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::upload.folder'
        >;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::upload.folder'
        > &
            Schema.Attribute.Private;
        name: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
        path: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 1;
            }>;
        pathId: Schema.Attribute.Integer &
            Schema.Attribute.Required &
            Schema.Attribute.Unique;
        publishedAt: Schema.Attribute.DateTime;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
    };
}

export interface PluginUsersPermissionsPermission
    extends Struct.CollectionTypeSchema {
    collectionName: 'up_permissions';
    info: {
        description: '';
        displayName: 'Permission';
        name: 'permission';
        pluralName: 'permissions';
        singularName: 'permission';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        action: Schema.Attribute.String & Schema.Attribute.Required;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::users-permissions.permission'
        > &
            Schema.Attribute.Private;
        publishedAt: Schema.Attribute.DateTime;
        role: Schema.Attribute.Relation<
            'manyToOne',
            'plugin::users-permissions.role'
        >;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
    };
}

export interface PluginUsersPermissionsRole
    extends Struct.CollectionTypeSchema {
    collectionName: 'up_roles';
    info: {
        description: '';
        displayName: 'Role';
        name: 'role';
        pluralName: 'roles';
        singularName: 'role';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'content-manager': {
            visible: false;
        };
        'content-type-builder': {
            visible: false;
        };
    };
    attributes: {
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        description: Schema.Attribute.String;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::users-permissions.role'
        > &
            Schema.Attribute.Private;
        name: Schema.Attribute.String &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 3;
            }>;
        permissions: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::users-permissions.permission'
        >;
        publishedAt: Schema.Attribute.DateTime;
        type: Schema.Attribute.String & Schema.Attribute.Unique;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        users: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::users-permissions.user'
        >;
    };
}

export interface PluginUsersPermissionsUser
    extends Struct.CollectionTypeSchema {
    collectionName: 'up_users';
    info: {
        description: '';
        displayName: 'User';
        name: 'user';
        pluralName: 'users';
        singularName: 'user';
    };
    options: {
        draftAndPublish: false;
    };
    pluginOptions: {
        'import-export-entries': {
            idField: 'email';
        };
    };
    attributes: {
        anonymized: Schema.Attribute.Boolean &
            Schema.Attribute.Private &
            Schema.Attribute.DefaultTo<false>;
        avatar: Schema.Attribute.Media<'images'>;
        blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
        confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
        confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
        createdAt: Schema.Attribute.DateTime;
        createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        email: Schema.Attribute.Email &
            Schema.Attribute.Required &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 6;
            }>;
        klubr_membres: Schema.Attribute.Relation<
            'oneToMany',
            'api::klubr-membre.klubr-membre'
        >;
        last_member_profile_used: Schema.Attribute.String;
        lastLogin: Schema.Attribute.DateTime;
        locale: Schema.Attribute.String & Schema.Attribute.Private;
        localizations: Schema.Attribute.Relation<
            'oneToMany',
            'plugin::users-permissions.user'
        > &
            Schema.Attribute.Private;
        nom: Schema.Attribute.String;
        optin: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
        origine: Schema.Attribute.Enumeration<['donateur', 'signupForm']> &
            Schema.Attribute.DefaultTo<'signupForm'>;
        password: Schema.Attribute.Password &
            Schema.Attribute.Private &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 6;
            }>;
        provider: Schema.Attribute.String;
        publishedAt: Schema.Attribute.DateTime;
        resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
        role: Schema.Attribute.Relation<
            'manyToOne',
            'plugin::users-permissions.role'
        >;
        status: Schema.Attribute.Enumeration<
            ['pending', 'validated', 'deleted']
        > &
            Schema.Attribute.DefaultTo<'pending'>;
        updatedAt: Schema.Attribute.DateTime;
        updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
            Schema.Attribute.Private;
        username: Schema.Attribute.String &
            Schema.Attribute.Unique &
            Schema.Attribute.SetMinMaxLength<{
                minLength: 3;
            }>;
        uuid: Schema.Attribute.UID<
            undefined,
            {
                'disable-auto-fill': true;
                'disable-regenerate': true;
            }
        > &
            Schema.Attribute.CustomField<
                'plugin::strapi-advanced-uuid.uuid',
                {
                    'disable-auto-fill': true;
                    'disable-regenerate': true;
                }
            >;
    };
}

declare module '@strapi/strapi' {
    export module Public {
        export interface ContentTypeSchemas {
            'admin::api-token': AdminApiToken;
            'admin::api-token-permission': AdminApiTokenPermission;
            'admin::permission': AdminPermission;
            'admin::role': AdminRole;
            'admin::transfer-token': AdminTransferToken;
            'admin::transfer-token-permission': AdminTransferTokenPermission;
            'admin::user': AdminUser;
            'api::blog.blog': ApiBlogBlog;
            'api::cgu-klub.cgu-klub': ApiCguKlubCguKlub;
            'api::cgu.cgu': ApiCguCgu;
            'api::connected-account.connected-account': ApiConnectedAccountConnectedAccount;
            'api::contact.contact': ApiContactContact;
            'api::federation.federation': ApiFederationFederation;
            'api::financial-audit-log.financial-audit-log': ApiFinancialAuditLogFinancialAuditLog;
            'api::invoice-line.invoice-line': ApiInvoiceLineInvoiceLine;
            'api::invoice.invoice': ApiInvoiceInvoice;
            'api::klub-don-payment.klub-don-payment': ApiKlubDonPaymentKlubDonPayment;
            'api::klub-don.klub-don': ApiKlubDonKlubDon;
            'api::klub-projet.klub-projet': ApiKlubProjetKlubProjet;
            'api::klubr-document.klubr-document': ApiKlubrDocumentKlubrDocument;
            'api::klubr-donateur.klubr-donateur': ApiKlubrDonateurKlubrDonateur;
            'api::klubr-house.klubr-house': ApiKlubrHouseKlubrHouse;
            'api::klubr-info.klubr-info': ApiKlubrInfoKlubrInfo;
            'api::klubr-membre.klubr-membre': ApiKlubrMembreKlubrMembre;
            'api::klubr-subscription.klubr-subscription': ApiKlubrSubscriptionKlubrSubscription;
            'api::klubr.klubr': ApiKlubrKlubr;
            'api::mecenat-reassurance.mecenat-reassurance': ApiMecenatReassuranceMecenatReassurance;
            'api::newsletter.newsletter': ApiNewsletterNewsletter;
            'api::page-contact.page-contact': ApiPageContactPageContact;
            'api::page-cookie.page-cookie': ApiPageCookiePageCookie;
            'api::page-home.page-home': ApiPageHomePageHome;
            'api::page-liste-don.page-liste-don': ApiPageListeDonPageListeDon;
            'api::page-mecenat.page-mecenat': ApiPageMecenatPageMecenat;
            'api::receipt-cancellation.receipt-cancellation': ApiReceiptCancellationReceiptCancellation;
            'api::template-projects-category.template-projects-category': ApiTemplateProjectsCategoryTemplateProjectsCategory;
            'api::template-projects-library.template-projects-library': ApiTemplateProjectsLibraryTemplateProjectsLibrary;
            'api::trade-policy.trade-policy': ApiTradePolicyTradePolicy;
            'api::webhook-log.webhook-log': ApiWebhookLogWebhookLog;
            'plugin::content-releases.release': PluginContentReleasesRelease;
            'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
            'plugin::i18n.locale': PluginI18NLocale;
            'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
            'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
            'plugin::upload.file': PluginUploadFile;
            'plugin::upload.folder': PluginUploadFolder;
            'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
            'plugin::users-permissions.role': PluginUsersPermissionsRole;
            'plugin::users-permissions.user': PluginUsersPermissionsUser;
        }
    }
}
