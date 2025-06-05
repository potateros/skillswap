#!/bin/bash
# Database restore script for SkillSwap

set -e

# Configuration
BACKUP_DIR="/backup"
DB_NAME="${DB_NAME:-skill_exchange}"
DB_USER="${DB_USER:-skillswap_user}"
DB_HOST="${DB_HOST:-postgres}"

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Available backups:"
  ls -la "$BACKUP_DIR"/skillswap_backup_*.sql.gz 2>/dev/null || echo "No backups found"
  exit 1
fi

BACKUP_FILE="$1"
FULL_PATH="$BACKUP_DIR/$BACKUP_FILE"

# Check if backup file exists
if [ ! -f "$FULL_PATH" ]; then
  echo "Error: Backup file not found: $FULL_PATH"
  exit 1
fi

echo "Starting database restore..."
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST"
echo "Backup file: $BACKUP_FILE"

# Warning
echo "WARNING: This will completely replace the current database!"
echo "Press Enter to continue or Ctrl+C to cancel..."
read -r

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Decompressing backup file..."
  TEMP_FILE=$(mktemp)
  gunzip -c "$FULL_PATH" > "$TEMP_FILE"
  SQL_FILE="$TEMP_FILE"
else
  SQL_FILE="$FULL_PATH"
fi

# Restore database
echo "Restoring database..."
psql -h "$DB_HOST" -U "$DB_USER" -d postgres \
  --no-password \
  --verbose \
  < "$SQL_FILE"

# Cleanup temporary file
if [ ! -z "$TEMP_FILE" ]; then
  rm -f "$TEMP_FILE"
fi

echo "Database restore completed successfully"