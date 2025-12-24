# Quickstart Guide: Family Member Management

**Feature**: 003-member-management  
**Date**: 2025-12-10  
**Audience**: Developers implementing the feature  
**Parent Feature**: 001-family-inventory-mvp

## Overview

This guide helps you get started with implementing the Family Member Management feature. It enables family admins to invite new members via email, manage member roles, and remove members from the family. The feature builds upon the existing authentication and family infrastructure from the MVP.

### Key Capabilities

- **Invitation System**: Secure email-based invitations with token validation
- **Role Management**: Admin and suggester roles with role-based access control
- **Member Lifecycle**: Add, update, and remove family members
- **Concurrency Control**: Optimistic locking prevents conflicting updates
- **Last Admin Protection**: Ensures at least one admin exists per family

## Prerequisites

Before starting, ensure you have completed the setup from the parent feature:

- **Node.js**: 20.x LTS ([download](https://nodejs.org/))
- **AWS Account**: With permissions for Lambda, DynamoDB, Cognito, SES, Secrets Manager, SAM
- **AWS CLI**: Configured with credentials
- **AWS SAM CLI**: For local development and deployment
- **Git**: Version control
- **Parent Feature**: `001-family-inventory-mvp` must be implemented

### AWS Services Required

| Service | Purpose |
|---------|---------|
| DynamoDB | Store invitations and member data (single-table design) |
| Cognito | User authentication and account creation |
| SES | Send invitation emails |
| Secrets Manager | Store HMAC secret for token signing |
| Parameter Store | Store email templates and configuration |

### Environment Variables

```bash
# Backend (.env.local)
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=InventoryManagement
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
SES_FROM_EMAIL=noreply@yourdomain.com
INVITATION_HMAC_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456789:secret:invitation-hmac
INVITATION_EXPIRATION_SECONDS=604800  # 7 days
```

Refer to [`001-family-inventory-mvp/quickstart.md`](../001-family-inventory-mvp/quickstart.md) for detailed setup instructions.

## Feature Branch Setup

```bash
# Navigate to backend repository
cd inventory-management-backend

# Create feature branch from main
git checkout main
git pull origin main
git checkout -b 003-member-management

# Navigate to frontend repository
cd ../inventory-management-frontend
git checkout main
git pull origin main
git checkout -b 003-member-management

# Navigate to context repository
cd ../inventory-management-context
git checkout 003-member-management
```

## Project Structure

### Backend Files to Create

```
inventory-management-backend/
├── src/
│   ├── handlers/
│   │   ├── invitations/
│   │   │   ├── createInvitation.ts
│   │   │   ├── listInvitations.ts
│   │   │   ├── getInvitation.ts
│   │   │   ├── revokeInvitation.ts
│   │   │   └── acceptInvitation.ts
│   │   ├── members/
│   │   │   ├── listMembers.ts
│   │   │   ├── getMember.ts
│   │   │   ├── updateMember.ts
│   │   │   └── removeMember.ts
│   │   └── __tests__/
│   │       ├── invitations/
│   │       │   ├── createInvitation.test.ts
│   │       │   ├── listInvitations.test.ts
│   │       │   ├── getInvitation.test.ts
│   │       │   ├── revokeInvitation.test.ts
│   │       │   └── acceptInvitation.test.ts
│   │       └── members/
│   │           ├── listMembers.test.ts
│   │           ├── getMember.test.ts
│   │           ├── updateMember.test.ts
│   │           └── removeMember.test.ts
│   ├── services/
│   │   ├── invitationService.ts
│   │   ├── memberService.ts
│   │   ├── tokenService.ts
│   │   ├── emailService.ts
│   │   └── __tests__/
│   │       ├── invitationService.test.ts
│   │       ├── memberService.test.ts
│   │       ├── tokenService.test.ts
│   │       └── emailService.test.ts
│   ├── types/
│   │   ├── invitation.ts
│   │   └── member.ts
│   └── utils/
│       └── hmac.ts
└── template.yaml  # Add new Lambda functions
```

### Frontend Files to Create

```
inventory-management-frontend/
├── app/
│   └── dashboard/
│       ├── members/
│       │   ├── page.tsx
│       │   └── [memberId]/
│       │       └── page.tsx
│       └── invitations/
│           └── page.tsx
├── app/
│   └── invite/
│       └── [token]/
│           └── page.tsx  # Public invitation acceptance page
├── components/
│   └── members/
│       ├── MemberList.tsx
│       ├── MemberCard.tsx
│       ├── InviteMemberForm.tsx
│       ├── InvitationList.tsx
│       ├── RoleSelector.tsx
│       └── __tests__/
│           ├── MemberList.test.tsx
│           ├── MemberCard.test.tsx
│           ├── InviteMemberForm.test.tsx
│           ├── InvitationList.test.tsx
│           └── RoleSelector.test.tsx
└── lib/
    └── api/
        ├── invitations.ts
        └── members.ts
```

## Implementation Order

Follow this recommended sequence for implementation:

### Phase 1: Infrastructure Setup

1. **Enable GSI1 for token lookup** (if not already configured)
2. **Verify DynamoDB TTL** is enabled on the `ttl` attribute
3. **Create Secrets Manager secret** for HMAC signing key
4. **Store email templates** in Parameter Store
5. **Verify SES** is configured and domain is verified

### Phase 2: Core Utilities

1. **Token Service** (`src/services/tokenService.ts`)
   - UUID v4 generation
   - HMAC-SHA256 signing
   - Token validation

2. **Email Service** (`src/services/emailService.ts`)
   - Template fetching from Parameter Store
   - SES email sending
   - Template variable substitution

### Phase 3: Invitation Service

1. **Create Invitation** - Generate token, store in DynamoDB, send email
2. **List Invitations** - Query by family with status filter
3. **Get Invitation** - Retrieve by ID or token
4. **Revoke Invitation** - Update status to revoked
5. **Accept Invitation** - Validate token, create Cognito user, create Member

### Phase 4: Member Service

1. **List Members** - Query by family with status filter
2. **Get Member** - Retrieve by ID
3. **Update Member** - Change role with optimistic locking
4. **Remove Member** - Soft delete with last admin protection

### Phase 5: API Routes

1. Implement Lambda handlers for all 9 endpoints
2. Add routes to SAM template
3. Configure API Gateway authorization

### Phase 6: Frontend

1. Member list and management UI
2. Invitation form and list
3. Public invitation acceptance page

## Key Implementation Details

### Token Generation and Validation

```typescript
// src/services/tokenService.ts
import { createHmac, randomUUID } from 'crypto';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });
let cachedSecret: string | null = null;

async function getHmacSecret(): Promise<string> {
  if (cachedSecret) return cachedSecret;
  
  const response = await secretsClient.send(new GetSecretValueCommand({
    SecretId: process.env.INVITATION_HMAC_SECRET_ARN,
  }));
  
  cachedSecret = response.SecretString!;
  return cachedSecret;
}

export async function generateToken(): Promise<{ token: string; signature: string }> {
  const uuid = randomUUID();
  const secret = await getHmacSecret();
  const signature = createHmac('sha256', secret).update(uuid).digest('hex');
  
  return {
    token: `${uuid}.${signature}`,
    signature,
  };
}

export async function validateToken(token: string): Promise<{ valid: boolean; uuid: string }> {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, uuid: '' };
  }
  
  const [uuid, providedSignature] = parts;
  const secret = await getHmacSecret();
  const expectedSignature = createHmac('sha256', secret).update(uuid).digest('hex');
  
  // Constant-time comparison to prevent timing attacks
  const valid = providedSignature.length === expectedSignature.length &&
    createHmac('sha256', secret).update(providedSignature).digest('hex') ===
    createHmac('sha256', secret).update(expectedSignature).digest('hex');
  
  return { valid, uuid };
}
```

### Optimistic Locking Pattern

```typescript
// src/services/memberService.ts
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

export async function updateMemberRole(
  familyId: string,
  memberId: string,
  newRole: 'admin' | 'suggester',
  expectedVersion: number
): Promise<Member> {
  // Check last admin protection
  if (newRole === 'suggester') {
    const adminCount = await countAdminMembers(familyId);
    const member = await getMember(familyId, memberId);
    
    if (member.role === 'admin' && adminCount <= 1) {
      throw new LastAdminError('Cannot change role of the last admin');
    }
  }
  
  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        PK: `FAMILY#${familyId}`,
        SK: `MEMBER#${memberId}`,
      },
      UpdateExpression: 'SET #role = :role, #version = #version + :one, #updatedAt = :now',
      ConditionExpression: '#version = :expectedVersion AND #status = :active',
      ExpressionAttributeNames: {
        '#role': 'role',
        '#version': 'version',
        '#status': 'status',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':role': newRole,
        ':one': 1,
        ':expectedVersion': expectedVersion,
        ':active': 'active',
        ':now': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    }));
    
    return result.Attributes as Member;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      const currentMember = await getMember(familyId, memberId);
      throw new VersionConflictError('Member was modified by another user', currentMember);
    }
    throw error;
  }
}
```

### Last Admin Protection

```typescript
// src/services/memberService.ts
export async function countAdminMembers(familyId: string): Promise<number> {
  const result = await docClient.send(new QueryCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    FilterExpression: '#role = :admin AND #status = :active',
    ExpressionAttributeNames: {
      '#role': 'role',
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':pk': `FAMILY#${familyId}`,
      ':sk': 'MEMBER#',
      ':admin': 'admin',
      ':active': 'active',
    },
    Select: 'COUNT',
  }));
  
  return result.Count || 0;
}

