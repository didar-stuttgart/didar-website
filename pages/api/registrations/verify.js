/**
 * Event registration verification endpoint — DISABLED
 * 
 * This endpoint is NO LONGER USED in the manual registration model.
 * Email verification is not part of the current workflow.
 * 
 * Existing email links that point to /api/registrations/verify will receive 404.
 * This is correct behavior: users don't need to click verification links.
 * Registrations are reviewed and confirmed manually by admins.
 */

export default async function handler(req, res) {
  return res.status(404).json({
    error: 'Email verification is not part of the current registration workflow',
    note: 'Manual event registration does not require email verification. Your registration has been received and will be reviewed by DIDAR.',
  });
}
