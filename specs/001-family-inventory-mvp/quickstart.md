# Quickstart Guide: Family Inventory Management System MVP

**Feature**: 001-family-inventory-mvp  
**Date**: 2025-12-08  
**Audience**: Developers implementing the feature

## Overview

This guide helps you get started with implementing the Family Inventory Management System. It covers setup, development workflow, and key architectural patterns to follow.

## Prerequisites

- **Node.js**: 20.x LTS ([download](https://nodejs.org/))
- **AWS Account**: With appropriate permissions for Lambda, DynamoDB, Cognito, SES, SAM, S3, and CloudFront
- **AWS CLI**: Configured with credentials ([setup guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html))
- **AWS SAM CLI**: For local development and deployment ([installation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
- **Git**: Version control

## Repository Structure

This project uses a multi-repository structure:

```
inventory-management-backend/     # AWS Lambda + DynamoDB backend
inventory-management-frontend/    # Next.js 16 App Router frontend
inventory-management-context/     # SpecKit specifications and planning (this repo)
```

## Setup Instructions

### 1. Clone Repositories

```bash
# Create project directory
mkdir inventory-management
cd inventory-management

# Clone repositories (adjust URLs as needed)
git clone <backend-repo-url> inventory-management-backend
git clone <frontend-repo-url> inventory-management-frontend
git clone <context-repo-url> inventory-management-context

# Ensure you're on the feature branch
cd inventory-management-backend
git checkout 001-family-inventory-mvp

cd ../inventory-management-frontend
git checkout 001-family-inventory-mvp

cd ../inventory-management-context
git checkout 001-family-inventory-mvp
```

### 2. Backend Setup

```bash
cd inventory-management-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your AWS configuration
# Required variables:
#   - AWS_REGION
#   - COGNITO_USER_POOL_ID
#   - COGNITO_CLIENT_ID
#   - DYNAMODB_TABLE_NAME
#   - SES_FROM_EMAIL

# Run tests to verify setup
npm test

# Start local development with SAM
sam build
sam local start-api --port 3001
```

### 3. Frontend Setup

```bash
cd inventory-management-frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with configuration
# Required variables:
#   - NEXT_PUBLIC_API_URL (http://localhost:3001/v1 for local)
#   - NEXT_PUBLIC_COGNITO_USER_POOL_ID
#   - NEXT_PUBLIC_COGNITO_CLIENT_ID
#   - NEXT_PUBLIC_AWS_REGION

# Run tests
npm test

# Start Next.js development server with Vite
npm run dev
```

The application will be available at `http://localhost:3000`

**Build Tool**: This project uses **Vite** as the build tool for Next.js, providing faster development builds and Hot Module Replacement (HMR). Vite configuration is in `vite.config.ts`.

### 4. AWS Infrastructure Setup (First Time Only)

```bash
cd inventory-management-backend

# Deploy infrastructure to AWS (dev environment)
sam build
sam deploy --guided

# Follow prompts:
#   - Stack Name: inventory-mgmt-dev
#   - AWS Region: your-region
#   - Parameter Environment: dev
#   - Confirm changes before deploy: Y
#   - Allow SAM CLI IAM role creation: Y
#   - Save arguments to configuration file: Y

# Note the outputs (API Gateway URL, DynamoDB table name, etc.)
```

### 5. Configure AWS Cognito

After deploying the stack, configure Cognito User Pool:

```bash
# Create your first admin user
aws cognito-idp admin-create-user \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com Name=custom:role,Value=admin \
  --temporary-password TempPassword123! \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --username admin@example.com \
  --password YourSecurePassword123! \
  --permanent
```

### 6. Configure AWS SES for Email Notifications

```bash
# Verify your sender email (required in sandbox mode)
aws ses verify-email-identity --email-address noreply@yourdomain.com

# Check verification status
aws ses get-identity-verification-attributes --identities noreply@yourdomain.com

# For production, move out of sandbox:
# https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html
```

## Development Workflow

### Test-First Development (MANDATORY)

Follow the constitution's test-first principle:

1. **Write the test** for the feature/function
2. **Run the test** and verify it fails
3. **Implement** the minimal code to make it pass
4. **Refactor** while keeping tests green

### Example: Adding a New API Endpoint

#### Backend (Lambda Handler)

```bash
cd inventory-management-backend

# 1. Create test file
touch src/handlers/__tests__/createInventoryItem.test.ts

# 2. Write test (see Testing section below)
# Edit src/handlers/__tests__/createInventoryItem.test.ts

# 3. Run test and watch it fail
npm test -- createInventoryItem.test.ts

# 4. Create handler file
touch src/handlers/createInventoryItem.ts

# 5. Implement handler
# Edit src/handlers/createInventoryItem.ts

# 6. Run test again until it passes
npm test -- createInventoryItem.test.ts --watch

# 7. Add handler to SAM template
# Edit template.yaml to define the Lambda function and API Gateway route

# 8. Test locally
sam build
sam local start-api --port 3001
curl -X POST http://localhost:3001/v1/families/123/inventory \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","quantity":5,"threshold":2}'
```

#### Frontend (Next.js Component)

```bash
cd inventory-management-frontend

# 1. Create component test
mkdir -p components/inventory/__tests__
touch components/inventory/__tests__/AddItemForm.test.tsx

# 2. Write test using React Testing Library
# Edit components/inventory/__tests__/AddItemForm.test.tsx

# 3. Run test and watch it fail
npm test -- AddItemForm.test.tsx

# 4. Create component file
touch components/inventory/AddItemForm.tsx

# 5. Implement component
# Edit components/inventory/AddItemForm.tsx

# 6. Run test until it passes
npm test -- AddItemForm.test.tsx --watch

# 7. Test in browser
npm run dev
# Navigate to http://localhost:3000/dashboard/inventory
```

## Key Architectural Patterns

### 1. DynamoDB Single-Table Design

**Pattern**: All entities in one table with composite keys

```typescript
// Example: Query inventory items for a family
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export async function getInventoryItems(familyId: string) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `FAMILY#${familyId}`,
        ':sk': 'ITEM#',
      },
    })
  );
  return result.Items as InventoryItem[];
}
```

### 2. Input Validation with Zod

**Pattern**: Validate all inputs at API boundaries

```typescript
import { z } from 'zod';