export async function removeMember(
  familyId: string,
  memberId: string,
  expectedVersion: number,
  requestingMemberId: string
): Promise<void> {
  const member = await getMember(familyId, memberId);
  
  // Check last admin protection
  if (member.role === 'admin') {
    const adminCount = await countAdminMembers(familyId);
    if (adminCount <= 1) {
      throw new LastAdminError('Cannot remove the last admin from the family');
    }
  }
  
  // Perform soft delete with optimistic locking
  await docClient.send(new UpdateCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      PK: `FAMILY#${familyId}`,
      SK: `MEMBER#${memberId}`,
    },
    UpdateExpression: 'SET #status = :removed, #version = #version + :one, #updatedAt = :now',
    ConditionExpression: '#version = :expectedVersion',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#version': 'version',
      '#updatedAt': 'updatedAt',
    },
    ExpressionAttributeValues: {
      ':removed': 'removed',
      ':one': 1,
      ':expectedVersion': expectedVersion,
      ':now': new Date().toISOString(),
    },
  }));
  
  // If self-removal, invalidate session
  if (memberId === requestingMemberId) {
    await cognitoClient.send(new AdminUserGlobalSignOutCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: member.email,
    }));
  }
}
```

### Role-Based Access Control

```typescript
// src/middleware/authorization.ts
export function requireAdmin(handler: Handler): Handler {
  return async (event: APIGatewayProxyEvent) => {
    const role = event.requestContext.authorizer?.role;
    
    if (role !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'Forbidden',
          message: 'Admin role required for this operation',
        }),
      };
    }
    
    return handler(event);
  };
}

