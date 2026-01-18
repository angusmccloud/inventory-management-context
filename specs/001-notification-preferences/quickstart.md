# Quickstart – Notification Preference Management

## Implementation Status

✅ **Completed** - All MVP (US1), US2, and US3 implementation tasks are complete.

This feature enables members to:
- Configure notification preferences per type/channel in Settings
- Receive immediate, daily, or weekly digest emails based on preferences
- Unsubscribe from all notifications via email links
- Admin users can preview pending notification deliveries

## Repository Structure

This project uses **separate repositories**:
- `inventory-management-backend` - AWS SAM Lambda functions and services
- `inventory-management-frontend` - Next.js 16 App Router application
- `inventory-management-context` - Specification and planning documents

## 1. Checkout Feature Branch

```bash
# Backend repo
cd inventory-management-backend
git checkout 001-notification-preferences

# Frontend repo
cd ../inventory-management-frontend
git checkout 001-notification-preferences
```

## 2. Install & Verify Dependencies

```bash
# From backend repo
npm install
npm run lint
npx tsc --noEmit
npm test

# From frontend repo
npm install
npm run lint
npx tsc --noEmit
npm test
```

## 3. Key Implementation Files

### Backend (inventory-management-backend)
- `src/models/member.ts` - Extended with `notificationPreferences`, `unsubscribeAllEmail`, timezone
- `src/services/notifications/preferencesService.ts` - Preference management service
- `src/services/notifications/deliveryLedger.ts` - Deduplication for immediate alerts
- `src/services/notifications/queuePreviewService.ts` - Admin preview of pending deliveries
- `src/handlers/notifications/immediateDispatcher.ts` - 15-minute job for immediate alerts
- `src/handlers/notifications/dailyDigest.ts` - Daily 9:00 AM digest emails
- `src/handlers/notifications/weeklyDigest.ts` - Monday 9:00 AM digest emails
- `src/handlers/notifications/unsubscribe.ts` - Token-based unsubscribe endpoint
- `src/handlers/notifications/queuePreview.ts` - Admin delivery queue preview
- `src/lib/email/templates/notificationDigest.ts` - Email template for digests
- `src/lib/monitoring/notificationMetrics.ts` - CloudWatch metrics helpers
- `src/config/domain.ts` - Centralized domain configuration (inventoryhq.io)
- `template.yaml` - EventBridge schedules and Lambda function definitions

### Frontend (inventory-management-frontend)
- `app/settings/notifications/page.tsx` - Notification preferences UI
- `app/api/notifications/preferences/route.ts` - Proxy to backend preferences API
- `app/api/notifications/unsubscribe/route.ts` - Proxy to backend unsubscribe API
- `lib/api/notifications.ts` - Typed API client helpers
- `components/common/NotificationPreferenceBanner.tsx` - Unsubscribe banner component
- `tests/settings/notifications.test.tsx` - React Testing Library coverage

## 4. Domain Configuration

All emails and links use the primary domain: **inventoryhq.io**

Configuration is centralized in `backend/src/config/domain.ts`:
- Email sender: `noreply@inventoryhq.io`
- Email reply-to: `support@inventoryhq.io`
- Frontend base URL: `https://inventoryhq.io`
- Override via environment: `FRONTEND_URL` and `SES_FROM_EMAIL`

## 5. Scheduled Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| Immediate Dispatcher | Every 15 minutes | Send immediate alerts for new unresolved notifications |
| Daily Digest | Daily 9:00 AM EST | Send digest emails to users with DAILY preference |
| Weekly Digest | Monday 9:00 AM EST | Send digest emails to users with WEEKLY preference |

Schedules are defined in `template.yaml` using EventBridge cron expressions (UTC).

## 6. Testing

```bash
# Backend tests (10 passing)
cd inventory-management-backend
npm test -- notifications

# Frontend tests (1 passing)
cd inventory-management-frontend
npm test -- settings/notifications
```

## 7. Monitoring & Verification

CloudWatch metrics are published to namespace `InventoryHQ/Notifications`:
- `EmailsSent` - Count of emails successfully sent
- `UsersTargeted` - Count of users targeted by job
- `Skipped` - Count of deliveries skipped (no notifications)
- `Errors` - Count of errors during job execution
- `JobDuration` - Time taken for job completion (ms)

All metrics are dimensioned by `JobType`: IMMEDIATE, DAILY, or WEEKLY.

## 8. Admin Endpoints

- `GET /notifications/delivery-queue?method=all|immediate|daily|weekly` - Preview pending deliveries (requires authentication)

## 9. Operational Workflow

### Normal Operation
1. **Notification Created**: Item added to DynamoDB with status=ACTIVE
2. **Immediate Job (every 15 min)**:
   - Queries active notifications
   - Filters by member IMMEDIATE preferences
   - Sends emails and marks deliveryLedger
   - Publishes CloudWatch metrics
3. **Daily/Weekly Jobs**:
   - Aggregate unsent active notifications
   - Group by type for digest template
   - Send digest emails to subscribers
   - Mark deliveryLedger to prevent duplicates
   - Publish CloudWatch metrics

### User Actions
- **Change Preferences**: Settings > Notifications UI → PATCH endpoint → Member record updated
- **Unsubscribe**: Email link → POST `/notifications/unsubscribe` → All email preferences set to NONE
- **Resolve Notification**: Inventory adjusted → status changed to RESOLVED → Excluded from future jobs

### Admin Operations
- **Preview Queue**: GET `/notifications/delivery-queue?jobType=DAILY` to see pending deliveries
- **Monitor Alarms**: CloudWatch dashboard for job health, error rates, performance
- **Audit Logs**: Search CloudWatch Logs for specific member/notification events

## 10. CloudWatch Alarms (SC-002/SC-003 Compliance)

Alarms defined in `template.yaml`:
- **ImmediateDispatcherErrorAlarm** - Alert if >5 errors in 15 min
- **ImmediateDispatcherLambdaErrorAlarm** - Alert on any Lambda failure
- **DailyDigestErrorAlarm** - Alert if >10 errors in 1 hour
- **DailyDigestLambdaErrorAlarm** - Alert on Lambda failure
- **WeeklyDigestErrorAlarm** - Alert if >10 errors in 1 hour
- **WeeklyDigestLambdaErrorAlarm** - Alert on Lambda failure
- **NotificationJobDurationAlarm** - Alert if avg duration >60s (performance degradation)

All alarms treat missing data as not breaching to avoid false positives during low-traffic periods.

## 11. Before Opening PR

```bash
# Backend
cd inventory-management-backend
npx tsc --noEmit
npm run build
npm run lint
npm test

# Frontend
cd inventory-management-frontend
npx tsc --noEmit
npm run build
npm run lint
npm test
```

Ensure all tests pass and coverage remains >80% on new modules.

### Deployment Notes
- Verify SES sender email is verified: `noreply@inventoryhq.io`
- Confirm EventBridge rules are enabled after deployment
- Test warmup orchestrator includes new notification handlers
- Validate CloudWatch alarm SNS topics are configured for alerts
