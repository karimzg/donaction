import { NextRequest, NextResponse } from 'next/server';

const STRAPI_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1437';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Validate environment variables at module load (fail fast)
if (!STRAPI_API_TOKEN) {
    throw new Error(
        'STRAPI_API_TOKEN manquant dans les variables d\'environnement. Vérifiez votre fichier .env'
    );
}

/**
 * Creates a new klubr with Stripe Connect account
 * POST /api/klubr/create
 */
export async function POST(request: NextRequest) {
    console.log('\n🎯 ════════════════════════════════════════════════════════');
    console.log('🎯 NEXT.JS API: POST /api/klubr/create');
    console.log('🎯 ════════════════════════════════════════════════════════\n');

    try {
        const body = await request.json();
        const {
            klubrData,
            memberUuid,
            businessType = 'non_profit',
            country = 'FR',
            returnUrl,
            refreshUrl,
        } = body;

        // Validate required fields
        if (!klubrData) {
            return NextResponse.json(
                { error: 'Le champ klubrData est requis' },
                { status: 400 }
            );
        }

        if (!memberUuid) {
            return NextResponse.json(
                { error: 'Le champ memberUuid est requis' },
                { status: 400 }
            );
        }

        if (!returnUrl || !refreshUrl) {
            return NextResponse.json(
                {
                    error: 'Les champs returnUrl et refreshUrl sont requis pour l\'onboarding Stripe',
                },
                { status: 400 }
            );
        }

        // Step 1: Create klubr via Strapi
        console.log(
            `📝 Étape 1: Création du klubr via Strapi pour le membre ${memberUuid}`
        );

        const klubrResponse = await fetch(
            `${STRAPI_API_URL}/api/klubrs/new/by-leader/${memberUuid}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                body: JSON.stringify({ data: klubrData }),
            }
        );

        if (!klubrResponse.ok) {
            const errorData = await klubrResponse.json();
            console.error(
                '❌ Erreur lors de la création du klubr:',
                errorData
            );
            return NextResponse.json(
                {
                    error: 'Échec de la création du klubr',
                    details: errorData,
                },
                { status: klubrResponse.status }
            );
        }

        const klubr = await klubrResponse.json();
        console.log(`✅ Klubr créé avec succès (ID: ${klubr.data.id})`);

        // Step 2: Create Stripe connected account
        console.log(
            `💳 Étape 2: Création du compte Stripe Connect pour le klubr ${klubr.data.id}`
        );

        const stripeAccountResponse = await fetch(
            `${STRAPI_API_URL}/api/stripe-connect/accounts`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                body: JSON.stringify({
                    klubrId: klubr.data.id,
                    businessType: businessType,
                    country: country,
                }),
            }
        );

        if (!stripeAccountResponse.ok) {
            const errorData = await stripeAccountResponse.json();
            console.error(
                '❌ Erreur lors de la création du compte Stripe:',
                errorData
            );

            // Klubr was created but Stripe account failed
            // Return klubr data with error flag
            return NextResponse.json(
                {
                    success: true,
                    klubr: klubr.data,
                    stripeConnectError: true,
                    stripeErrorDetails: errorData,
                    message:
                        'Klubr créé mais échec de la création du compte Stripe Connect',
                },
                { status: 200 }
            );
        }

        const stripeAccount = await stripeAccountResponse.json();
        console.log(
            `✅ Compte Stripe Connect créé: ${stripeAccount.data.accountId}`
        );

        // Step 3: Generate onboarding link
        console.log(
            `🔗 Étape 3: Génération du lien d'onboarding Stripe`
        );

        const onboardingLinkResponse = await fetch(
            `${STRAPI_API_URL}/api/stripe-connect/accounts/${stripeAccount.data.accountId}/onboarding-link`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                body: JSON.stringify({
                    refreshUrl: refreshUrl,
                    returnUrl: returnUrl,
                }),
            }
        );

        if (!onboardingLinkResponse.ok) {
            const errorData = await onboardingLinkResponse.json();
            console.error(
                '❌ Erreur lors de la génération du lien d\'onboarding:',
                errorData
            );

            // Klubr and account created but onboarding link failed
            return NextResponse.json(
                {
                    success: true,
                    klubr: klubr.data,
                    stripeAccount: stripeAccount.data,
                    onboardingLinkError: true,
                    message:
                        'Klubr et compte Stripe créés mais échec de la génération du lien d\'onboarding',
                },
                { status: 200 }
            );
        }

        const onboardingLink = await onboardingLinkResponse.json();
        console.log(
            `✅ Lien d'onboarding généré: ${onboardingLink.data.url}`
        );

        console.log(
            '\n🎉 ════════════════════════════════════════════════════════'
        );
        console.log('🎉 Création réussie avec Stripe Connect intégré');
        console.log(
            '🎉 ════════════════════════════════════════════════════════\n'
        );

        // Return complete response
        return NextResponse.json({
            success: true,
            data: {
                klubr: klubr.data,
                stripeAccount: {
                    accountId: stripeAccount.data.accountId,
                    status: stripeAccount.data.status,
                },
                onboarding: {
                    url: onboardingLink.data.url,
                    expiresAt: onboardingLink.data.expiresAt,
                },
            },
            message:
                'Klubr créé avec succès. Veuillez compléter l\'onboarding Stripe.',
        });
    } catch (error) {
        console.error(
            '❌ Erreur lors de la création du klubr avec Stripe Connect:',
            error
        );

        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

        return NextResponse.json(
            {
                error: 'Erreur interne du serveur',
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}
