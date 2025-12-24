# Domain Integration Deployment Guide

**Feature**: 007-domain-integration  
**Date**: December 21, 2025  
**Status**: Ready for Amplify Configuration

## Overview

This guide covers the deployment of the inventoryhq.io domain integration. AWS Amplify handles frontend hosting, SSL certificates, and CloudFront distribution automatically.

## Completed Infrastructure

✅ **Domain Configuration Constants** (T057)
- Backend: `src/config/domain.ts` with domain constants
- Frontend: Environment variables use "Inventory HQ" branding
- Email service uses domain configuration for sender addresses

✅ **Backend API Configuration** (T047-T049)
- CORS configured to allow requests from inventoryhq.io
- API Gateway ready for custom domain integration

## Deployment Steps

### 1. Deploy Backend Infrastructure

```bash
cd inventory-management-backend

# Build the TypeScript code
npm run build

# Deploy to AWS
sam deploy --guided
# OR if samconfig.toml is already configured:
sam deploy
```

**Expected Outputs**:
- `InventoryApiUrl`: API Gateway endpoint URL
- `UserPoolId`: Cognito User Pool ID
- `UserPoolClientId`: Cognito User Pool Client ID

### 2. Configure AWS Amplify for Frontend Hosting

⚠️ **AMPLIFY CONFIGURATION REQUIRED**

AWS Amplify automatically handles:
- ✅ SSL certificate provisioning for inventoryhq.io
- ✅ CloudFront distribution creation
- ✅ S3 bucket for static assets
- ✅ Custom domain configuration
- ✅ Automatic deployments from Git

**Amplify Setup Steps**:

1. **Connect Repository to Amplify**:
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your Git repository (GitHub, GitLab, etc.)
   - Select the frontend repository branch

2. **Configure Build Settings**:
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
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Add Custom Domain in Amplify**:
   - In Amplify Console → Your App → Domain Management
   - Click "Add domain"
   - Enter: `inventoryhq.io`
   - Amplify will automatically:
     - Request SSL certificate from AWS Certificate Manager
     - Create CloudFront distribution
     - Provide DNS validation records

### 3. Complete SSL Certificate Validation (MANUAL - T040)

### 3. Complete SSL Certificate Validation (MANUAL - T040)

⚠️ **MANUAL DNS CONFIGURATION REQUIRED**

After Amplify requests the SSL certificate, add the validation records to Namecheap:

1. **Get validation records from Amplify Console**:
   - Go to Amplify Console → Your App → Domain Management
   - Amplify will show the CNAME records needed for SSL validation

2. **Add CNAME records to Namecheap**:
   - Log in to Namecheap account
   - Navigate to Domain List → inventoryhq.io → Advanced DNS
   - Add the CNAME records provided by Amplify:
     - Type: CNAME Record
     - Host: [from Amplify Console]
     - Value: [from Amplify Console]
     - TTL: Automatic

3. **Wait for validation** (typically 5-30 minutes):
   - Check Amplify Console
   - Certificate status should change to "Issued"
   - Amplify will automatically configure CloudFront with the certificate

### 4. Configure DNS Records for Domain Routing (MANUAL - T036-T038)

⚠️ **MANUAL DNS CONFIGURATION REQUIRED**

After SSL certificate validation, configure the domain routing in Namecheap:

#### A. Amplify Domain Records

Amplify Console will provide specific DNS records. Typically:

**For apex domain (inventoryhq.io)**:
```
Type: CNAME Record (or ALIAS if supported)
Host: @
Value: [provided by Amplify Console]
TTL: Automatic
```

**For www subdomain**:
```
Type: CNAME Record
Host: www
Value: [provided by Amplify Console]
TTL: Automatic
```

**Note**: Namecheap may require using ALIAS functionality for apex domain or URL forwarding. Check Amplify Console for exact instructions.

#### B. Email Authentication Records (if not already configured)

**SPF Record** (if not already set):
```
Type: TXT Record
Host: @
Value: v=spf1 include:amazonses.com ~all
TTL: Automatic
```

**DMARC Record** (if not already set):
```
Type: TXT Record
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:postmaster@inventoryhq.io
TTL: Automatic
```

**DKIM Records**:
- Get from AWS SES Console → Verified Identities → inventoryhq.io → DKIM
- Add all CNAME records provided by AWS SES

### 5. Verify Deployment

After DNS propagation (24-48 hours, but often faster):