// Define schema
export const CreateInventoryItemSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.number().int().min(0),
  threshold: z.number().int().min(0),
  locationId: z.string().uuid().optional(),
});

// Use in handler
export async function handler(event: APIGatewayProxyEvent) {
  const body = JSON.parse(event.body || '{}');
  
  // Validate input
  const validation = CreateInventoryItemSchema.safeParse(body);
  if (!validation.success) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'BadRequest',
        message: 'Validation failed',
        details: validation.error.errors,
      }),
    };
  }
  
  // Proceed with validated data
  const data = validation.data;
  // ... business logic
}
```

### 3. Lambda Authorizer for Authentication

**Pattern**: Extract memberId from JWT, query DynamoDB for family context

```typescript
// Lambda authorizer validates Cognito JWT and queries DynamoDB for member info
export async function authorizerHandler(event: APIGatewayTokenAuthorizerEvent) {
  const token = event.authorizationToken.replace('Bearer ', '');
  const decoded = verifyJWT(token); // Verify Cognito JWT
  const memberId = decoded.sub;
  
  // Query DynamoDB to get member's familyId and role
  const member = await getMemberById(memberId); // Query using GSI1PK
  
  if (!member || member.status !== 'active') {
    throw new Error('Unauthorized');
  }
  
  return {
    principalId: memberId,
    policyDocument: generatePolicy('Allow', event.methodArn),
    context: {
      memberId: memberId,
      familyId: member.familyId,
      role: member.role,
    },
  };
}

// Access in handler
export async function handler(event: APIGatewayProxyEventWithAuthorizer) {
  const familyId = event.requestContext.authorizer?.familyId;
  const role = event.requestContext.authorizer?.role;
  
  // Enforce family isolation
  if (event.pathParameters?.familyId !== familyId) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }
  
  // Enforce role-based access
  if (role !== 'admin') {
    return { statusCode: 403, body: JSON.stringify({ error: 'Admin only' }) };
  }
  
  // ... business logic
}
```

### 4. Next.js Server Components for Data Fetching

**Pattern**: Fetch data in Server Components, use Client Components for interactivity

```typescript
// app/dashboard/inventory/page.tsx (Server Component)
import { InventoryList } from '@/components/inventory/InventoryList';
import { getInventoryItems } from '@/lib/api-client';

export default async function InventoryPage() {
  // Fetch data on server (no client-side loading state needed)
  const items = await getInventoryItems();
  
  return (
    <div>
      <h1>Inventory</h1>
      <InventoryList items={items} />
    </div>
  );
}

// components/inventory/InventoryList.tsx (Client Component)
'use client';

import { useState } from 'react';

