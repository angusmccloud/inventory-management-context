# AWS SES Domain Setup Guide for inventoryhq.io

**Date**: December 20, 2025  
**Domain**: inventoryhq.io  
**Purpose**: Configure AWS SES for sending emails from inventoryhq.io domain

> **⚠️ IMPORTANT: Infrastructure as Code First**  
> Most AWS configurations should be defined in `template.yaml` using AWS SAM/CloudFormation.  
> This guide covers SES domain verification, which is one of the few AWS operations that  
> **MUST be performed manually** via the console (CloudFormation cannot initiate verification).  
> For Cognito email configuration, IAM roles, and other AWS resources, ALWAYS use `template.yaml`.

---

## Prerequisites

✅ Domain inventoryhq.io registered in Namecheap  
✅ Route 53 hosted zone created for inventoryhq.io  
✅ Nameservers updated in Namecheap to point to AWS Route 53

---

## Step 1: Verify Domain in AWS SES (T016)

### Navigate to AWS SES Console

1. Open AWS Console and go to **Amazon SES** service
2. Select your region (ensure it matches your Lambda deployment region)
3. Go to **Configuration** → **Verified identities**

### Add Domain

1. Click **Create identity**
2. Select **Domain** as identity type
3. Enter domain: `inventoryhq.io`
4. **DKIM Settings**:
   - Enable **Easy DKIM** ✅
   - DKIM signing key length: **2048-bit** (recommended)
   - Select **Publish DNS records to Route 53** ✅ (this will auto-create records)
5. Click **Create identity**

AWS will automatically create the required DNS records in your Route 53 hosted zone:
- **3 DKIM CNAME records** (for email authentication)
- **1 TXT record** (for domain verification) - optional if using Easy DKIM

### Verification Status

- DNS records are typically created within 1-2 minutes
- Domain verification can take **5-30 minutes**
- Check the verification status in the SES console

---

## Step 2: Configure SPF Record (T017)

### What is SPF?

SPF (Sender Policy Framework) authorizes AWS SES to send emails on behalf of inventoryhq.io.

### Add SPF TXT Record

**If using Route 53** (recommended since you have a hosted zone):

1. Go to **Route 53** → **Hosted zones** → Select `inventoryhq.io`
2. Click **Create record**
3. Configure:
   - **Record name**: Leave blank (applies to root domain)
   - **Record type**: TXT
   - **Value**: `"v=spf1 include:amazonses.com ~all"`
   - **TTL**: 3600
4. Click **Create records**

**If using Namecheap DNS** (if not using Route 53):

1. Log in to Namecheap
2. Go to Domain List → Manage → Advanced DNS
3. Add New Record:
   - Type: TXT
   - Host: @
   - Value: `v=spf1 include:amazonses.com ~all`
   - TTL: Automatic

### Verify SPF Record

```bash
dig inventoryhq.io TXT +short | grep spf
# Expected output: "v=spf1 include:amazonses.com ~all"
```

---

## Step 3: DKIM Records (T018)

### What is DKIM?

DKIM (DomainKeys Identified Mail) cryptographically signs emails to prove they came from your domain.

### DKIM Configuration

✅ **If you selected "Publish DNS records to Route 53" during Step 1**, DKIM records are **automatically created**. No manual action needed!

**To verify DKIM records**:

1. Go to **Route 53** → **Hosted zones** → `inventoryhq.io`
2. Look for 3 CNAME records with names like:
   - `<token1>._domainkey.inventoryhq.io`
   - `<token2>._domainkey.inventoryhq.io`
   - `<token3>._domainkey.inventoryhq.io`
3. Each should point to `<token>.dkim.amazonses.com`

**If DKIM records were NOT auto-created** (manual setup):

1. In SES Console, go to the verified identity `inventoryhq.io`
2. Go to **DKIM** tab
3. Copy the 3 CNAME record names and values
4. Add them to Route 53 or Namecheap DNS

### Verify DKIM Records

```bash
# Get DKIM tokens from SES console first, then test
dig <token1>._domainkey.inventoryhq.io CNAME +short
# Expected: <token1>.dkim.amazonses.com
```

---

## Step 4: Configure DMARC Record (T019)

### What is DMARC?

DMARC (Domain-based Message Authentication, Reporting & Conformance) specifies what to do with emails that fail SPF/DKIM checks.

### Add DMARC TXT Record

**Using Route 53**:

1. Go to **Route 53** → **Hosted zones** → `inventoryhq.io`
2. Click **Create record**
3. Configure:
   - **Record name**: `_dmarc`
   - **Record type**: TXT
   - **Value**: `"v=DMARC1; p=quarantine; rua=mailto:dmarc@inventoryhq.io; pct=100"`
   - **TTL**: 3600
4. Click **Create records**

**DMARC Policy Explained**:
- `v=DMARC1` - DMARC version
- `p=quarantine` - Failed emails go to spam (not rejected outright)
- `rua=mailto:dmarc@inventoryhq.io` - Send aggregate reports to this email (optional)
- `pct=100` - Apply policy to 100% of emails

**Alternative Policies**:
- `p=none` - Monitor only (recommended for testing)
- `p=reject` - Reject failed emails (most strict)

### Verify DMARC Record