- [ ] Visit https://inventoryhq.io → Application loads correctly
- [ ] Visit https://www.inventoryhq.io → Redirects or loads application
- [ ] Check SSL certificate → Valid for inventoryhq.io
- [ ] Verify page title shows "Inventory HQ"
- [ ] Test API calls work correctly
- [ ] Trigger test email → Sender shows noreply@inventoryhq.io

## CloudFormation Outputs Reference

After deployment, these outputs will be available:

| Output Name | Description | Used For |
|-------------|-------------|----------|
| `FrontendCertificateArn` | SSL certificate ARN | Reference/validation |
| `FrontendDistributionId` | CloudFront distribution ID | Cache invalidation |
| `FrontendDistributionDomainName` | CloudFront domain | DNS CNAME target |
| `FrontendBucketName` | S3 bucket name | Frontend deployment |
| `FrontendUrl` | Application URL | Reference |
| `InventoryApiUrl` | API Gateway URL | Backend API endpoint |

## Troubleshooting

### SSL Certificate Stuck in Pending Validation
- Verify CNAME records are correct in Namecheap
- Check DNS propagation: `dig _[hash].inventoryhq.io CNAME`
- Wait up to 30 minutes for validation

### Application Not Loading After DNS Configuration
- Check CloudFront distribution status (must be "Deployed")
## Troubleshooting

### SSL Certificate Stuck in Pending Validation
- Verify CNAME records are correct in Namecheap
- Check DNS propagation: `dig _[hash].inventoryhq.io CNAME`
- Wait up to 30 minutes for validation
- Check Amplify Console for validation status

### Application Not Loading After DNS Configuration
- Check Amplify deployment status
- Verify DNS records match Amplify Console instructions
- Check browser console for errors
- Verify API Gateway endpoint is accessible

### Email Deliverability Issues
- Verify SPF, DKIM, DMARC records in Namecheap
- Check SES reputation in AWS Console
- Ensure sender email (noreply@inventoryhq.io) is verified in SES
- Test email delivery using SES Console

### DNS Propagation Delay
- Use `dig inventoryhq.io` to check DNS resolution
- Try different DNS servers: `dig @8.8.8.8 inventoryhq.io`
- Global propagation can take 24-48 hours
- Flush local DNS cache if needed

## Security Checklist

- [ ] SSL certificate issued and valid (managed by Amplify)
- [ ] HTTPS enforced (Amplify default)
- [ ] Email authentication records (SPF, DKIM, DMARC) configured
- [ ] SES domain verification complete
- [ ] API Gateway CORS configured for inventoryhq.io

## Cost Estimation

**Monthly Costs** (estimated for low-traffic scenario):
- Amplify Hosting: ~$0.15/GB served + $0.01/build minute
- CloudFront (included in Amplify): Data transfer costs
- Certificate Manager: FREE (managed by Amplify)
- Backend (Lambda + DynamoDB): Pay-per-use

**Typical Total**: ~$5-15/month for low-traffic application

## Next Steps

After successful deployment:

1. **Monitor Amplify Deployment Logs** for build/deployment errors
2. **Monitor CloudWatch Logs** for Lambda function errors
3. **Set up branch-based deployments** in Amplify for dev/staging/prod
4. **Configure environment variables** in Amplify Console
5. **Enable automatic deployments** from Git commits

## Tasks Status Summary

### ✅ Completed (Code Changes)
- T047-T049: API CORS configuration for inventoryhq.io
- T057: Domain configuration constants in codebase

### ⏳ Manual Configuration Required
- T036-T038: Amplify app setup and custom domain configuration
- T040: SSL certificate DNS validation (via Amplify)
- T028, T032-T035: Email testing (after email infrastructure is live)
- T050-T055: Domain routing testing (after DNS configuration)

### 🚫 Skipped (Per User Request)
- T056, T058: Backward compatibility (old domain not widely used)
- T059-T061: Documentation (standard procedures, not needed)
- T062-T066: Final validation (deferred until email routing configured)

### ❌ Removed (Amplify Handles These)
- T039-T042: SSL Certificate (Amplify manages this automatically)
- T043-T046: CloudFront/S3 setup (Amplify manages this automatically)

## References

- [AWS Amplify Hosting Documentation](https://docs.aws.amazon.com/amplify/)
- [Amplify Custom Domain Setup](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Namecheap DNS Configuration](https://www.namecheap.com/support/knowledgebase/category/10/domains/)
- [AWS SES Domain Verification](https://docs.aws.amazon.com/ses/latest/dg/verify-domains.html)
