# TVS Sensing Solutions — Admin Panel & Supabase Setup Guide

This document explains how to set up, configure, and manage the Admin Panel for **Careers** and **Media** content on the TVS Sensing Solutions website.

---

## 1. Overview & Architecture

The existing TVS Sensing Solutions website design, theme, navbar, footer, typography, colors, animations, and layouts remain **100% unchanged**. 

Dynamic content management has been integrated using **Supabase**:
- **Admin Authentication**: Supabase Auth
- **PostgreSQL Database**: Tables for `jobs`, `media_posts`, and `media_images`
- **File Storage**: Supabase Storage buckets for media images, gallery pictures, and uploaded videos
- **Security & Authorization**: Row Level Security (RLS) policies protecting database and storage assets

---

## 2. Configuration & Environment Variables

Edit `assets/js/env-config.js` to insert your project credentials:

```javascript
window.TVSSS_ENV = {
  SUPABASE_URL: "https://<your-supabase-project-id>.supabase.co",
  SUPABASE_ANON_KEY: "<your-supabase-anon-key>"
};
```

> ⚠️ **SECURITY WARNING**: Never put your `SUPABASE_SERVICE_ROLE_KEY` in frontend code. Use only the `SUPABASE_ANON_KEY`.

---

## 3. Database Table Schema & RLS Setup

Run the SQL script located at `admin/schema.sql` inside the **Supabase SQL Editor** (Dashboard → SQL Editor → New Query → Run).

### Tables Created:
1. `jobs`: Stores career openings with title, department, location, experience, description, responsibilities, requirements, qualifications, positions count, closing date, and status (`Draft`, `Published`, `Closed`).
2. `media_posts`: Stores media news & exhibition posts with title, category, description, featured image URL, video URL, video type (`youtube`, `vimeo`, `upload`), publish date, and status (`Draft`, `Published`).
3. `media_images`: Stores multiple gallery images for each media post with foreign key reference and sort order.

### Row Level Security (RLS):
- **Public Users**: Read-only access to records with `status = 'Published'`.
- **Authenticated Admins**: Full CRUD (Create, Read, Update, Delete) permissions on all tables.

---

## 4. Storage Buckets Setup

1. In Supabase Dashboard, navigate to **Storage** → **Create a new bucket**.
2. Create two public buckets:
   - `tvsss-media` (Public)
   - `tvsss-jobs` (Public)
3. Set Storage Policies:
   - **SELECT**: Allow all users (Public read access for published media images & uploaded videos).
   - **INSERT / UPDATE / DELETE**: Restrict to authenticated users (`auth.role() = 'authenticated'`).

---

## 5. Initial Admin User Setup

Admin users cannot sign up publicly. Create the first administrator account directly in Supabase:

1. Open Supabase Dashboard → **Authentication** → **Users**.
2. Click **Add User** → **Create User**.
3. Enter Email (e.g. `admin@tvsss.co.in`) and Password.
4. Check **Auto Confirm User**.
5. Save the user.

Now you can log in at:
`http://<your-domain>/admin/login` or `http://localhost:3000/admin/login.html`

---

## 6. Admin Panel Routes

- `/admin/login.html` — Admin Authentication Page (Email, Password, Forgot Password, Spinner, Validation)
- `/admin/dashboard.html` — Internal Admin Overview with 7 metric cards & recent items tables
- `/admin/careers/index.html` — Career openings management table (Search, Status Filter, Sort, Quick Status Toggle, Delete)
- `/admin/careers/new.html` — Add new job opening form (Mandatory title validation, auto slug generator, Draft/Publish)
- `/admin/careers/edit.html` — Edit job opening form (Update details, Publish, Unpublish, Close, Delete)
- `/admin/media/index.html` — Media posts management table (Search, Category Filter, Status Toggle, Delete)
- `/admin/media/new.html` — Add media post form (Format selection: Image/Video/Both, Featured image upload, Gallery images upload, YouTube/Vimeo/Direct video)
- `/admin/media/edit.html` — Edit media post form (Update text, replace featured image, manage gallery, video, Delete)
- `/admin/media-library/index.html` — Storage asset browser & direct file uploader
- `/admin/settings/index.html` — Admin account details, password change form, connection status monitor

---

## 7. Public Dynamic Content Integration

- **Careers Page** (`/careers/index.html`):
  - Fetches ONLY `status = 'Published'` jobs.
  - Automatically updates when an admin publishes or closes/unpublishes a job.
  - Displays professional empty state `"No current openings available."` when no active published jobs exist.
  - Retains all TVS Sensing Solutions hero banners, pillars, application form, and HR sidebar contact cards.

- **Media Page** (`/media/index.html`):
  - Fetches ONLY `status = 'Published'` media posts.
  - Renders latest story into featured exhibition showcase card and subsequent stories into editorial grid.
  - Detail view link opens `/media/detail.html?slug=<slug>` showing full description, video player, and image gallery.

---

## 8. Verification Checklist

✓ Admin login works with credentials & blocks unauthorized URL access.  
✓ Creating draft job does NOT show on public `/careers`.  
✓ Publishing job automatically displays it on public `/careers`.  
✓ Unpublishing or Closing job removes it from active openings on `/careers`.  
✓ Creating media post with featured image, gallery pictures & YouTube/Vimeo URL renders cleanly on `/media` and `/media/detail.html`.  
✓ Deleting items displays confirmation modal and cleans up storage.  
✓ Public website design, colors, navbar, and footer remain completely intact.  
