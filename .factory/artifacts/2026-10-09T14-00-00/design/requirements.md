## Feature Description

The Video Management Dashboard is an authenticated workspace where a signed-in user can upload videos and browse their personal video library. It lives under the `/dashboard` route and provides two views — a file upload interface and an "all videos" gallery — wrapped in a persistent shell that keeps navigation always visible. The shell eliminates full-page reloads between views and gives users a clear sense of where they are in the app at all times.

## UX / Design Intent

**Shell (present on all dashboard views)**

The page is split into a fixed top header and a two-column body. The header spans full width, holds the brand logo on the left and the signed-in user's avatar and name on the right. The body is divided into a fixed-width left sidebar (≈256 px) and a flexible main content area. The sidebar contains exactly two navigation items: "Upload Videos" and "Show All Videos." The currently active route is visually distinguished (highlighted background + accent text color) so the user always knows which view is active. Clicking a nav item transitions to the corresponding view without a browser reload.

**Show All Videos view (`/dashboard` — default)**

The main area shows a page title ("All Videos") and a short subtitle. Below, videos are displayed in a responsive card grid (3–4 columns on wide screens, collapsing on smaller viewports). Each card shows a video thumbnail, title, upload date, and status badge (e.g. Processing / Ready). The grid area handles three states:
- *Empty*: A centered message and a call-to-action button that navigates to the upload view.
- *Loading*: Skeleton placeholder cards in the grid layout.
- *Populated*: The full card grid with real data.

**Upload Videos view (`/dashboard/upload`)**

The main area shows a centered dropzone card with a dashed border. Inside: an upload icon, a primary label ("Drag & drop your video here"), a secondary hint ("MP4, MOV, AVI up to 2 GB"), and a "Select Files" button that opens the native file picker. After a file is selected the card transitions to show a file name, size, a progress bar, and a "Cancel" link. On success, a brief confirmation is shown and the user is offered a link to "View in library." On error, an inline error message appears with a retry option. Only one file can be in-flight at a time; selecting a second file replaces the pending one (with a confirmation prompt if upload is already in progress).
