# Runbook: User Settings

## Scope
Covers operational procedures for user profile updates, credential changes, and GDPR account deletion for the User Settings tab.

## Ownership
- Primary: Backend on-call engineer
- Secondary: Frontend on-call engineer

## Key Endpoints
- `GET /user-settings/me` - Profile summary
- `PATCH /user-settings/profile` - Display name update
- `POST /user-settings/email-change` - Email change request
- `POST /user-settings/email-change/confirm` - Email change confirmation
- `POST /user-settings/password-change` - Password change
- `POST /user-settings/deletion` - Deletion request
- `POST /user-settings/deletion/confirm` - Deletion confirmation

## Dependencies
- AWS Cognito User Pool (re-auth, session revocation)
- DynamoDB single-table (Member, CredentialVerificationTicket, AuditLogEntry, NotificationReceipt)
- SES (verification notices and deletion receipts)

## Monitoring & Alerts
- Watch for spikes in 401/403/429 responses on user-settings endpoints.
- Monitor `RateLimit` records in DynamoDB for unusual member activity.
- Track SES send failures for deletion receipts and email change notices.

## Operational Checks
- Confirm `COGNITO_USER_POOL_ID` and `COGNITO_USER_POOL_CLIENT_ID` are set in Lambda config.
- Validate DynamoDB TTL is enabled for CredentialVerificationTicket items.
- Ensure AuditLogEntry creation on every profile/credential/deletion change.

## Incident Playbooks

### Email Change Failures
1. Verify Cognito availability and throttling metrics.
2. Inspect CloudWatch logs for `requestEmailChange` handler errors.
3. Confirm SES sandbox or emulator is accepting outbound mail.
4. Check DynamoDB for pending CredentialVerificationTicket entries.

### Password Change Failures
1. Verify Cognito admin auth calls are not throttled.
2. Confirm rate limiting thresholds were not exceeded for the member.
3. Inspect audit log entries for `PASSWORD_CHANGED` events.

### Account Deletion Issues
1. Validate deletion request ticket was created with TTL.
2. Confirm deletion confirmation handler completed and removed member/family records.
3. Check NotificationReceipt entries for deletion receipts.
4. If family data remains, review transaction logs for failure cause.

## Rollback Guidance
- Disable affected Lambda functions via SAM parameter overrides if widespread failures occur.
- Temporarily raise rate limit thresholds using environment variables if false positives occur.
- Re-enable after verifying root cause.

## Customer Support Notes
- Advise users that deletion is irreversible and emails may take a few minutes to arrive.
- If receipts are missing, confirm SES delivery status before asking users to retry.
