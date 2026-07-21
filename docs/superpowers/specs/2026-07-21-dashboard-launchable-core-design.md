# Kumooo Dashboard Launchable Core Design

**Date:** 2026-07-21  
**Status:** Approved  
**Scope:** Launchable dashboard core

## Purpose

The Kumooo dashboard is the control center for creating and operating publishing sites. It should make the site's current state obvious, keep publishing fast, and expose infrastructure only when the user needs it.

The experience should combine:

- Vercel's clarity and restrained control surfaces
- Ghost's writing experience
- Cloudflare's edge infrastructure
- Stripe's developer ergonomics

It must not become a WordPress-style admin panel or claim capabilities that the platform does not yet provide.

## Product principles

- Show real state, never fabricated metrics or successful-looking placeholders.
- Keep common publishing tasks one or two actions away.
- Hide infrastructure complexity behind clear status and guided actions.
- Keep advanced controls discoverable without crowding the default view.
- Prefer calm, accessible interfaces over decorative motion.
- Preserve user ownership through Markdown, revisions, and future export support.
- Add features as complete vertical slices across UI, API, storage, and verification.

## Launchable-core boundary

This release includes:

- Working `*.kumooo.dev` tenant routing
- Responsive dashboard application shell
- Complete site, page, and post CRUD
- Multiple-site overview and creation
- Site overview using real operational data
- Posts and pages management
- Enhanced Markdown editor
- Drafts, publishing, scheduling, previews, and revisions
- Media library
- Theme selection and navigation editing
- Site and content SEO controls
- Template-based OpenGraph image maker
- Guided custom-domain setup
- Real publish/release activity
- General site settings

This release does not include:

- First-party traffic analytics ingestion
- External analytics integrations
- Organization invitations and team management
- API keys, webhooks, or API explorer
- Integration marketplace
- Two-factor authentication and session management UI
- Billing
- AI writing tools
- A general-purpose page builder
- Git-based theme builds and deployment logs
- Site duplication or ownership transfer

Deferred areas must not appear as functional controls. A restrained roadmap or “Coming later” area may mention them without fabricated data.

## Information architecture

### Global navigation

The global rail contains:

- Kumooo identity
- Current-site switcher
- All-sites link
- Account menu and sign-out

After the user selects a site, navigation is site-scoped:

- Overview
- Content
  - Posts
  - Pages
  - Collections
  - Media
- Design
  - Themes
  - Navigation
- SEO
- Deployments
- Domains
- Settings

Collections lists the site's available content types and routes into filtered content views. In this release that means posts, pages, and any types already stored on the site. Creating or editing custom type schemas is deferred and must not appear as a functional builder.

### Layout

Desktop uses a persistent 248-pixel sidebar, compact top bar, and wide content canvas. Mobile uses an accessible navigation drawer and keeps the current page's primary action reachable in a sticky action area.

Motion is limited to navigation transitions, dialogs, drawers, and meaningful state changes. All motion respects reduced-motion preferences.

### Visual language

- Soft off-white and charcoal surfaces rather than pure white or black
- Teal as the primary accent
- Subtle borders and elevation
- Dense but breathable data views
- Clear typography hierarchy
- Restrained status colors
- No large gradients, animated backgrounds, or ornamental dashboard charts

## Feature design

### All sites

The all-sites page supports:

- Site search
- Site cards or rows with name, hostname, routing status, last publish, content count, and active theme
- Open dashboard
- Visit live site when routing health is confirmed
- Creation wizard for name, slug, description, and starter theme
- Editing site name, description, language, timezone, and theme
- Reversible site archival and restoration
- Permanent deletion behind a typed-slug confirmation that clearly lists affected content, media, domains, and release history

The UI uses the URL returned by the API. It must not construct a hostname independently or display it as live before DNS and renderer routing pass health checks.

Site CRUD is complete only when users can create, list/read, update, archive, restore, and permanently delete a site. Permanent deletion is an explicit destructive operation, not the normal way to hide an inactive site.

### Overview

The overview answers “How is my website doing?” with real data:

- Health banner derived from tenant routing, renderer reachability, and active domain state
- Counts for published content, drafts, and media usage
- Last successful publish
- SEO health summary
- Current theme
- Quick actions for post creation, media upload, theme management, domain management, and viewing the live site
- Activity feed for content publishes, restores, settings changes, theme changes, uploads, and domain events

Traffic, uptime, security, and performance numbers are omitted until measured by a real subsystem.

### Content lists

Posts and pages have separate routes backed by a shared content-table component. They support:

- Search
- Status filters
- Pagination
- Bulk selection groundwork
- Clear draft, scheduled, published, and archived statuses
- Title, slug, author, status, and updated time
- Create, read, edit, preview, publish, schedule, archive, restore, and permanently delete actions

Bulk actions are enabled only when their API behavior is implemented.

Page and post CRUD share the same lifecycle rules. Archive is reversible. Permanent deletion is available from the archived state, requires confirmation, and removes the content only after the user has been told which public URL and revisions will be lost.

### Markdown editor

Markdown remains the source of truth. The editor adds visual assistance without introducing a lossy second document model.

