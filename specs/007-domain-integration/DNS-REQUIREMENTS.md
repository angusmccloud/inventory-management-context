# DNS Requirements for inventoryhq.io

**Domain**: inventoryhq.io  
**Registrar**: Namecheap  
**Target Platform**: AWS (SES, Certificate Manager, Amplify/CloudFront)  
**Date**: December 20, 2025

---

## Overview

This document outlines all DNS records required to configure inventoryhq.io for the Inventory HQ application. These records enable email authentication, SSL certificate validation, and application hosting.

---

## Phase 1: Email Authentication Records (US2 - Priority P1)

### Purpose
Configure AWS SES for email sending with proper authentication to ensure deliverability and prevent spoofing.

### Required Records

#### 1. SPF (Sender Policy Framework) Record
**Type**: TXT  
**Host**: `@` (root domain)  
**Value**: `v=spf1 include:amazonses.com ~all`  
**TTL**: 3600 (1 hour)

**Purpose**: Authorizes AWS SES to send emails on behalf of inventoryhq.io

#### 2. DKIM Records (DomainKeys Identified Mail)
**Type**: CNAME  
**Host**: `<token1>._domainkey` (provided by AWS SES after domain verification)  
**Value**: `<token1>.dkim.amazonses.com` (provided by AWS SES)  
**TTL**: 3600

**Type**: CNAME  
**Host**: `<token2>._domainkey` (provided by AWS SES)  
**Value**: `<token2>.dkim.amazonses.com` (provided by AWS SES)  
**TTL**: 3600

**Type**: CNAME  
**Host**: `<token3>._domainkey` (provided by AWS SES)  
**Value**: `<token3>.dkim.amazonses.com` (provided by AWS SES)  
**TTL**: 3600

**Purpose**: Cryptographically signs emails to verify authenticity

**Note**: AWS SES provides 3 DKIM tokens during domain verification. You must add all 3 CNAME records.

#### 3. DMARC Policy Record
**Type**: TXT  
**Host**: `_dmarc`  
**Value**: `v=DMARC1; p=quarantine; rua=mailto:dmarc@inventoryhq.io; pct=100`  
**TTL**: 3600

**Purpose**: Specifies policy for handling emails that fail SPF/DKIM validation
- `p=quarantine`: Failed emails should be marked as spam
- `rua=mailto:dmarc@inventoryhq.io`: Reports sent to this address (optional)
- `pct=100`: Apply policy to 100% of emails

---

## Phase 2: SSL Certificate Validation (US3 - Priority P2)

### Purpose
Validate domain ownership for AWS Certificate Manager to issue SSL certificate.

### Required Records

#### Certificate Validation CNAME
**Type**: CNAME  
**Host**: `<validation-token>` (provided by AWS Certificate Manager)  
**Value**: `<validation-target>.acm-validations.aws` (provided by AWS Certificate Manager)  
**TTL**: 300 (5 minutes - faster validation)

**Purpose**: Proves domain ownership to AWS Certificate Manager

**Note**: AWS Certificate Manager provides unique validation tokens when you request a certificate. Add the CNAME record exactly as specified in the Certificate Manager console.

---

## Phase 3: Application Hosting (US3 - Priority P2)

### Purpose
Route traffic from inventoryhq.io to AWS hosting infrastructure (Amplify or CloudFront).

### Required Records

#### Option A: AWS Amplify Hosting

**For root domain (inventoryhq.io)**:
**Type**: A (Alias)  
**Host**: `@`  
**Value**: Amplify domain (e.g., `<branch-name>.<app-id>.amplifyapp.com`)  
**TTL**: Auto (managed by Namecheap for ALIAS/ANAME records)

**For www subdomain**:
**Type**: CNAME  
**Host**: `www`  
**Value**: `<branch-name>.<app-id>.amplifyapp.com`  
**TTL**: 3600

#### Option B: CloudFront + S3 Hosting

**For root domain (inventoryhq.io)**:
**Type**: A (Alias)  
**Host**: `@`  
**Value**: CloudFront distribution domain (e.g., `d123abc.cloudfront.net`)  
**TTL**: Auto

**For www subdomain**:
**Type**: CNAME  
**Host**: `www`  
**Value**: `d123abc.cloudfront.net`  
**TTL**: 3600

