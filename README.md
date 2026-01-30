# PhotoVault - Private Photo Sharing Platform

A premium, secure photo sharing platform built with Next.js 14, Supabase, and TypeScript.

## 🚀 Features

- **Secure Authentication** - JWT-based auth with invite-only signup
- **Private Photo Storage** - All photos stored securely in Supabase
- **Image Processing** - Automatic thumbnail generation with Sharp
- **Albums** - Create public or private albums with access codes
- **Admin Dashboard** - Manage users and invite codes
- **Premium UI** - Gold accent dark theme with smooth animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Auth**: JWT with HTTP-only cookies
- **Icons**: Lucide React

## 📦 Prerequisites

- Node.js 18+
- Supabase account
- Vercel account (for deployment)

## 🔧 Local Development

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd photo-vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials.

4. **Run database migrations**
   - Go to Supabase SQL Editor
   - Run `supabase/migrations/001_initial.sql`
   - Run `supabase/migrations/002_albums.sql`

5. **Create storage bucket**
   - Go to Supabase Storage
   - Create a bucket named `photos` (private)

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Initialize admin account**
   - Visit `http://localhost:3000/api/admin/init`
   - This creates the first admin account

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Required Environment Variables for Vercel

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `JWT_SECRET` | Strong random string (32+ chars) |
| `JWT_EXPIRES_IN` | Token expiry (e.g., `7d`) |

## 📁 Project Structure

```
photo-vault/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin dashboard
│   │   ├── albums/       # Albums pages
│   │   ├── gallery/      # Photo gallery
│   │   └── ...
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components
│   └── lib/              # Utilities & helpers
├── supabase/
│   └── migrations/       # SQL migrations
└── public/               # Static assets
```

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens in HTTP-only cookies
- Service role key never exposed to client
- Row Level Security in Supabase
- Invite-only registration

## 📝 License

MIT
