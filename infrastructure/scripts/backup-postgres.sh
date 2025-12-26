#!/bin/bash
# PostgreSQL Backup Script for Donaction
# Usage: ./backup-postgres.sh [backup_dir]
#
# Creates timestamped backups and cleans up backups older than 7 days

set -e

BACKUP_DIR="${1:-./backups/postgres}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/donaction-backup-$TIMESTAMP.sql.gz"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "Starting PostgreSQL backup..."
echo "Backup file: $BACKUP_FILE"

# Create backup using pg_dump from the postgres container
# Uses container's internal POSTGRES_USER and POSTGRES_DB env vars
docker exec donaction_postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  | gzip > "$BACKUP_FILE"

# Verify backup was created
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
  echo "Backup created successfully: $(ls -lh "$BACKUP_FILE" | awk '{print $5}')"
else
  echo "ERROR: Backup file is empty or was not created"
  exit 1
fi

# Clean up old backups (older than 7 days)
echo "Cleaning up backups older than 7 days..."
find "$BACKUP_DIR" -name "donaction-backup-*.sql.gz" -mtime +7 -delete

# List remaining backups
echo "Current backups:"
ls -lh "$BACKUP_DIR"/donaction-backup-*.sql.gz 2>/dev/null || echo "No backups found"

echo "Backup complete!"