**Note**: Namecheap supports ALIAS records for root domains. If not available, use CNAME flattening or Namecheap's URL Redirect feature.

---

## Phase 4: API Gateway Custom Domain (Optional)

### Purpose
Route API calls to AWS API Gateway with custom domain (e.g., api.inventoryhq.io).

### Required Records

**Type**: CNAME  
**Host**: `api`  
**Value**: API Gateway regional domain (e.g., `<api-id>.execute-api.<region>.amazonaws.com`)  
**TTL**: 3600

**Note**: This is optional and depends on API Gateway custom domain configuration.

---

## Implementation Sequence

### Step 1: Email Authentication (Immediate - US2)
1. Add SPF TXT record
2. Request SES domain verification in AWS Console
3. Add 3 DKIM CNAME records (from SES verification)
4. Add DMARC TXT record
5. Verify all records propagate (use `dig` or `nslookup`)
6. Complete SES domain verification in AWS Console

### Step 2: SSL Certificate (Before Hosting - US3)
1. Request SSL certificate in AWS Certificate Manager for inventoryhq.io and www.inventoryhq.io
2. Add certificate validation CNAME record (from Certificate Manager)
3. Wait for certificate validation (usually 5-30 minutes)
4. Verify certificate is issued

### Step 3: Application Hosting (After Certificate - US3)
1. Configure Amplify or CloudFront with custom domain
2. Add A/ALIAS record for root domain
3. Add CNAME record for www subdomain
4. Test domain routing (may take 5-60 minutes for DNS propagation)

---

## Verification Commands

### Check SPF Record
```bash
dig inventoryhq.io TXT +short | grep spf
# Expected: "v=spf1 include:amazonses.com ~all"
```

### Check DKIM Records
```bash
dig <token1>._domainkey.inventoryhq.io CNAME +short
dig <token2>._domainkey.inventoryhq.io CNAME +short
dig <token3>._domainkey.inventoryhq.io CNAME +short
# Expected: Each returns a .dkim.amazonses.com domain
```

### Check DMARC Record
```bash
dig _dmarc.inventoryhq.io TXT +short
# Expected: "v=DMARC1; p=quarantine; ..."
```

### Check SSL Certificate Validation
```bash
dig <validation-token>.inventoryhq.io CNAME +short
# Expected: Returns acm-validations.aws domain
```

### Check Domain Routing
```bash
dig inventoryhq.io A +short
dig www.inventoryhq.io CNAME +short
# Expected: Returns Amplify or CloudFront addresses
```

---

## DNS Propagation Timeline

- **Local DNS**: 5-15 minutes
- **Regional DNS**: 1-4 hours
- **Global DNS**: 24-48 hours (full propagation)

**Recommendation**: Use https://dnschecker.org to verify global propagation before testing.

---

## Namecheap-Specific Notes

### Adding Records in Namecheap

1. Log in to Namecheap account
2. Navigate to **Domain List** → **Manage** (next to inventoryhq.io)
3. Go to **Advanced DNS** tab
4. Click **Add New Record** for each DNS entry
5. Select record type (A, CNAME, TXT)
6. Enter Host and Value exactly as specified above
7. Set TTL (or use Auto)
8. Click green checkmark to save

### ALIAS/ANAME Support

Namecheap supports ALIAS records for root domain (@) routing. Use this for CloudFront or Amplify distributions instead of A records when possible.

### Limitations

- Some DNS changes may take 30-60 minutes to propagate through Namecheap's nameservers
- Wildcard records are supported if needed (e.g., `*.inventoryhq.io`)
- Maximum TXT record length: 255 characters (SPF/DMARC fit within this limit)

---

## Contact and Support

**AWS SES Documentation**: https://docs.aws.amazon.com/ses/latest/dg/verify-domain-procedure.html  
**AWS Certificate Manager**: https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-validate-dns.html  
**Namecheap DNS Guide**: https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/

---

## Next Steps

After DNS records are configured:

1. **T016-T020**: Configure AWS SES domain verification
2. **T039-T042**: Request and validate SSL certificate
3. **T043-T046**: Configure Amplify/CloudFront with custom domain
4. **T050-T055**: Test domain routing and SSL certificate
