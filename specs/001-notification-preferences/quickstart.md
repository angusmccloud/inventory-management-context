# Quickstart – Notification Preference Management

## 1. Checkout Feature Branch
```bash
git checkout 001-notification-preferences
```

## 2. Install & Verify Dependencies
```bash
npm install        # ensures frontend + backend packages available
npm run lint       # confirm no baseline lint errors
npx tsc --noEmit   # constitution-required global type check
npm test           # verify tests are passing before changes
```

## 3. Frontend Development Flow
1. Open `frontend/app/settings/notifications/page.tsx` (or create it) and render the preference matrix using shared components from `components/common/`.
2. Fetch preferences via `/api/notifications/preferences` using a typed client in `frontend/lib/api/notifications.ts`.
3. Add React Testing Library coverage in `frontend/tests/settings/notifications.test.tsx` covering:
   - Rendering of existing preferences
   - Interaction for toggling frequencies and saving
   - Handling unsubscribe-all banner state

## 4. Backend Development Flow
1. Define DynamoDB access helpers under `backend/src/services/notifications/preferencesService.ts` to load/update Member records.
2. Implement route handlers under `frontend/app/api/notifications/preferences/route.ts` (Next.js) using shared auth utilities and response helpers.
3. Create AWS Lambda handlers in `backend/src/handlers/notifications/`:
   - `immediateDispatcher.ts`: triggered every 15 minutes.
   - `dailyDigest.ts` and `weeklyDigest.ts`: cron schedules (9:00 local and Monday 9:00).
4. Write Jest unit tests for services, plus integration tests (SAM local or mocked DocumentClient) covering deduplication and timezone scheduling.

## 5. Email Footer & Compliance
- Update shared email template to append **Unsubscribe** and **Change my preferences** links.
- Build `/api/notifications/unsubscribe` handler referenced by the contracts; ensure tokens expire and audit logs capture action.

## 6. Monitoring & Verification
- Create CloudWatch metrics/alarms for each job (success count, failure count, throttles).
- Run end-to-end manual test: set Immediate preference, trigger sample notification, confirm email arrival, unsubscribe via link, verify UI updates accordingly.

## 7. Before Opening PR
```bash
npx tsc --noEmit
npm run build
npm run lint
npm test
```
Ensure >80% coverage on new modules and document any notable assumptions in the PR description.
