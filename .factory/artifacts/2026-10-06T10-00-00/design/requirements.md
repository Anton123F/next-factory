# Requirements

## Feature Description

The platform needs authentication before users can access any content. Two independent login implementations exist — JWT (username + password) and Google OAuth — but only one is active at a time. Switching between them is a deliberate code-level change by the developer, not a runtime toggle. After a successful login by either method, the user lands on a minimal home page that greets them by name.

## UX / Design Intent

### Login Page — JWT mode (default)

Single centered card on a neutral background. Contains:
- A username text input
- A password input (masked, toggle visibility optional)
- A "Sign in" submit button

**States:**
- **Idle:** form is blank and interactive
- **Loading:** submit button shows a spinner and is disabled; inputs remain visible
- **Error:** an inline message appears below the form (e.g. "Invalid username or password"); form resets to idle after dismissal or re-submit
- **Success:** no visual feedback — immediately redirect to the main page

No registration link, no "forgot password" link — out of scope for now.

---

### Login Page — OAuth mode (alternate, inactive by default)

Same centered card layout. Contains:
- A single "Sign in with Google" button (Google branding: icon + label)

**States:**
- **Idle:** button is interactive
- **Loading:** button shows a spinner after click, disabled until redirect or error
- **Error:** inline message if the OAuth callback returns an error (e.g. "Google sign-in failed, please try again")
- **Success:** redirect to main page (callback handled server-side)

No other form fields. The card is intentionally minimal.

---

### Switching between modes

The codebase contains two backend endpoints (`/api/v1/auth/login/jwt` and `/api/v1/auth/login/google`) and two corresponding frontend login page components. One pair is wired to the active `/login` route; the other pair exists but is not connected. A developer switches the active mode by changing which component and endpoint the `/login` route points to — no feature flags, no env vars, no runtime condition.

---

### Main Page (post-login)

Available only to authenticated users. Redirects to `/login` if no valid session exists.

Contains a single heading:

> Hello, {username}

No navigation, no content, no actions. This is a placeholder that will be expanded in later phases.

**States:**
- **Loading:** brief spinner while session is verified
- **Authenticated:** greeting heading visible
- **Unauthenticated:** silent redirect to `/login`
