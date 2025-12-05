-- Postgres schema for Tikezone demo + API hookup
-- Safe to run multiple times; uses IF NOT EXISTS where possible.

-- UUID support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (minimal, extend when auth is wired)
CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text UNIQUE,
  full_name       text,
  password_hash   text,
  role            text DEFAULT 'customer',
  avatar_url      text,
  email_verified  boolean NOT NULL DEFAULT false,
  last_login_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Organizer profile & settings
CREATE TABLE IF NOT EXISTS organizer_profiles (
  user_id      uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name text,
  bio          text,
  website      text,
  phone        text,
  logo_url     text,
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organizer_payout_settings (
  user_id     uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  wave        text,
  om          text,
  mtn         text,
  bank_name   text,
  iban        text,
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organizer_notification_settings (
  user_id     uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  sale_alert  boolean DEFAULT true,
  login_alert boolean DEFAULT true,
  updated_at  timestamptz DEFAULT now()
);

-- OTP codes (email-based login / reset)
CREATE TABLE IF NOT EXISTS otp_codes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  code        text NOT NULL,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_email_created ON otp_codes (email, created_at);

-- Password resets (token hashed)
CREATE TABLE IF NOT EXISTS password_resets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  token_hash  text NOT NULL,
  expires_at  timestamptz NOT NULL,
  used        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pwreset_email ON password_resets (email);

-- Email verifications (OTP)
CREATE TABLE IF NOT EXISTS email_verifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  code        text NOT NULL,
  expires_at  timestamptz NOT NULL,
  used        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verif_email ON email_verifications (email, created_at);

-- Ticket share history
-- Events
CREATE TABLE IF NOT EXISTS events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  description       text,
  category          text NOT NULL, -- aligns with CategoryId union
  date              timestamptz NOT NULL,
  location          text NOT NULL,
  price             integer NOT NULL DEFAULT 0, -- stored in smallest unit (e.g. XOF)
  image_url         text NOT NULL,
  video_url         text,
  organizer         text NOT NULL,
  slug              text UNIQUE,
  is_popular        boolean NOT NULL DEFAULT false,
  is_promo          boolean NOT NULL DEFAULT false,
  discount_percent  integer,
  is_trending       boolean NOT NULL DEFAULT false,
  visibility        text NOT NULL DEFAULT 'public',
  access_code       text,
  status            text NOT NULL DEFAULT 'published', -- published | draft | archived
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_category ON events (category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events (date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);

-- Ticket tiers per event
CREATE TABLE IF NOT EXISTS ticket_tiers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name         text NOT NULL,
  price        integer NOT NULL,
  quantity     integer NOT NULL,
  description  text,
  style        text, -- standard | vip | vvip | premium | etc.
  tag          text,
  promo_type   text, -- none | percentage | fixed_price
  promo_value  integer,
  promo_code   text,
  available    integer,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event ON ticket_tiers (event_id);

-- Bookings / tickets owned by users
CREATE TABLE IF NOT EXISTS bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  event_id        uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_tier_id  uuid REFERENCES ticket_tiers(id) ON DELETE SET NULL,
  quantity        integer NOT NULL DEFAULT 1,
  total_amount    integer NOT NULL,
  status          text NOT NULL DEFAULT 'pending', -- pending | paid | canceled | refunded
  buyer_name      text,
  buyer_email     text,
  buyer_phone     text,
  checked_in      boolean NOT NULL DEFAULT false,
  checked_in_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings (event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

-- Ticket share history (after bookings exists)
CREATE TABLE IF NOT EXISTS ticket_shares (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_email    text NOT NULL,
  message     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_shares_user ON ticket_shares (user_id, created_at);

-- Favorites (wishlist)
CREATE TABLE IF NOT EXISTS favorites (
  user_id   uuid REFERENCES users(id) ON DELETE CASCADE,
  event_id  uuid REFERENCES events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);

-- Simple notifications (optional)
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  body        text NOT NULL,
  type        text NOT NULL DEFAULT 'info',
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read);

-- Agents (scan/check-in) placeholder
CREATE TABLE IF NOT EXISTS agents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       text NOT NULL,
  code            text UNIQUE NOT NULL,
  organizer_email text NOT NULL,
  status          text NOT NULL DEFAULT 'active', -- active | blocked
  is_online       boolean NOT NULL DEFAULT false,
  last_active_at  timestamptz,
  scans           integer NOT NULL DEFAULT 0,
  all_events      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_event_access (
  agent_id  uuid REFERENCES agents(id) ON DELETE CASCADE,
  event_id  uuid REFERENCES events(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, event_id)
);

-- Organizer payouts
CREATE TABLE IF NOT EXISTS payouts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_email text NOT NULL,
  amount          integer NOT NULL,
  method          text NOT NULL, -- wave | om | bank
  destination     text NOT NULL,
  status          text NOT NULL DEFAULT 'pending', -- pending | approved | processing | paid | rejected
  note            text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Safe alters for existing databases
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in boolean NOT NULL DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS organizer_email text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS all_events boolean NOT NULL DEFAULT false;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS note text;

-- Super-admin flags + champs spécifiques plage (idempotent)
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_event_of_year boolean NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS spot text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS dj_lineup text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS dress_code text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS water_security text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS images text[] DEFAULT ARRAY[]::text[];
