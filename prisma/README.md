# Prisma Migration Instructions

## Prerequisites

1. Ensure PostgreSQL is running and accessible
2. Set `DATABASE_URL` in your `.env` file:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/marketplace?schema=public"
   ```

## Run Migration

```bash
# Validate schema first
npx prisma validate

# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name init
```

This will:
- Create a migration file in `prisma/migrations/`
- Apply the migration to your database
- Generate Prisma Client

## Seed Database (Optional)

After migration, seed with sample data:

```bash
npm run db:seed
```

## View Data

Open Prisma Studio to view/edit data:

```bash
npm run db:studio
```
