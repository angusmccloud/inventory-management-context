# Quick Start Guide: NFC Inventory Tap

**Feature**: 006-nfc-inventory-tap  
**Date**: December 26, 2025  
**Audience**: Developers setting up local development environment

## Prerequisites

- Node.js 24.x LTS installed
- Docker Engine (NOT Docker Desktop)
- AWS CLI configured with development credentials
- DynamoDB Local or access to AWS DynamoDB
- NFC-enabled smartphone (iOS 14+ or Android 5.0+) for testing
- Passive NFC tags (NTAG213/215/216) for physical testing

## Local Development Setup

### 1. Backend Setup (Lambda Functions)

```bash
# Navigate to backend repository
cd inventory-management-backend

# Install dependencies
npm install

# Install new dependencies for NFC feature
npm install --save-dev @types/node

# Set up local DynamoDB table (if not already done)
aws dynamodb create-table \
  --table-name InventoryManagement \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
    AttributeName=GSI2PK,AttributeType=S \
    AttributeName=GSI2SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "GSI1",
        "KeySchema": [
          {"AttributeName": "GSI1PK", "KeyType": "HASH"},
          {"AttributeName": "GSI1SK", "KeyType": "RANGE"}
        ],
        "Projection": {"ProjectionType": "ALL"}
      },
      {
        "IndexName": "GSI2",
        "KeySchema": [
          {"AttributeName": "GSI2PK", "KeyType": "HASH"},
          {"AttributeName": "GSI2SK", "KeyType": "RANGE"}
        ],
        "Projection": {"ProjectionType": "ALL"}
      }
    ]' \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000

# Start SAM local API
sam local start-api --port 3001 --env-vars env.json

# In another terminal, run tests
npm test -- --watch
```

### 2. Frontend Setup (Next.js)

```bash
# Navigate to frontend repository
cd inventory-management-frontend

# Install dependencies
npm install

# Add environment variable for local development
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" >> .env.local

# Start development server
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Test Data Setup

Create test family, member, and inventory item:

```bash
# Run seed script (or manually via AWS CLI)
npm run seed:nfc-test-data

# This creates:
# - Family: "Test Family"
# - Member: admin@example.com (admin role)
# - Item: "Paper Towels" (quantity: 5, threshold: 2)
# - NFCUrl: Active URL for the item
```

## Testing the NFC Feature

### Local Browser Testing

1. **Generate NFC URL via Admin UI**:
   - Navigate to: `http://localhost:3000/dashboard/inventory`
   - Click on "Paper Towels" item
   - Click "Generate NFC URL" button
   - Copy the URL (e.g., `http://localhost:3000/t/2gSZw8ZQPb7D5kN3X8mQ7`)

2. **Test NFC Adjustment Page**:
   - Open copied URL in browser
   - Page should auto-adjust quantity by -1
   - Verify item name and new quantity displayed
   - Click + and - buttons to test additional adjustments
   - Verify quantity updates without page reload

3. **Test Error Cases**:
   - Try invalid URL: `http://localhost:3000/t/invalidUrlId123456`
   - Expect: "URL Not Found" error page
   - Adjust quantity to 0, then try to decrease again
   - Expect: Quantity stays at 0, message indicates no change

### Physical NFC Tag Testing

1. **Program NFC Tag**:
   - Use NFC writing app (NFC Tools, TagWriter, etc.)
   - Write URL as NDEF URI record: `https://inventoryhq.io/t/{urlId}`
   - Note: Must use HTTPS for production (local testing uses HTTP)

2. **Test with Smartphone**:
   - **iOS**: Unlock iPhone, tap NFC tag on back
   - **Android**: Ensure screen is on, tap NFC tag
   - Safari/Chrome should open with NFC adjustment page
   - Verify automatic adjustment occurs
   - Test + and - buttons

3. **Test Offline Behavior** (optional):
   - Enable airplane mode
   - Tap NFC tag
   - Expect: Network error (no offline support in MVP)
   - Future enhancement: Service worker for offline queue

### API Testing with cURL

```bash
# Test NFC adjustment API directly
curl -X POST http://localhost:3001/api/adjust/2gSZw8ZQPb7D5kN3X8mQ7 \
  -H "Content-Type: application/json" \
  -d '{"delta": -1}'

# Expected response:
# {
#   "success": true,
#   "itemName": "Paper Towels",
#   "newQuantity": 4,
#   "delta": -1,
#   "message": "Took 1 Paper Towel — now down to 4"
# }

# Test URL rotation (requires auth token)
curl -X POST http://localhost:3001/api/items/{itemId}/nfc-urls/{urlId}/rotate \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json"
```

## Running Tests

### Unit Tests