// Usage in handler
export const handler = requireAdmin(async (event) => {
  // Only admins reach this code
  // ...
});
```

## Testing Strategy

### Unit Tests for Services

```typescript
// src/services/__tests__/tokenService.test.ts
import { mockClient } from 'aws-sdk-client-mock';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { generateToken, validateToken } from '../tokenService';

const secretsMock = mockClient(SecretsManagerClient);

describe('tokenService', () => {
  beforeEach(() => {
    secretsMock.reset();
    secretsMock.on(GetSecretValueCommand).resolves({
      SecretString: 'test-secret-key-for-hmac-signing',
    });
  });

  describe('generateToken', () => {
    it('should generate a token in UUID.signature format', async () => {
      const { token, signature } = await generateToken();
      
      expect(token).toMatch(/^[0-9a-f-]{36}\.[0-9a-f]{64}$/);
      expect(signature).toHaveLength(64);
    });

    it('should generate unique tokens', async () => {
      const token1 = await generateToken();
      const token2 = await generateToken();
      
      expect(token1.token).not.toBe(token2.token);
    });
  });

  describe('validateToken', () => {
    it('should validate a correctly signed token', async () => {
      const { token } = await generateToken();
      const result = await validateToken(token);
      
      expect(result.valid).toBe(true);
    });

    it('should reject a tampered token', async () => {
      const { token } = await generateToken();
      const tamperedToken = token.replace(/.$/, 'x'); // Change last character
      
      const result = await validateToken(tamperedToken);
      
      expect(result.valid).toBe(false);
    });

    it('should reject an invalid format', async () => {
      const result = await validateToken('invalid-token');
      
      expect(result.valid).toBe(false);
    });
  });
});
```

### Integration Tests for API

```typescript
// src/handlers/__tests__/invitations/createInvitation.test.ts
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { handler } from '../../invitations/createInvitation';

