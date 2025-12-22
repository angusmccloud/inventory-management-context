# Infrastructure as Code (IaC) Best Practices

**Date**: December 20, 2025  
**Applies To**: All AWS infrastructure configuration for Inventory HQ

---

## Core Principle

**ALWAYS prefer YAML-based configuration in `template.yaml` over manual AWS Console operations.**

Infrastructure changes must be:
- ✅ **Version Controlled** - All changes tracked in Git
- ✅ **Repeatable** - Deploy to dev/staging/prod identically
- ✅ **Reviewable** - Infrastructure changes go through PR process
- ✅ **Auditable** - Full history of what changed and when
- ✅ **Automated** - Deploy via CI/CD, not manual console clicks

---

## What MUST Be in template.yaml

### Always Use template.yaml For:

#### 1. AWS Resource Definitions
- ✅ Lambda Functions
- ✅ API Gateway (REST APIs, routes, methods)
- ✅ DynamoDB Tables (including GSIs)
- ✅ Cognito User Pools and User Pool Clients
- ✅ IAM Roles and Policies
- ✅ CloudWatch Log Groups
- ✅ S3 Buckets
- ✅ CloudFront Distributions
- ✅ ACM Certificates
- ✅ EventBridge Rules
- ✅ SQS Queues
- ✅ SNS Topics

#### 2. Configuration Settings
- ✅ Cognito email configuration (SES sender, reply-to)
- ✅ Cognito password policies
- ✅ Cognito MFA settings
- ✅ API Gateway CORS settings
- ✅ Lambda environment variables
- ✅ Lambda memory and timeout settings
- ✅ DynamoDB billing mode and capacity
- ✅ CloudWatch alarm thresholds

#### 3. Security & Access Control
- ✅ IAM policies (Lambda execution roles)
- ✅ Resource-based policies (S3 bucket policies)
- ✅ API Gateway authorizers
- ✅ Cognito identity providers
- ✅ KMS encryption keys

---

## When Manual Console Operations Are Required

### Acceptable Manual Operations

**Only perform manual AWS Console operations when CloudFormation/SAM does NOT support automation.**

#### 1. AWS SES Domain Verification
- **Why Manual**: CloudFormation can create SES identities but cannot initiate the verification process
- **What's Manual**: 
  - Navigate to SES Console → Create Identity → Select Domain
  - Enable Easy DKIM, publish DNS records to Route 53
- **What to Automate**: DNS record creation (if using Route 53), IAM roles for SES
- **Follow-up**: Once verified, reference the domain in template.yaml for Cognito EmailConfiguration

#### 2. Third-Party DNS Configuration
- **Why Manual**: CloudFormation cannot manage DNS records in external providers (Namecheap, GoDaddy, etc.)
- **What's Manual**:
  - Adding nameserver records pointing to Route 53
  - Adding SPF, DKIM, DMARC records from SES
  - Adding ACM validation CNAME records
- **What to Automate**: Route 53 hosted zone and records within AWS
- **Documentation**: Always document required DNS records in specs (e.g., DNS-REQUIREMENTS.md)

#### 3. Initial Route 53 Hosted Zone Creation
- **Why Manual**: One-time setup, typically done during domain registration
- **What's Manual**: Creating hosted zone, noting nameservers
- **What to Automate**: All DNS records within the hosted zone via template.yaml

#### 4. Emergency Troubleshooting
- **Why Manual**: Time-sensitive debugging or investigation
- **Requirements**:
  - Document what was changed and why
  - Create follow-up task to add change to template.yaml
  - Never leave manual changes in place long-term

---

## Migration Strategy: Console → template.yaml

If you discover a resource configured manually in AWS Console:

### Step 1: Document Current State
```bash
# Export current configuration
aws cognito-idp describe-user-pool --user-pool-id us-east-1_xxxxx > current-config.json
```

### Step 2: Add to template.yaml
```yaml
UserPool:
  Type: AWS::Cognito::UserPool
  Properties:
    # Add all current settings here
    UserPoolName: !Sub '${AWS::StackName}-users-${Environment}'
    EmailConfiguration:
      EmailSendingAccount: DEVELOPER
      SourceArn: !Sub 'arn:aws:ses:${AWS::Region}:${AWS::AccountId}:identity/inventoryhq.io'
```

### Step 3: Deploy with sam deploy
```bash
sam build
sam validate
sam deploy --no-execute-changeset  # Preview changes first
sam deploy  # Apply changes
```

### Step 4: Verify and Clean Up
- Test that the resource works correctly
- Remove manual changes if they conflict
- Document the migration in PR description

---

## Environment-Specific Configuration

Use SAM Parameters for environment differences:

