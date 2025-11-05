# Auth.js Configuration

This project uses Auth.js (NextAuth.js v5) for authentication.

## Environment Variables

Add these to your `.env` file:

```env
# Auth.js
AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
AUTH_URL="http://localhost:3000"    # Your app URL

# Email Provider (for magic links)
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## Development Setup

1. **Generate AUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

2. **For GitHub OAuth**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID and Client Secret

3. **For Email (Dev Mode)**:
   - In development, magic links are logged to console
   - No email server needed for local development
   - In production, configure Resend or another email service

## Database Migration

After adding Auth.js tables to the schema, run:

```bash
npx prisma migrate dev --name add-auth-tables
```

Or push the schema:

```bash
npx prisma db push
```

## Usage

### Server Components

```typescript
import { getCurrentUser } from "@/lib/server/auth";

export default async function Page() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/signin");
  }
  
  return <div>Hello {user.name}</div>;
}
```

### Client Components

```typescript
"use client";
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Hello {session.user.name}</div>;
}
```

### Middleware Protection

All routes under `/app` are automatically protected by middleware. Unauthenticated users are redirected to `/signin`.