export function InventoryList({ items }: { items: InventoryItem[] }) {
  const [filter, setFilter] = useState<'all' | 'lowStock'>('all');
  
  const filteredItems = filter === 'lowStock'
    ? items.filter(item => item.quantity < item.threshold)
    : items;
  
  return (
    <div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All Items</option>
        <option value="lowStock">Low Stock</option>
      </select>
      
      {filteredItems.map(item => (
        <div key={item.itemId}>{item.name}: {item.quantity}</div>
      ))}
    </div>
  );
}
```

### 5. Structured Logging with Context

**Pattern**: Include correlation IDs and family context in logs

```typescript
import { v4 as uuidv4 } from 'uuid';

export function createLogger(context: { familyId?: string; memberId?: string }) {
  const correlationId = uuidv4();
  
  return {
    info: (message: string, data?: any) => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        correlationId,
        familyId: context.familyId,
        memberId: context.memberId,
        message,
        ...data,
      }));
    },
    error: (message: string, error?: Error, data?: any) => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        correlationId,
        familyId: context.familyId,
        memberId: context.memberId,
        message,
        error: error?.message,
        stack: error?.stack,
        ...data,
      }));
    },
  };
}

// Usage in handler
export async function handler(event: APIGatewayProxyEvent) {
  const logger = createLogger({
    familyId: event.requestContext.authorizer?.familyId,
    memberId: event.requestContext.authorizer?.memberId,
  });
  
  logger.info('Processing request', { path: event.path });
  // ... business logic
}
```

## Testing

### Backend Unit Tests (Jest)

```typescript
// src/services/__tests__/inventoryService.test.ts
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { createInventoryItem } from '../inventoryService';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('inventoryService', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('createInventoryItem', () => {
    it('should create an inventory item in DynamoDB', async () => {
      ddbMock.on(PutCommand).resolves({});

      const result = await createInventoryItem({
        familyId: 'family-123',
        name: 'Paper Towels',
        quantity: 10,
        threshold: 5,
      });

      expect(result.itemId).toBeDefined();
      expect(result.name).toBe('Paper Towels');
      expect(ddbMock.calls()).toHaveLength(1);
    });

    it('should throw error if quantity is negative', async () => {
      await expect(
        createInventoryItem({
          familyId: 'family-123',
          name: 'Test',
          quantity: -1,
          threshold: 5,
        })
      ).rejects.toThrow('Quantity cannot be negative');
    });
  });
});
```

### Frontend Component Tests (React Testing Library)

```typescript
// components/inventory/__tests__/AddItemForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddItemForm } from '../AddItemForm';

describe('AddItemForm', () => {
  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<AddItemForm onSubmit={onSubmit} />);

    // Fill out form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Paper Towels' },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/threshold/i), {
      target: { value: '5' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /add item/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Paper Towels',
        quantity: 10,
        threshold: 5,
      });
    });
  });

  it('should show validation error for empty name', async () => {
    render(<AddItemForm onSubmit={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /add item/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });
});
```

### Running Tests

```bash
# Backend
cd inventory-management-backend
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report

# Frontend
cd inventory-management-frontend
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report
```

## Vite Configuration

The frontend uses **Vite** as the build tool for faster development and optimized production builds.

### Vite Config (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/app': path.resolve(__dirname, './app'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'aws-vendor': ['@aws-sdk/client-cognito-identity'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Key Vite Features

- **Fast HMR**: Hot Module Replacement updates instantly without full page reload
- **Optimized Builds**: Automatic code splitting and tree-shaking
- **ESM-based**: Native ES modules for faster dev server startup
- **Built-in TypeScript**: No additional configuration needed

### Development Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest"
  }
}
```

## Common Tasks

### Add a New DynamoDB Entity

1. Define entity in `data-model.md`
2. Create TypeScript type in `src/types/entities.ts`
3. Create Zod schema in `src/types/schemas.ts`
4. Write service tests in `src/services/__tests__/`
5. Implement service methods in `src/services/`
6. Create handler tests in `src/handlers/__tests__/`
7. Implement Lambda handler in `src/handlers/`
8. Add route to `template.yaml`

### Add a New API Route

1. Document in `contracts/api-spec.yaml`
2. Create handler test
3. Implement handler
4. Add to SAM template
5. Deploy and test

### Add a New Frontend Page

1. Create page file in `app/` directory
2. Create component tests
3. Implement components
4. Add navigation links
5. Test in browser

## Deployment

### Backend Deployment

