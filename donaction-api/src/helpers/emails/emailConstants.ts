/**
 * Centralized admin email configuration.
 * Used by both sendBrevoTransacEmail and emailService for admin-destined emails.
 */
export const ADMIN_EMAIL_PRIMARY =
    process.env.ADMIN_EMAIL_PRIMARY || 'hello@donaction.fr';
export const ADMIN_EMAIL_BCC =
    process.env.ADMIN_EMAIL_BCC || 'k.zgoulli@gmail.com';
