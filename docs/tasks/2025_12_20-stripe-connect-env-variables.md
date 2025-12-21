# Stripe Connect Environment Variables

## New Environment Variable Required

For Phase 2: Stripe Connect Integration, add the following environment variable to your `.env` files:

### donaction-api/.env

```bash
# Stripe Connect Webhook Secret
# Get this from: Stripe Dashboard → Developers → Webhooks → Endpoint → Signing secret
STRIPE_WEBHOOK_SECRET_CONNECT=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Setup Instructions

1. **Create Webhook Endpoint in Stripe Dashboard**:
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://your-api-domain.com/api/stripe-connect/webhook`
   - Events to listen for:
     - `account.updated`
     - `account.external_account.created`
     - `account.external_account.updated`
     - `capability.updated`
     - `person.created`
     - `person.updated`

2. **Copy Signing Secret**:
   - After creating the endpoint, click "Reveal" next to "Signing secret"
   - Copy the value (starts with `whsec_`)

3. **Add to Environment Files**:
   - Add to `.env.development` for local development
   - Add to `.env.prod` for production
   - Add to `.env.re7` for staging

4. **Test with Stripe CLI** (Development):
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-brew/stripe

   # Login to Stripe
   stripe login

   # Forward webhooks to local server
   stripe listen --forward-to http://localhost:1437/api/stripe-connect/webhook

   # Copy the webhook signing secret from the output
   # It will look like: whsec_xxxxx
   ```

### Existing Stripe Variables

Make sure these are already configured:

```bash
# Stripe API Secret Key
STRIPE_SECRET_KEY=sk_test_xxxxx  # or sk_live_xxxxx for production

# Stripe Publishable Key (for frontend)
# This should be in donaction-frontend/.env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Verification

To verify the configuration is working:

1. Start the API server: `npm run develop`
2. Check logs for: `✅ STRIPE_SECRET_KEY validated`
3. Trigger a test webhook from Stripe CLI:
   ```bash
   stripe trigger account.updated
   ```
4. Check API logs for successful webhook processing

### Security Notes

- **Never commit** `.env` files to git
- Use different Stripe accounts/keys for development vs production
- Rotate webhook secrets periodically
- Test mode keys (test/pk_test) should only be used in development