```bash
dig _dmarc.inventoryhq.io TXT +short
# Expected: "v=DMARC1; p=quarantine; rua=mailto:dmarc@inventoryhq.io; pct=100"
```

---

## Step 5: Verify All Records (T020)

### DNS Propagation Check

Use https://dnschecker.org to verify global DNS propagation:

1. **SPF Record**:
   - Domain: `inventoryhq.io`
   - Type: TXT
   - Look for: `v=spf1 include:amazonses.com ~all`

2. **DKIM Records**:
   - Domain: `<token1>._domainkey.inventoryhq.io` (repeat for all 3 tokens)
   - Type: CNAME
   - Look for: `<token>.dkim.amazonses.com`

3. **DMARC Record**:
   - Domain: `_dmarc.inventoryhq.io`
   - Type: TXT
   - Look for: `v=DMARC1; p=quarantine...`

### SES Domain Verification Status

1. Go to **Amazon SES** → **Verified identities**
2. Click on `inventoryhq.io`
3. Check status:
   - ✅ **Identity status**: Verified (green checkmark)
   - ✅ **DKIM status**: Successful (3/3 records verified)

### Email Authentication Testing Tools

- **MXToolbox**: https://mxtoolbox.com/SuperTool.aspx
  - Test SPF: Search for `inventoryhq.io`
  - Test DMARC: Search for `_dmarc.inventoryhq.io`
  - Test DKIM: Search for `<token>._domainkey.inventoryhq.io`

- **Google Admin Toolbox**: https://toolbox.googleapps.com/apps/checkmx/
  - Enter `inventoryhq.io` to check all email authentication records

---

## Step 6: Move SES Out of Sandbox (Optional but Recommended)

By default, AWS SES is in **Sandbox mode**, which restricts email sending:
- Can only send to **verified email addresses**
- Limit of **200 emails/day**
- Rate of **1 email/second**

### Request Production Access

1. Go to **Amazon SES** → **Account dashboard**
2. Check if account is in **Sandbox mode**
3. If in Sandbox, click **Request production access**
4. Fill out the request form:
   - **Use case**: Transactional emails for family inventory management application
   - **Website URL**: https://inventoryhq.io
   - **Describe how you'll use SES**: User invitations, low-stock notifications, password resets
   - **Email content compliance**: Confirm you follow AWS acceptable use policy
5. Submit request
6. AWS typically approves within **24 hours**

---

## Step 7: Configure SES Sending Identity

### Set Default FROM Email

The backend already has this configured via environment variables:
- `SES_FROM_EMAIL=noreply@inventoryhq.io` (set in T005)

### Verify Email Address (if needed)

If you want to test email sending before domain verification completes:

1. Go to **Amazon SES** → **Verified identities**
2. Click **Create identity**
3. Select **Email address**
4. Enter: `noreply@inventoryhq.io`
5. Check the inbox and click the verification link

**Note**: This is optional if domain verification is complete.

---

## Troubleshooting

### Domain Not Verifying

- **Check DNS records**: Use `dig` or `nslookup` to verify records exist
- **Wait for propagation**: DNS changes can take up to 48 hours globally
- **Re-verify in SES**: Go to the identity and click "Verify" again

### DKIM Records Not Found

- Ensure all 3 CNAME records are created in Route 53/Namecheap
- Check that record names include `._domainkey.inventoryhq.io`
- Verify target values end with `.dkim.amazonses.com`

### SPF Record Conflicts

- If you have an existing SPF record, merge them (only 1 SPF record allowed per domain)
- Example: `v=spf1 include:amazonses.com include:other-service.com ~all`

### DMARC Not Working

- Ensure record name is exactly `_dmarc` (no leading dot)
- Value must be quoted: `"v=DMARC1; p=quarantine..."`
- Test with https://mxtoolbox.com/dmarc.aspx

---

## Next Steps After Configuration

Once all DNS records are verified and SES domain is verified:

1. ✅ **T021-T024**: Update backend email service code to use `noreply@inventoryhq.io`
2. ✅ **T025-T028**: Configure Cognito to use SES for email sending
3. ✅ **T032-T035**: Test email delivery for all email types

---

## Commands Reference

### Check All Records at Once

```bash
# SPF
dig inventoryhq.io TXT +short | grep spf

# DKIM (replace <token> with actual tokens from SES)
dig <token1>._domainkey.inventoryhq.io CNAME +short
dig <token2>._domainkey.inventoryhq.io CNAME +short
dig <token3>._domainkey.inventoryhq.io CNAME +short

# DMARC
dig _dmarc.inventoryhq.io TXT +short

# Nameservers (verify Route 53 is authoritative)
dig inventoryhq.io NS +short
```

---

## Summary Checklist

- [ ] T016: SES domain `inventoryhq.io` added and verified
- [ ] T017: SPF TXT record created in Route 53
- [ ] T018: 3 DKIM CNAME records created (auto-created if using Easy DKIM)
- [ ] T019: DMARC TXT record created in Route 53
- [ ] T020: All DNS records verified with `dig` and DNS checker tools
- [ ] (Optional) SES account moved out of Sandbox mode

Once complete, proceed to **Phase 4.2: SES Email Sender Configuration** to update backend code.
