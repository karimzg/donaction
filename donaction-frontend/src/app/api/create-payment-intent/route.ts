import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	typescript: true,
});

export async function POST(req: NextRequest) {
	const data = await req.json();
	try {
		const paymentIntent = await stripe.paymentIntents.create({
			// Stripe divides the price by 100 (https://stripe.com/docs/currencies#zero-decimal)
			amount: Number(data.price) * 100,
			currency: 'eur',
			metadata: data?.metadata,
		});

		return NextResponse.json(paymentIntent.client_secret, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(error, {
			status: 400,
		});
	}
}