const ddbMock = mockClient(DynamoDBDocumentClient);
const sesMock = mockClient(SESClient);

describe('createInvitation', () => {
  beforeEach(() => {
    ddbMock.reset();
    sesMock.reset();
  });

  it('should create an invitation and send email', async () => {
    // Mock no existing invitation
    ddbMock.on(QueryCommand).resolves({ Items: [] });
    ddbMock.on(PutCommand).resolves({});
    sesMock.on(SendEmailCommand).resolves({ MessageId: 'test-message-id' });

    const event = {
      pathParameters: { familyId: 'family-123' },
      body: JSON.stringify({
        email: 'jane@example.com',
        role: 'suggester',
      }),
      requestContext: {
        authorizer: {
          memberId: 'admin-456',
          familyId: 'family-123',
          role: 'admin',
        },
      },
    };

    const result = await handler(event as any);

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.email).toBe('jane@example.com');
    expect(body.role).toBe('suggester');
    expect(body.status).toBe('pending');
    expect(sesMock.calls()).toHaveLength(1);
  });

  it('should return 409 for duplicate pending invitation', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{
        invitationId: 'existing-123',
        email: 'jane@example.com',
        status: 'pending',
      }],
    });

    const event = {
      pathParameters: { familyId: 'family-123' },
      body: JSON.stringify({
        email: 'jane@example.com',
        role: 'admin',
      }),
      requestContext: {
        authorizer: {
          memberId: 'admin-456',
          familyId: 'family-123',
          role: 'admin',
        },
      },
    };

    const result = await handler(event as any);

    expect(result.statusCode).toBe(409);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Conflict');
    expect(body.existingInvitation).toBeDefined();
  });

  it('should return 403 for non-admin users', async () => {
    const event = {
      pathParameters: { familyId: 'family-123' },
      body: JSON.stringify({
        email: 'jane@example.com',
        role: 'suggester',
      }),
      requestContext: {
        authorizer: {
          memberId: 'member-789',
          familyId: 'family-123',
          role: 'suggester',
        },
      },
    };

    const result = await handler(event as any);

    expect(result.statusCode).toBe(403);
  });
});
```

### Mock Patterns for AWS Services

```typescript
// src/test-utils/mocks.ts
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { SESClient } from '@aws-sdk/client-ses';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { SSMClient } from '@aws-sdk/client-ssm';

export const ddbMock = mockClient(DynamoDBDocumentClient);
export const cognitoMock = mockClient(CognitoIdentityProviderClient);
export const sesMock = mockClient(SESClient);
export const secretsMock = mockClient(SecretsManagerClient);
export const ssmMock = mockClient(SSMClient);

