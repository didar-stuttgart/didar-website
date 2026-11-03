# Known Issues and Project State Pointer

Read [../../PROJECT_STATE.md](../../PROJECT_STATE.md).

Do not copy an independent issue list here.

Known intentional issues include:

- event auto-open behavior;
- ineffective capacity-status endpoint;
- recurring-without-date classification;
- unused registration deadline;
- registration CSV event-column defect;
- legacy fix endpoint;
- direct anon INSERT hardening opportunity;
- PBKDF2 cost;
- no global login throttle/CAPTCHA/CSP;
- legacy/dead code.

Production application of migrations 013 and 014 remains NOT VERIFIED.

## Current verification boundary

The repository can prove source implementation, but it cannot by itself prove:

- Production application of migrations 013/014;
- existence/configuration of the Production `event-images` bucket;
- fresh email delivery for a specific test;
- live rendered page output when only cache-level HTTP evidence is available.

Use PASS / FAIL / BLOCKED / NOT VERIFIED according to actual evidence.
