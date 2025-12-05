# Overview

TIKEZONE is a modern, premium ticketing platform designed for events across Africa. Built with Next.js 16, React 19, and TypeScript, it provides a comprehensive solution for event discovery, ticket booking, payment processing, and event management. The platform features a vibrant, bold design system with a "neobrutalist" aesthetic (thick borders, pop shadows, bright colors) and supports both customer and organizer workflows.

Key capabilities include:
- Event browsing and discovery with filtering (category, date, price)
- Multi-tier ticketing system with promotional pricing
- Secure payment processing via Mobile Money (Wave, Orange, MTN) and credit cards
- QR code ticket generation and delivery (Email/WhatsApp)
- Event organizer dashboard for creating and managing events
- User authentication with email verification
- File storage integration (AWS S3/Cloudflare R2)
- Favorites and notification systems

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework:** Next.js 16 (App Router) with React 19 Server Components and Client Components
- Uses TypeScript with strict mode enabled
- Tailwind CSS for styling with custom neobrutalist design system (thick borders, pop shadows, rounded corners)
- Custom color palette centered around brand pink/red (`brand-*` shades)
- Font stack: Quicksand (sans), Fredoka (display)

**State Management:**
- React Context API for global state (AuthContext, FavoritesContext)
- LocalStorage for client-side persistence (favorites, bookings)
- No external state management library

**Routing:**
- App Router with file-based routing
- Custom `safe-navigation.tsx` wrapper around Next.js navigation primitives
- Dynamic routes for events (`/events/[slug]` or `/events/[id]`)
- Protected routes via context checks (organizer pages require role verification)

**Key UI Patterns:**
- Modal-based checkout flow (CheckoutModal, FreeTicketModal)
- Skeleton loaders for async content
- Intersection Observer for lazy-loading event cards
- Video hover previews on event cards (with fallback to images)

## Backend Architecture

**Runtime:** Node.js with Next.js API Routes (Route Handlers in App Router)
- Edge-compatible where possible, though most routes use Node runtime for database access
- Custom build script (`scripts/build.js`) forces Webpack over Turbopack for Windows compatibility

**Database:**
- PostgreSQL accessed via `pg` driver
- Connection pooling through custom `lib/db.ts` wrapper
- Schema includes tables for: users, events, ticket_tiers, bookings, notifications, email_verifications, otp_codes, password_resets, ticket_shares
- No ORM; raw SQL queries throughout

**Authentication & Security:**
- Custom JWT-like session tokens (HS256 HMAC signing in `lib/session.ts`)
- HttpOnly cookies for session storage (`auth_token`)
- Argon2id password hashing with bcrypt fallback for legacy passwords
- Email verification via OTP codes (stored in DB)
- Password reset tokens with hashed storage
- Rate limiting (in-memory store in `lib/rateLimit.ts`)
- CSRF protection via same-origin checks
- Security audit logging (`lib/audit.ts`)

**Password Policy:**
- Minimum 8 characters
- Requires uppercase, lowercase, digit, and symbol
- Strength validation helpers in `lib/passwordPolicy.ts`

**API Design:**
- RESTful endpoints under `/api/*`
- JSON request/response bodies
- Error responses with `{ error: string }` shape
- Success responses vary by endpoint (often `{ user, token }` or `{ events }`)

## Data Storage Solutions

**PostgreSQL Database:**
- Primary data store for all persistent data
- Connection via environment variable `DATABASE_URL`
- SSL support configurable (`DATABASE_SSL=disable` for local dev)
- Tables managed manually (no migrations framework visible in repo)

**File Storage (S3/R2):**
- Abstracted via `lib/storage.ts`
- Supports AWS S3 or Cloudflare R2 (configured via env vars)
- Handles image uploads for events, user avatars
- Pre-signed URLs for private content
- Public CDN URLs for event images

**LocalStorage (Client):**
- Favorites list (`tikezone_favorites`)
- Bookings cache (`tikezone_bookings`)
- Published events cache (`tikezone_published_events`)

**In-Memory Stores:**
- OTP codes (dev/demo fallback in `lib/otpStore.ts`)
- Rate limiting counters (`lib/rateLimit.ts`)

## External Dependencies

**Payment Gateways:**
- Mobile Money providers: Wave, Orange Money, MTN Mobile Money
- Credit card processing (implementation not detailed in codebase)
- No direct SDK integrations visible; likely custom API calls

**Email Service:**
- Not explicitly shown in codebase
- Email verification codes sent via `/api/auth/send-verification`
- Likely uses a third-party SMTP service or email API (e.g., SendGrid, Mailgun)

**WhatsApp Integration:**
- Ticket delivery option via WhatsApp
- Implementation not visible; likely via WhatsApp Business API or similar

**Cloud Storage:**
- AWS S3 SDK (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- Cloudflare R2 compatible (same S3 API)
- Environment variables: `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_BASE_URL`

**PDF Generation:**
- PDFKit for generating ticket PDFs (`lib/ticketPdf.ts`)
- Server-side generation for downloadable tickets

**QR Code:**
- `@zxing/browser` for QR code scanning/validation
- QR codes embedded in ticket PDFs and displayed on ticket cards

**Third-Party UI:**
- Lucide React for icons
- No component library (fully custom components)

**Development Tools:**
- TypeScript 5.8
- ESLint with Next.js config
- Autoprefixer & PostCSS for CSS processing
- Tailwind CSS 3.4

**Environment Variables:**
- `DATABASE_URL` (Postgres connection)
- `DATABASE_SSL` (SSL mode)
- `AUTH_SECRET` (JWT signing key)
- `R2_*` (storage credentials)
- `GEMINI_API_KEY` (mentioned in README but not used in visible code)
- `NEXT_PUBLIC_API_URL` (API base for client-side calls, defaults to empty for same-origin)
- `NEXT_PUBLIC_USE_MOCKS` (feature flag for mock data)