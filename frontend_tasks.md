# Sable Dreams - Frontend (Mobile App) Task Checklist

This document details the pending frontend (mobile app) changes and configurations required to align with the updated backend API and address the outstanding app issues.

---

## 1. Journal Entry Timezone & Date Fixes
The backend now supports timezone-aware filtering and formatting. The frontend must pass timezone context when creating entries and display them in local time.

- [ ] **Send timezone in Payload:**
  Update the journal creation request to send the user's current local date and device timezone:
  ```json
  {
    "title": "My Journal Entry",
    "content": "...",
    "createdAt": "2026-08-27T10:00:00", 
    "timeZone": "America/New_York"
  }
  ```
  *(Priority: client-provided `timeZone` > fallback reminder `timeZone` > UTC)*
- [ ] **Convert UTC Dates on Display:**
  Ensure the app parses the UTC date-time string returned by the `/journals` endpoint and formats it using the device's local timezone.

---

## 2. iPhone Push Notification Config & Tokens
iPhone users are not receiving correct reminder notifications, or they are out of sync.

- [ ] **Upload FCM Token to Backend:**
  Ensure that when the iOS app starts, it requests push notification permissions, retrieves the Firebase Cloud Messaging (FCM) token, and sends it to the backend endpoint:
  `PATCH /users/update-profile` with `{ "fcmToken": "<TOKEN>" }`.
- [ ] **FCM & APNs Configuration:**
  - Verify that the Apple Push Notification service (APNs) Auth Key or Certificate is correctly uploaded under Firebase Console -> Project Settings -> Cloud Messaging -> APNs.
  - Enable the "Push Notifications" and "Background Modes" (Remote notifications) capabilities in Xcode.
- [ ] **Wording Alignment:**
  If the iOS app triggers reminders locally, update the text in the app code to match the new backend FCM notification copy.

---

## 3. Onboarding Screens Correction
- [ ] **Update Onboarding Flow & Design:**
  Redesign and rearrange the onboarding wizard screens in the app to match the latest design specs.

---

## 4. Journal Search & Filter by Mood
The backend `getMyJournals` endpoint already handles filtering by mood. The frontend needs to expose this in the UI.

- [ ] **Add Mood Filters in UI:**
  Introduce interactive filters (chips/tags) for moods (e.g., Happy, Calm, Anxious, Neutral) in the journal list screen.
- [ ] **Call API with Mood Parameters:**
  Append selected moods as query parameters when fetching journals:
  `GET /journals?moods=HAPPY,CALM` or `GET /journals?mood=GRATEFUL`
- [ ] **Text Search by Mood:**
  Typing a mood name (e.g. "happy") in the search input can be sent directly as `GET /journals?search=happy`. The backend will automatically match the mood field.

---

## 5. RevenueCat Subscription Sync & Integration
The subscription status in the app is not reflecting the user's Google Play or App Store purchase.

- [ ] **Initialize RevenueCat with Backend User ID:**
  **CRITICAL:** When configuring/logging in to the RevenueCat SDK in the app, you MUST pass the **backend database User ID** (returned as `user.id` upon login/registration), NOT the Firebase authentication UID or email.
  ```typescript
  // Example
  await Purchases.logIn(userId); // Use the SQL/MongoDB database ID (e.g. 64e9a...)
  ```
- [ ] **Fetch Subscription Info from Backend:**
  Do not compute premium status solely on the client. Request active status and details from:
  `GET /subscriptions/details`
- [ ] **Trigger Manual Sync:**
  Add a button or trigger to sync subscriptions when the user restores purchases. This should call:
  `POST /subscriptions/sync`

---

## 6. Manifestation Complete Screen & Notification Placement
- [ ] **Re-position Manifestation Success Modal:**
  Review and relocate the modal/success toast triggered when updating a manifestation's state to "Done" (i.e. 'manifestation has fully arrived'). Ensure it triggers in the correct UI screen.

---

## Backend Config Reference (For Dev Verification)
- **Brevo API Setup:** Fully completed in `.env` and `sendEmail.ts`. Welcome emails are active on sign-up/social login.
- **Base Endpoint:** `/api/v1`
- **Database:** Prisma (MongoDB)
