#!/bin/sh

# Apply Prisma migrations and start the application
npx prisma generate
npx prisma migrate deploy

# Run the main container command
exec "$@"