```bash
cd inventory-management-backend

# Run tests
npm test

# Build and deploy
sam build
sam deploy --config-env dev  # or staging, prod

# View logs
sam logs -n CreateInventoryItemFunction --stack-name inventory-mgmt-dev --tail
```

### Frontend Deployment (AWS)

#### Option 1: S3 + CloudFront (Recommended for Static Hosting)

```bash
cd inventory-management-frontend

# Build for production with Vite
npm run build

# Test production build locally
npm run preview

# Deploy to S3
S3_BUCKET="inventory-mgmt-frontend-prod"
aws s3 sync dist/ s3://$S3_BUCKET --delete

# Invalidate CloudFront cache (get distribution ID from AWS Console)
CLOUDFRONT_DISTRIBUTION_ID="YOUR_DISTRIBUTION_ID"
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"

# Note: First-time setup requires creating S3 bucket and CloudFront distribution
# See setup instructions below
```

**First-Time S3 + CloudFront Setup:**

```bash
# 1. Create S3 bucket
S3_BUCKET="inventory-mgmt-frontend-prod"
aws s3 mb s3://$S3_BUCKET --region us-east-1

# 2. Enable static website hosting
aws s3 website s3://$S3_BUCKET \
  --index-document index.html \
  --error-document index.html

# 3. Create CloudFront distribution (use AWS Console or CLI)
# - Origin: S3 bucket website endpoint
# - Default root object: index.html
# - Custom error responses: 404 -> /index.html (for SPA routing)
# - SSL certificate: Use ACM certificate for custom domain

# 4. Update DNS to point to CloudFront distribution
```

#### Option 2: AWS Amplify (Managed CI/CD)

```bash
cd inventory-management-frontend

# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify project
amplify init

# Add hosting
amplify add hosting

# Select: Amazon CloudFront and S3
# Build command: npm run build
# Build output directory: dist

# Deploy
amplify publish

# For CI/CD: Connect your Git repository in AWS Amplify Console
# Amplify will automatically build and deploy on push
```

**Amplify Configuration (`amplify.yml`):**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Troubleshooting

### Lambda Cold Starts Too Slow

- Reduce bundle size: audit dependencies with `npm ls`
- Use AWS SDK v3 modular imports
- Consider Provisioned Concurrency for critical functions

### DynamoDB Throttling

- Check if queries are using indexes (no table scans)
- Increase read/write capacity or switch to on-demand billing
- Implement exponential backoff retry logic

### CORS Issues

- Verify CORS headers in API Gateway (check `template.yaml`)
- Ensure `Access-Control-Allow-Origin` includes your frontend domain

### Cognito Authentication Failing

- Verify JWT token is being sent in `Authorization` header
- Check token expiration
- Verify Cognito User Pool and Client IDs in environment variables

### Vite Build Issues

- **Module not found errors**: Check path aliases in `vite.config.ts`
- **Slow HMR**: Clear Vite cache with `rm -rf node_modules/.vite`
- **Environment variables not loading**: Ensure variables are prefixed with `VITE_` or `NEXT_PUBLIC_`
- **Build fails in production**: Check for Node.js version compatibility (requires 20.x)

### S3 Deployment Issues

- **404 errors on routes**: Configure CloudFront error pages to redirect 404 → `/index.html`
- **CORS errors**: Update S3 bucket CORS policy and API Gateway CORS headers
- **Old content showing**: Invalidate CloudFront cache after deployment
- **Access denied**: Check S3 bucket policy allows public read access

## Resources

- [Constitution](../../.specify/memory/constitution.md) - Project principles and standards
- [Feature Spec](./spec.md) - Detailed requirements
- [Data Model](./data-model.md) - Database schema and entities
- [API Spec](./contracts/api-spec.yaml) - OpenAPI documentation
- [Research](./research.md) - Technical decisions and rationale

### External Documentation

- [Vite Documentation](https://vitejs.dev/)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CloudFront](https://docs.aws.amazon.com/cloudfront/)
- [Jest Testing Framework](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)

## Next Steps

1. Review the [Constitution](../../.specify/memory/constitution.md)
2. Read the [Feature Specification](./spec.md)
3. Study the [Data Model](./data-model.md)
4. Review the [API Contracts](./contracts/api-spec.yaml)
5. Set up your local development environment
6. Start with User Story 1 implementation (Family and Inventory Management)

---

**Questions?** Refer to the constitution for architectural decisions or consult the research document for technical rationale.

**Ready to code?** Run `/speckit.tasks` to generate the detailed task breakdown for implementation.

