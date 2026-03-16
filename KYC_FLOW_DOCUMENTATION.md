# KYC (Know Your Customer) Verification Flow Implementation

## Overview
This document describes the complete KYC verification flow implemented using SmileID API.

## Flow Architecture

### 1. **Onboarding Phase** (Days 1-10 minutes)
- User registers and completes onboarding form
- Required fields:
  - Phone number
  - Nationality (country)
  - City
  - Date of Birth
  - Bio & Interests
  - **ID Type** (National ID, Passport, Driver's License)
  - **ID Document** (image file, upload)
  - Consent checkbox

**Status**: `documents_submitted`

### 2. **Document Verification** (10 minutes after upload)
- SmileID automatically verifies the uploaded ID document
- Verification includes:
  - Document authenticity
  - Information extraction from ID
  - Quality checks

**Status Updates**:
- ✅ If approved: `documents_approved`
- ❌ If failed: `documents_failed` (user can re-upload)

**Webhook Callback**:
- SmileID sends verification results to `/api/smile/webhook`
- Results are stored in `user_profiles` table
- User receives notification message

### 3. **Liveness Verification** (Triggered on next login after document approval)
- User logs in and middleware detects:
  - `documents_approved` status
  - `is_live_verified` is false
- User is redirected to `/verify-liveness` page
- VerifyLive component initializes SmileID web component
- User performs live facial biometrics verification
- Job type: `2` (Selfie/Liveness only)

**Status Updates**:
- ✅ If verified: `fully_verified`, `is_account_verified = true`
- ❌ If failed: `live_pending` (user can retry)

### 4. **Post-Verification**
- User gains full access to dashboard
- All KYC requirements complete
- Can proceed with property actions/transactions

## Database Schema

### user_profiles table
```sql
- id: UUID (primary key)
- verification_img: TEXT (file path to uploaded ID)
- verification_status: ENUM (
    'not_started'
    'documents_submitted'
    'documents_failed'
    'documents_approved'
    'live_pending'
    'fully_verified'
  )
- is_documents_verified: BOOLEAN
- is_live_verified: BOOLEAN
- is_account_verified: BOOLEAN
- updated_at: TIMESTAMP
```

## API Routes

### 1. `/api/smile/generate-token` (POST)
- Generates authentication tokens for SmileID requests
- Creates HMAC signature for secure API calls
- Used by both document and liveness verification

### 2. `/api/smile/validate-document` (POST)
- Triggers document verification via SmileID API
- **Input**: base64 image, country, id_type, userId
- **Job Type**: 6 (Document Verification)
- **Returns**: job_id from SmileID

### 3. `/api/smile/start-liveness` (POST)
- Initiates liveness verification
- **Job Type**: 2 (Selfie/Liveness only)
- **Returns**: initialization data for web component

### 4. `/api/smile/webhook` (POST)
- **CRITICAL**: Receives verification results from SmileID
- Handles both document (type 6) and liveness (type 2) results
- Updates user profile based on verification outcome
- Creates notifications for user
- **Result Code**: 0 = Verified, others = Failed

## Middleware Flow

Located in `/lib/supabase/middleware.ts`:

1. **Onboarding Check**: If `!onboarding_completed`, redirect to `/onboarding`
2. **Liveness Check**: If `documents_approved` && `!is_live_verified`, redirect to `/verify-liveness`
3. **Dashboard Access**: If fully verified, allow access

## Client Components

### VerifyLive
- Location: `/verification/VerifyLive.tsx`
- Initializes SmileID web component
- Handles liveness verification UI
- Callback URL: `/api/smile/webhook`

### VerificationModal
- Used for re-uploading documents if needed
- Shows existing verification image
- Allows users to upload new documents

### VerificationBanner
- Displays verification status messages
- Shows action prompts (e.g., "Complete liveness verification")

## Server Actions

### completeOnboarding (auth.ts)
- Uploads ID document to Supabase storage
- Saves user profile with verification status
- Sends confirmation email
- **Note**: Document verification is triggered by SmileID's periodic checking system

### triggerDocumentVerification (triggerVerification.ts)
- Manually triggers document verification if needed
- Reads image from storage and converts to base64
- Calls SmileID API

### getSignedDocUrl (Verification.ts)
- Generates temporary signed URL for verification images
- Allows secure viewing of uploaded documents
- 10-minute expiration by default

## Hooks

### useVerificationStatus
- Returns:
  - `isEmailVerified`: Email confirmation status
  - `isDocumentsVerified`: Document verification passed
  - `isLiveVerified`: Liveness verification passed
  - `isFullyVerified`: Both documents and liveness verified
  - `canVerifyLive`: Ready for liveness (documents approved)
  - `needsDocumentsReUpload`: Prompt to re-upload
  - `verificationStatus`: Current status string

## Environment Variables Required

```env
SMILE_ID_PARTNER_ID=your_partner_id
SMILE_ID_API_KEY=your_api_key
SMILE_ID_ENV=sandbox  # or production
SMILE_ID_CALLBACK_URL=https://yourdomain.com/api/smile/webhook
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_public_key
```

## Error Handling

### Document Upload Fails
- User stays on profile step
- Error message displayed
- User can retry

### Document Verification Fails
- User receives notification
- Status set to `documents_failed`
- User directed back to onboarding to re-upload
- Can access `/verify-liveness` route shows documents needed first

### Liveness Verification Fails
- User receives notification
- Status set to `live_pending`
- User can retry verification immediately or later

## Security Considerations

1. **Images Private**: Documents stored without public access (isPublic=false)
2. **Signed URLs**: Temporary access URLs expire after 10 minutes
3. **HMAC Signatures**: All SmileID API calls signed with API key
4. **Row Level Security**: Database policies ensure users only access their own data
5. **Admin Webhook**: Webhook uses admin client for updates (secure server-side processing)

## Testing the Flow

### Local Testing
1. Set env vars for SmileID sandbox
2. Create account and sign up
3. Complete onboarding with test documents
4. Check webhook delivery (SmileID dashboard)
5. Log in again - should be redirected to liveness
6. Complete liveness verification
7. Access dashboard fully

### Test Document
- Use SmileID's test images from their docs
- Job will complete quickly in sandbox mode

## Known Limitations

1. **10-Minute Window**: Currently relies on SmileID's backend processing
2. **Manual Verification Trigger**: In production, use a cron job for periodic checks
3. **Webhook Reliability**: Implement retry logic for failed webhook deliveries
4. **Image Storage**: Should be encrypted for sensitive documents
5. **Audit Trail**: Log all verification attempts for compliance

## Future Improvements

1. Implement database job queue for document verification scheduling
2. Add retry logic for failed webhook calls
3. Store verification audit logs
4. Add admin dashboard for manual verification review
5. Implement document OCR for data extraction
6. Add re-verification flows for document updates


## Functions deployments
supabase functions deploy process-verifications

## supabase cron to run every 10 minutes
supabase functions deploy process-verifications --schedule "*/10 * * * *"