```yaml
Parameters:
  Environment:
    Type: String
    Default: dev
    AllowedValues:
      - dev
      - staging
      - prod
  
  SESFromEmail:
    Type: String
    Default: ""
    Description: Verified email address for sending notifications

  FrontendUrl:
    Type: String
    Default: "http://localhost:3000"
    Description: Frontend application URL for invitation links
```

Then reference in `samconfig.toml`:

```toml
[dev.deploy.parameters]
parameter_overrides = "Environment=dev SESFromEmail=noreply@inventoryhq.io FrontendUrl=https://dev.inventoryhq.io"

[staging.deploy.parameters]
parameter_overrides = "Environment=staging SESFromEmail=noreply@inventoryhq.io FrontendUrl=https://staging.inventoryhq.io"

[prod.deploy.parameters]
parameter_overrides = "Environment=prod SESFromEmail=noreply@inventoryhq.io FrontendUrl=https://inventoryhq.io"
```

---

## Common Mistakes to Avoid

### ❌ DON'T: Configure Cognito via AWS Console

**Wrong Approach:**
1. Open Cognito Console
2. Click "Messaging" tab
3. Manually configure SES email settings

**Right Approach:**
Add to template.yaml:
```yaml
UserPool:
  Type: AWS::Cognito::UserPool
  Properties:
    EmailConfiguration:
      EmailSendingAccount: DEVELOPER
      SourceArn: !Sub 'arn:aws:ses:${AWS::Region}:${AWS::AccountId}:identity/inventoryhq.io'
      From: !Sub 'Inventory HQ <${SESFromEmail}>'
```

### ❌ DON'T: Create IAM Roles Manually

**Wrong Approach:**
1. Open IAM Console
2. Create role with "Create role" button
3. Attach policies manually

**Right Approach:**
Add to template.yaml:
```yaml
CognitoSESRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal:
            Service: email.cognito-idp.amazonaws.com
          Action: 'sts:AssumeRole'
    Policies:
      - PolicyName: CognitoSESPolicy
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - 'ses:SendEmail'
                - 'ses:SendRawEmail'
              Resource: !Sub 'arn:aws:ses:${AWS::Region}:${AWS::AccountId}:identity/inventoryhq.io'
```

### ❌ DON'T: Update Lambda Env Vars via Console

**Wrong Approach:**
1. Open Lambda Console
2. Click function → Configuration → Environment variables
3. Add/edit variables manually

**Right Approach:**
Add to template.yaml:
```yaml
CreateInvitationFunction:
  Type: AWS::Serverless::Function
  Properties:
    Environment:
      Variables:
        FRONTEND_URL: !Ref FrontendUrl
        INVITATION_HMAC_SECRET_NAME: !Sub '/inventory-mgmt/${Environment}/invitation-hmac-secret'
```

---

## Validation Checklist

Before deploying infrastructure changes:

- [ ] All AWS resource definitions are in `template.yaml`
- [ ] No hardcoded values (use Parameters or environment variables)
- [ ] IAM policies follow least-privilege principle
- [ ] Template validates successfully: `sam validate`
- [ ] ChangeSets reviewed before execution: `sam deploy --no-execute-changeset`
- [ ] Environment-specific parameters configured in `samconfig.toml`
- [ ] Manual steps are documented with justification (e.g., SES domain verification)
- [ ] PR includes rationale for any manual console operations
- [ ] Outputs defined for values needed by other services
- [ ] Tags added for resource organization and cost tracking

---

## Benefits of Infrastructure as Code

### For Development Teams
- 🔄 **Consistency**: Dev, staging, and prod environments are identical
- 🚀 **Speed**: Deploy new environments in minutes, not hours
- 🛡️ **Safety**: Preview changes before applying them
- 📝 **Documentation**: Infrastructure is self-documenting
- 🔍 **Auditability**: Full Git history of all changes

### For Operations
- 🎯 **Reproducibility**: Disaster recovery is just a `sam deploy`
- 🔧 **Debugging**: Know exactly what's deployed in each environment
- 📊 **Compliance**: Infrastructure changes go through PR review
- 🚦 **Rollback**: Revert to previous version instantly

### For Business
- 💰 **Cost Control**: Track infrastructure changes that affect billing
- ⚡ **Agility**: Spin up new environments for testing or demos
- 🔒 **Security**: Enforce security policies via code review
- 📈 **Scalability**: Scale infrastructure with confidence

---

## Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS CloudFormation Resource Types](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html)
- [AWS SAM CLI Reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)
- [AWS CloudFormation Best Practices](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html)

---

**Last Updated**: December 20, 2025  
**Maintained By**: Inventory HQ Development Team