The editor includes:

- Title and editable slug
- Markdown source editor
- Formatting toolbar
- Keyboard shortcuts
- Slash insertion menu
- Headings, lists, links, images, video embeds, tables, callouts, and fenced code
- Media picker and insert action
- Split, write-only, and preview modes
- Theme-accurate preview
- Debounced autosave
- Explicit saving, saved, offline, error, and conflict states
- Excerpt
- Tags
- Featured image
- Publishing state and schedule
- Content SEO fields
- Revision history and restore

The editor remains distraction-free. Metadata lives in a collapsible side panel rather than surrounding the writing canvas.

### Publishing and revisions

Publishing does not deploy a Worker. It updates content in D1 and invalidates the site's edge cache.

The flow is:

1. The editor saves a draft after a short idle period.
2. The API validates the expected content revision.
3. A conflict returns both the current server revision and a recoverable local state.
4. Publish or schedule creates a revision and activity event.
5. Publishing updates status and bumps the KV cache version.
6. The renderer serves the new version immediately.
7. Restoring creates a new revision instead of deleting history.

“Deployments” in this release represents real site releases and publish events. It does not fabricate Git branches, commits, builds, or logs. Git-based theme deployments may extend this area later.

### Preview

The API issues a signed, short-lived preview token containing the site, content, optional theme override, and expiry. The renderer verifies this token before rendering draft content.

Preview links:

- Must expire
- Must not publish or alter content
- Must render through the same theme path as production
- Must not be cached as public content
- May be regenerated or revoked by expiry

### Media library

The media library supports:

- Drag-and-drop and file-picker uploads
- Responsive grid and list modes
- Search and file-type filtering
- Image, video, and generic-file presentation
- Real filename, MIME type, dimensions where known, and file size
- Alt text and metadata editing
- Copy URL
- Insert into editor
- Delete with confirmation

The dashboard does not claim WebP/AVIF conversion, compression savings, folders, or transformations until an image-processing pipeline and storage model exist.

### Design

The Design area includes:

- Theme gallery
- Current-theme state
- Theme preview before apply
- Apply confirmation
- Simple navigation editor with ordering, labels, and URLs

This is not a page builder. Color, typography, spacing, and homepage-section controls appear only when declared by the active theme's supported settings contract.

### SEO

Site SEO includes:

- Site title and description
- Title template
- Default social image
- Canonical origin
- Robots indexing policy
- Social metadata defaults

Content SEO includes:

- SEO title
- Meta description
- Canonical URL
- Social image
- No-index control

The SEO health score checks actual platform output:

- Title
- Description
- Social image
- Canonical
- Sitemap
- Robots file
- Structured data
- Mobile viewport

Each check explains the issue and links to the control that fixes it.

### OpenGraph Maker

The SEO area includes a template-based visual OpenGraph image maker. It is intentionally narrower than a freeform design canvas.

The maker supports:

- A live 1200 by 630 pixel preview
- Background color, gradient, or media-library image
- Site logo or mark
- Title and subtitle layers
- Site name and optional URL
- Curated typography choices
- Text color, alignment, spacing, and constrained layout variants
- Safe-area guides for social-card cropping
- Site-level saved presets
- Per-page and per-post overrides
- Preview cards for common OpenGraph and X/Twitter presentation
- Reset to the active site preset

Templates store structured configuration rather than arbitrary HTML. Content templates may bind title, excerpt, site name, featured image, and canonical hostname. The same configuration drives both the editor preview and final image generation.

Final images are rendered deterministically at 1200 by 630 pixels, stored in R2, and written into the content or site SEO metadata. Regeneration creates a new immutable media asset so cached social previews do not change underneath an existing URL. The UI reports generation and upload failures and preserves the editable template.

### Domains

Tenant routing is a release blocker.

The platform must:

- Create a proxied wildcard DNS record for `*.kumooo.dev`
- Attach a `*.kumooo.dev/*` zone route to the renderer Worker
- Preserve explicit apex and docs routes
- Resolve the hostname to the existing global site slug
- Verify reachability before showing a “Live” state

Custom domains use a guided flow:

1. User enters a hostname.
2. API validates ownership conflicts and creates a pending domain.
3. Dashboard shows the exact required DNS record.
4. API verifies DNS and renderer reachability.
5. Dashboard reports DNS, SSL, CDN, and routing status separately.
6. Domain becomes active only after all required checks pass.
7. Removal deletes the site association and any platform-managed hostname configuration.

Cloudflare automation is used where the account and plan permit it. Otherwise, the flow remains guided and explicit instead of pretending configuration succeeded.

### Deployments

The first release shows:

- Publish/release history
- Success or failure
- Triggering user
- Timestamp
- Changed content
- Cache invalidation status
- Preview and production target
- Restore action where revision history supports it

Platform Worker deployments and Git theme builds remain separate future concepts.

### Settings

General settings include:

- Site name
- Description
- Language
- Timezone
- Active theme

Advanced settings expose only fields the renderer and API currently support. Environment variables, arbitrary scripts, and unsupported infrastructure toggles are deferred.

## Frontend architecture

The existing React/Vite dashboard remains the frontend platform.

