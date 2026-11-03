# Deployment and Operations Pointer

Read [../../DEPLOYMENT.md](../../DEPLOYMENT.md).

Current Production evidence:

- Vercel project: `didar-website`
- deployment: `dpl_9H4DxWc3hT44yfK5giN2g5DhvGaJ`
- source branch: `feature/event-upload-custom-slugs`
- source commit: `0b1379e...`
- state: READY

Default branch:

- `main`
- current HEAD at audit time: `0c6cb98d...`

Production and main are not identical.

Migration 014 is present in Git but its Production application is NOT VERIFIED.

## Safe operational sequence

1. Check [PROJECT_STATE.md](../../PROJECT_STATE.md).
2. Read [DEPLOYMENT.md](../../DEPLOYMENT.md).
3. Verify any migration/bucket prerequisite in the target Supabase project.
4. Deploy dependent code only after the database/storage prerequisite is confirmed.
5. Verify Vercel READY state and post-deploy health.
6. Verify real email delivery for email changes.
7. Record Production evidence separately from repository evidence.