export function resetAllMocks() {
  ddbMock.reset();
  cognitoMock.reset();
  sesMock.reset();
  secretsMock.reset();
  ssmMock.reset();
}
```

### Running Tests

```bash
cd inventory-management-backend

# Run all tests
npm test

# Run member management tests only
npm test -- invitations members

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## SAM Template Configuration

Add to `template.yaml`:

```yaml
  # ==================== INVITATION FUNCTIONS ====================
  CreateInvitationFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/invitations/createInvitation.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref InventoryTable
        - SESCrudPolicy:
            IdentityName: !Ref SESFromEmail
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - secretsmanager:GetSecretValue
              Resource: !Ref InvitationHmacSecret
            - Effect: Allow
              Action:
                - ssm:GetParameter
              Resource: !Sub 'arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter/inventory-mgmt/*'
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/invitations
            Method: POST

  ListInvitationsFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/invitations/listInvitations.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref InventoryTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/invitations
            Method: GET

  RevokeInvitationFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/invitations/revokeInvitation.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref InventoryTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/invitations/{invitationId}
            Method: DELETE

  AcceptInvitationFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/invitations/acceptInvitation.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref InventoryTable
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - cognito-idp:AdminCreateUser
                - cognito-idp:AdminSetUserPassword
              Resource: !GetAtt UserPool.Arn
            - Effect: Allow
              Action:
                - secretsmanager:GetSecretValue
              Resource: !Ref InvitationHmacSecret
      Events:
        Api:
          Type: Api
          Properties:
            Path: /invitations/accept
            Method: POST
            Auth:
              Authorizer: NONE  # Public endpoint

  # ==================== MEMBER FUNCTIONS ====================
  ListMembersFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/members/listMembers.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref InventoryTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/members
            Method: GET

  GetMemberFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/members/getMember.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref InventoryTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/members/{memberId}
            Method: GET

  UpdateMemberFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/members/updateMember.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref InventoryTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/members/{memberId}
            Method: PATCH

  RemoveMemberFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/members/removeMember.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref InventoryTable
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - cognito-idp:AdminUserGlobalSignOut
              Resource: !GetAtt UserPool.Arn
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/members/{memberId}
            Method: DELETE

  # ==================== SECRETS ====================
  InvitationHmacSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: !Sub '/inventory-mgmt/${Environment}/invitation-hmac-secret'
      GenerateSecretString:
        PasswordLength: 64
        ExcludePunctuation: true
```

## Common Pitfalls

### 1. TTL vs Application Expiration

**Problem**: DynamoDB TTL deletion is eventually consistent (up to 48 hours delay).

**Solution**: Always check `expiresAt` at the application level before accepting invitations:

```typescript
// WRONG: Relying only on TTL
const invitation = await getInvitationByToken(token);
if (!invitation) {
  throw new Error('Invalid token');
}

// CORRECT: Check expiration explicitly
const invitation = await getInvitationByToken(token);
if (!invitation) {
  throw new Error('Invalid token');
}
if (new Date(invitation.expiresAt) < new Date()) {
  throw new InvitationExpiredError('Invitation has expired');
}
if (invitation.status !== 'pending') {
  throw new Error('Invitation is no longer valid');
}
```

### 2. Version Conflicts

**Problem**: Concurrent updates cause `ConditionalCheckFailedException`.

**Solution**: Handle conflicts gracefully and return current state:

```typescript
try {
  await updateMember(familyId, memberId, updates, version);
} catch (error) {
  if (error instanceof ConditionalCheckFailedException) {
    const currentMember = await getMember(familyId, memberId);
    return {
      statusCode: 409,
      body: JSON.stringify({
        error: 'Conflict',
        message: 'Member was modified by another user',
        currentState: currentMember,
      }),
    };
  }
  throw error;
}
```

### 3. Email Delivery Issues

**Problem**: SES in sandbox mode only allows verified email addresses.

**Solution**: 
- For development: Verify test email addresses
- For production: Request SES production access