Suggested boundaries:

```text
src/
  app/
    router.tsx
    providers.tsx
    AppShell.tsx
  components/
    ui/
    data-table/
    status/
    feedback/
  features/
    sites/
    overview/
    content/
    editor/
    media/
    design/
    seo/
    domains/
    deployments/
    settings/
  lib/
    api/
    query/
    validation/
    formatting/
```

Shared primitives include:

- Sidebar and mobile drawer
- Site switcher
- Command menu
- Page header
- Data table
- Status badge
- Empty state
- Skeleton
- Dialog and confirmation dialog
- Toast and inline error
- Form controls

Inline page styling is replaced with shared tokens and component classes. Server state is cached and invalidated by resource. Unsaved editor state remains local until autosave succeeds.

## Backend architecture

### Existing capabilities to expose

- Site retrieval and patching
- Content filters and pagination
- Content revisions
- Media deletion
- Domain listing, creation, and deletion
- Site settings and theme selection
- Tags, excerpts, SEO, featured images, and publishing statuses already accepted by the content model

### Required additions

- Aggregated site overview endpoint
- Site activity event storage and endpoint
- Site archive, restore, and guarded permanent-delete endpoints
- Reliable scheduling behavior
- Optimistic content-concurrency checks
- Explicit content archive, restore, and guarded permanent-delete behavior
- Revision restore endpoint
- Media metadata update endpoint
- Domain verification and status refresh
- Signed preview-token issuance and verification
- Routing-health endpoint
- OpenGraph template persistence, deterministic image rendering, and R2 asset generation

Site events are append-only and record actor, site, event type, resource, structured metadata, and timestamp.

## Error handling and safety

- Route-level error boundaries prevent one failed panel from blanking the app.
- Queries provide loading, empty, retryable error, and success states.
- Destructive operations require explicit confirmation and explain consequences.
- Autosave never reports success before the server confirms it.
- Offline and conflict states preserve local text.
- Session cookies remain HttpOnly.
- Preview tokens expire and contain no reusable credentials.
- API authorization remains role-based even before team management has a UI.
- Domain and renderer status use distinct states so DNS failure is not mislabeled as an application error.

## Accessibility and responsiveness

- Full keyboard navigation
- Visible focus states
- Correct labels and descriptions
- Screen-reader announcements for save and publish state
- Accessible dialogs and drawers with focus restoration
- Sufficient contrast in both color schemes
- Reduced-motion support
- Mobile-safe tables, editor controls, navigation, dialogs, and media views
- Touch targets of at least 44 CSS pixels for primary mobile controls

## Testing strategy

### Unit tests

- Routing-health interpretation
- SEO scoring
- Markdown insertion and serialization
- Domain state transitions
- Activity event creation
- Revision conflict and restore logic
- Site and content lifecycle transitions
- OpenGraph template validation and rendering inputs

### API integration tests

- Overview aggregation
- Content filtering
- Autosave conflicts
- Publish and cache invalidation
- Scheduling
- Revision listing and restore
- Preview authorization and expiry
- Domain verification
- Media metadata and deletion
- Site and content archive, restore, and permanent deletion
- OpenGraph preset persistence, per-content overrides, generation, and R2 metadata

### Browser tests

The critical production journey is:

1. Sign up
2. Create a site
3. Confirm its tenant hostname resolves
4. Create a post
5. Autosave
6. Preview through the active theme
7. Publish
8. Open the public post
9. Edit and restore a revision
10. Configure site settings and a guided domain
11. Create an OpenGraph preset and apply a generated image to the post
12. Archive and restore the post and a disposable site

### Production verification

- Dashboard, API, and renderer health
- Wildcard tenant DNS
- Disposable tenant creation and cleanup
- Cross-origin credential behavior
- Publish-cache invalidation
- Draft preview privacy
- Desktop and mobile smoke tests

## Delivery sequence

1. Wildcard tenant-routing hotfix
2. Responsive application shell and shared UI primitives
3. Typed API modules and real overview/activity data
4. All-sites experience and creation wizard
5. Content tables and Markdown editor
6. Preview, scheduling, revisions, and restores
7. Media library
8. Themes, navigation, and SEO
9. OpenGraph maker and generated assets
10. Guided domains
11. Deployments/releases and settings
12. Site and content lifecycle completion
13. Accessibility, browser tests, production rollout, and smoke verification

## Completion criteria

The launchable core is complete when:

- A newly created `{slug}.kumooo.dev` site resolves publicly.
- The dashboard never shows fabricated operational or analytics data.
- A user can create, autosave, preview, publish, schedule, revise, and restore content.
- A user can complete site, page, and post CRUD, including guarded permanent deletion.
- Preview output matches the selected production theme.
- Media can be uploaded, managed, and inserted into content.
- A user can select a theme, edit navigation, configure SEO, and manage general settings.
- A user can create a reusable OpenGraph template, generate a real 1200 by 630 image, and override it per page or post.
- A user can follow domain instructions and see verified DNS, SSL, and routing states.
- Release activity accurately reflects content and settings changes.
- The complete critical journey passes in production on desktop and mobile.
