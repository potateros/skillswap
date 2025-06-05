#!/bin/bash
# Database backup script for SkillSwap

set -e

# Configuration
BACKUP_DIR="/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="skillswap_backup_${TIMESTAMP}.sql"
DB_NAME="${DB_NAME:-skill_exchange}"
DB_USER="${DB_USER:-skillswap_user}"
DB_HOST="${DB_HOST:-postgres}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST"
echo "Backup file: $BACKUP_FILE"

# Create backup
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
  --no-password \
  --verbose \
  --clean \
  --if-exists \
  --create \
  --format=plain \
  > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

echo "Backup completed: $COMPRESSED_FILE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "skillswap_backup_*.sql.gz" -mtime +7 -delete

echo "Old backups cleaned up (keeping last 7 days)"

# Optional: Upload to cloud storage
if [ ! -z "$AWS_S3_BUCKET" ]; then
  echo "Uploading backup to S3..."
  aws s3 cp "$BACKUP_DIR/$COMPRESSED_FILE" "s3://$AWS_S3_BUCKET/backups/"
  echo "Backup uploaded to S3"
fi

echo "Backup process completed successfully"