## Feature Description

A registration flow that lets new users create an account using a username, email, and password. On success the user is immediately authenticated (access + refresh tokens issued) and redirected to their profile or feed. Duplicate emails and usernames are rejected with clear feedback. Passwords are validated client-side before submission.

## UX / Design Intent

**Registration page (`/register`)**
- Single centered card form with four fields: Username, Email, Password, Confirm Password.
- "Already have an account? Sign in" link routes to `/login`.
- Submit button reads "Create account"; disabled while request is in flight.

**Field states:**
- Username: min 3 chars, max 30, alphanumeric + underscores only — validated on blur.
- Email: standard format validation on blur.
- Password: min 8 chars — show strength indicator (weak / fair / strong) as user types.
- Confirm Password: must match Password — validated on blur.

**Loading state:**
- Button shows spinner, all fields disabled, no double-submit possible.

**Error states:**
- Inline field errors appear below the relevant input (e.g. "Username already taken", "Email already registered").
- Generic server error shown as a banner above the form ("Something went wrong, please try again").

**Success state:**
- User is redirected to `/` (feed) immediately after registration; no separate confirmation screen.
- No email verification required in Phase 1.

**Edge cases:**
- If the user navigates to `/register` while already authenticated, redirect to `/`.
- Trim leading/trailing whitespace from username and email before submission.
