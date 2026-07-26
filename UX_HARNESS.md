# UX Testing Harness & User Stories

This document defines the strict, repeatable test suite that **MUST** be executed before and after any feature development to prevent regressions (such as the 24-hour production login lockout).

## 1. Authentication & Identity Flow (Clerk)
**Description:** Verify that the core Web2 Identity layer is intact.
- [ ] **Test 1.1:** Navigate to the root URL `/`. Ensure the landing page loads without errors.
- [ ] **Test 1.2:** Navigate to `/dashboard` while logged out. Ensure you are redirected to `/sign-in`.
- [ ] **Test 1.3:** Complete the login flow via Clerk. Ensure you are successfully redirected to `/dashboard`.
- [ ] **Test 1.4:** Click the "Sign Out" button. Ensure the session clears and you are redirected to the public area.

## 2. Cryptographic Key Management (Phase 1)
**Description:** Verify that the 3-Layer Zero-Knowledge architecture and `WebCryptoManager` are correctly defending the local data shard.
- [ ] **Test 2.1:** Navigate to the Data Linkage or Explore page.
- [ ] **Test 2.2:** Attempt to mount a local dataset without entering a PIN. Ensure the dataset remains encrypted/locked.
- [ ] **Test 2.3:** Enter an incorrect 4-digit PIN. Ensure the `WebCryptoManager` mathematically rejects the derivation and the UI displays an error.
- [ ] **Test 2.4:** Enter the correct 4-digit PIN. Ensure the dataset mounts and the `useVoterRollConnection` context registers `isDataConnected` as `true`.

## 3. Executive Dashboard & Component Layout (Phase 2)
**Description:** Verify that the architectural deconstruction prevents spaghetti code UI and fake loaders.
- [ ] **Test 3.1:** Load a synthetic benchmark dataset. Verify that the ingestion executes synchronously without cascading `setTimeout` bars.
- [ ] **Test 3.2:** Navigate to the `/explore` route. Verify the true 3-panel flexbox layout.
- [ ] **Test 3.3:** Scroll the center Data Table independently. Verify that the Right Side Panel (Action Log) remains fixed and does not scroll out of view.
- [ ] **Test 3.4:** Click "Create Task" on an anomaly record. Verify that it instantly pushes to the Kanban Context without relying on `window.alert` hacks.

## Enforcement Rule
Developers and Agents **MUST** confirm that all checkboxes pass before executing a `predeploy` or `deploy` script. Failure to do so will result in an architectural regression.