```bash
# Backend
cd inventory-management-backend
npm test

# Run specific test suite
npm test -- nfcService.test.ts

# Run with coverage
npm test -- --coverage
```

### Integration Tests

```bash
# Backend integration tests (requires DynamoDB Local)
npm test -- integration/nfcAdjustmentHandler.test.ts

# Frontend component tests
cd inventory-management-frontend
npm test -- components/inventory/NFCUrlManager.test.tsx
```

### End-to-End Tests (Optional)

```bash
# Install Playwright if not already installed
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e

# Test scenarios:
# 1. Admin generates NFC URL
# 2. User taps NFC (simulated URL visit)
# 3. Quantity decreases by 1
# 4. User presses + button twice
# 5. Quantity increases by 2
# 6. Admin rotates URL
# 7. Old URL shows error page
```

## Troubleshooting

### DynamoDB Connection Issues

```bash
# Check if DynamoDB Local is running
docker ps | grep dynamodb

# Start DynamoDB Local if not running
docker run -p 8000:8000 amazon/dynamodb-local

# Verify table exists
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

### Lambda Function Not Starting

```bash
# Check SAM logs
sam local start-api --debug

# Verify Docker is running
docker info

# Check port conflicts
lsof -i :3001
```

### NFC Tag Not Recognized

**iOS**:
- Ensure iPhone 7 or later with iOS 14+
- NFC must be enabled (Settings > General > NFC)
- Tag must be NTAG213/215/216 (not all tags supported)
- Hold tag against top-back of phone for 1-2 seconds

**Android**:
- Ensure NFC is enabled (Settings > Connected devices > NFC)
- Screen must be on (doesn't need to be unlocked)
- Tag detection area varies by device (usually center-back)

### HTTPS Required Error (iOS)

iOS may block HTTP URLs from NFC tags. For local testing:
- Use ngrok to tunnel local server: `ngrok http 3000`
- Update NFC tag with ngrok HTTPS URL
- Or test with Android (more permissive)

## Development Workflow

1. **Create Feature Branch**: `git checkout -b feature/nfc-improvements`
2. **Write Tests First**: Create test file, write failing tests
3. **Implement Feature**: Write code to make tests pass
4. **Run All Tests**: Ensure no regressions
5. **Test Manually**: Verify UI and API behavior
6. **Commit & Push**: `git commit -m "feat: add NFC URL rotation UI"`
7. **Create PR**: GitHub Actions will run CI checks

## CI/CD Pipeline

GitHub Actions will automatically:
1. Run TypeScript type checking (`npm run type-check`)
2. Run Jest unit tests (`npm test`)
3. Run integration tests
4. Build frontend with Vite (`npm run build`)
5. Deploy to AWS (on merge to main)

## Deployment Commands

### Backend (AWS SAM)

```bash
cd inventory-management-backend

# Validate SAM template
sam validate

# Build Lambda functions
sam build

# Deploy to dev environment
sam deploy --config-env dev

# Deploy to production
sam deploy --config-env prod
```

### Frontend (S3 + CloudFront)

```bash
cd inventory-management-frontend

# Build production assets
npm run build

# Deploy to S3
aws s3 sync dist/ s3://inventoryhq-frontend-prod/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

## Environment Variables

### Backend (env.json)

```json
{
  "Parameters": {
    "TABLE_NAME": "InventoryManagement",
    "DOMAIN": "inventoryhq.io",
    "LOG_LEVEL": "debug"
  }
}
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_DOMAIN=localhost:3000
```

## Useful Commands

```bash
# Generate new URL ID (for manual testing)
node -e "console.log(require('crypto').randomUUID())"

# Query DynamoDB for NFCUrl records
aws dynamodb query \
  --table-name InventoryManagement \
  --index-name GSI1 \
  --key-condition-expression "GSI1PK = :urlId" \
  --expression-attribute-values '{":urlId":{"S":"URL#2gSZw8ZQPb7D5kN3X8mQ7"}}' \
  --endpoint-url http://localhost:8000

# Monitor Lambda logs (after deployment)
sam logs -n NfcAdjustmentFunction --tail

# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=NfcAdjustmentFunction \
  --start-time 2025-12-26T00:00:00Z \
  --end-time 2025-12-26T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

## Next Steps

1. Review [data-model.md](data-model.md) for DynamoDB schema details
2. Review API contracts in [contracts/](contracts/) directory
3. Read [tasks.md](tasks.md) for implementation task breakdown (after running `/speckit.tasks`)
4. Join #nfc-feature Slack channel for questions

## Resources

- [NFC Forum Specifications](https://nfc-forum.org/our-work/specification-releases/)
- [Apple Core NFC Documentation](https://developer.apple.com/documentation/corenfc)
- [Android NFC Guide](https://developer.android.com/guide/topics/connectivity/nfc)
- [AWS DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
