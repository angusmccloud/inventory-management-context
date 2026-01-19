# Quickstart — User Settings Controls

## Prerequisites
1. Clone/update all three repos in the workspace (`inventory-management-context`, `inventory-management-frontend`, `inventory-management-backend`).
2. Ensure Node.js 20.x LTS, pnpm/npm (per repo standard), and AWS SAM CLI are installed.
3. Export Cognito + SES environment variables (`COGNITO_USER_POOL_ID`, `SES_SENDER`, etc.) via `.env.local` (frontend) and `samconfig.toml`/Parameter Store (backend).
4. Start DynamoDB Local (if used) or configure access to the shared dev table.
5. For email verification testing, run an SES emulator (LocalStack or SES sandbox tooling) and capture outbound receipts.

## Local Development Workflow
1. **Backend**
   - In `inventory-management-backend`, add/update the Lambda handlers under `src/handlers/user-settings/` matching the contracts in `specs/015-user-settings/contracts/user-settings.yaml`.
   - Define resources + permissions inside `template.yaml` (one `AWS::Serverless::Function` per handler, DynamoDB + Cognito permissions, SES send privileges for notifications).
   - Run `npm run lint && npm run test && npx tsc --noEmit` before `sam build` / `sam local start-api`.
2. **Frontend**
   - In `inventory-management-frontend`, add the User Settings tab at `app/(settings)/user-settings/page.tsx` and supporting client components.
   - Use common Dialog/Form/Button components for the credential flows and respect the `{data: T}` API client contract.
   - Execute `npm run lint`, `npm run test`, `npx tsc --noEmit`, and `npm run build` per constitution prior to opening a PR.
3. **End-to-end validation**
   - With `sam local start-api` and `npm run dev` running, walk through: name edit, email change (including email confirmation), password change (ensure session invalidation), initiate + confirm account deletion for both "only member" and "shared family" scenarios.
   - Verify audit log items and DynamoDB TTL expiration for verification tickets using AWS console or DynamoDB Local inspector.
   - Confirm email-change and deletion receipts appear in the SES emulator inbox or sandbox logs.

## Testing Expectations
- **Unit tests**: Cover form validation, rate limiting UI states, and backend handlers (happy path + failure cases such as incorrect password, duplicate email, expired ticket).
- **Integration tests**: Use SAM local/in-memory DynamoDB to ensure transactionally safe deletion when memberCount hits zero.
- **Accessibility checks**: Run axe-core (or equivalent) to confirm dialog focus management and button target sizes meet WCAG 2.1 AA.
- **Performance smoke**: Measure API latency with 95th percentile < 60s for credential change flows (most operations should be near-instant; the metric protects asynchronous verification pipelines).

## Deployment Checklist
1. `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build` (frontend) – all must pass locally.
2. `npm run lint`, `npm run test`, `npx tsc --noEmit`, and `sam build` (backend) – ensure zero warnings escalate into CI failures.
3. Confirm `template.yaml` contains IAM least-privilege statements for Cognito, DynamoDB, and SES.
4. Update `.specify/scripts/bash/sync-agent-contexts.sh` output (done in this plan) so all AI agents know about the new tech notes.
5. Prepare rollout comms highlighting the irreversible deletion dialog and support expectations.
