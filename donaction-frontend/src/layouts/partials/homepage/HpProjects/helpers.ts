/**
 * Calculates deadline info for a project based on its funding deadline date.
 */
export function getProjectDeadlineInfo(dateLimiteFinancementProjet: Date | string | null | undefined) {
  if (!dateLimiteFinancementProjet) {
    return { isExpired: false, daysLeft: null };
  }

  const deadline = new Date(dateLimiteFinancementProjet);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    isExpired: daysLeft < 0,
    daysLeft: daysLeft >= 0 ? daysLeft : null,
  };
}