```bash
# Verify email for sandbox testing
aws ses verify-email-identity --email-address test@example.com

# Check verification status
aws ses get-identity-verification-attributes --identities test@example.com
```

### 4. Token Security

**Problem**: Tokens exposed in logs or error messages.

**Solution**: Never log full tokens; use masked versions:

```typescript
function maskToken(token: string): string {
  const parts = token.split('.');
  if (parts.length !== 2) return '***';
  return `${parts[0].substring(0, 8)}...`;
}

logger.info('Processing invitation', { token: maskToken(token) });
```

### 5. Last Admin Edge Cases

**Problem**: Race condition when two admins try to remove each other simultaneously.

**Solution**: Use DynamoDB transactions for atomic admin count check:

```typescript
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

// Use transaction to atomically check and update
await docClient.send(new TransactWriteCommand({
  TransactItems: [
    {
      ConditionCheck: {
        TableName: TABLE_NAME,
        Key: { PK: `FAMILY#${familyId}`, SK: 'ADMIN_COUNT' },
        ConditionExpression: 'adminCount > :one',
        ExpressionAttributeValues: { ':one': 1 },
      },
    },
    {
      Update: {
        TableName: TABLE_NAME,
        Key: { PK: `FAMILY#${familyId}`, SK: `MEMBER#${memberId}` },
        UpdateExpression: 'SET #status = :removed',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':removed': 'removed' },
      },
    },
  ],
}));
```

## Deployment

```bash
cd inventory-management-backend

# Build and deploy
sam build
sam deploy --config-env dev

# View logs
sam logs -n CreateInvitationFunction --stack-name inventory-mgmt-dev --tail
sam logs -n AcceptInvitationFunction --stack-name inventory-mgmt-dev --tail
```

## Security & Performance Features (Phase 4)

### Security Headers

All API responses include the following security headers (configured in `src/lib/response.ts`):

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Rate Limiting

The public `AcceptInvitationFunction` is rate-limited to prevent abuse:
- **Reserved Concurrent Executions**: 10
- Configured in `template.yaml`
- Prevents token validation attacks

### Token Security

- Tokens are masked in logs using `maskToken()` function
- Only first 8 characters logged: `abcd1234...`
- HMAC-SHA256 signature prevents tampering
- Tokens expire after 7 days
- Single-use tokens (marked as accepted after use)

### HTTPS-Only

All invitation links use HTTPS protocol:
- Configured in `src/config/domain.ts`
- `FRONTEND_BASE_URL = 'https://inventoryhq.io'`
- Cannot be overridden to HTTP

## Resources

### Feature Documentation

- [Feature Specification](./spec.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api-spec.yaml)
- [Research Decisions](./research.md)

### Parent Feature

- [Parent Quickstart](../001-family-inventory-mvp/quickstart.md)
- [Parent Data Model](../001-family-inventory-mvp/data-model.md)
- [Parent API Spec](../001-family-inventory-mvp/contracts/api-spec.yaml)

### Related Feature

- [Shopping Lists Quickstart](../002-shopping-lists/quickstart.md)

### External Documentation

- [AWS Cognito AdminCreateUser](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUser.html)
- [AWS SES SendEmail](https://docs.aws.amazon.com/ses/latest/APIReference/API_SendEmail.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
- [DynamoDB Conditional Writes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html)
- [DynamoDB TTL](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Jest Testing Framework](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)

## Next Steps

1. Review the [Feature Specification](./spec.md)
2. Study the [Data Model](./data-model.md)
3. Review the [API Contracts](./contracts/api-spec.yaml)
4. Set up infrastructure (Secrets Manager, Parameter Store, SES)
5. Run `/speckit.tasks` to generate the detailed task breakdown
6. Start implementing with test-first development

---

**Questions?** Refer to the research document for technical decisions or the parent feature's quickstart for foundational setup.

**Ready to code?** Run `/speckit.tasks` to generate the detailed task breakdown for implementation.