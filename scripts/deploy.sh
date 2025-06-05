#!/bin/bash
# Deployment script for SkillSwap

set -e

# Configuration
ENVIRONMENT="${1:-production}"
PROJECT_NAME="skillswap"

echo "Deploying SkillSwap to $ENVIRONMENT environment..."

# Check if environment file exists
ENV_FILE=".env.${ENVIRONMENT}"
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment file $ENV_FILE not found"
  echo "Please copy and configure from .env.prod.example"
  exit 1
fi

# Load environment variables
set -a
source "$ENV_FILE"
set +a

# Validate required variables
REQUIRED_VARS=("DB_PASSWORD" "JWT_SECRET" "SESSION_SECRET")
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: Required environment variable $var is not set"
    exit 1
  fi
done

echo "Environment variables validated"

# Create necessary directories
mkdir -p database/backup
mkdir -p backend/logs
mkdir -p frontend/logs

# Set proper permissions for scripts
chmod +x scripts/*.sh

# Pull latest code (if in git repository)
if [ -d ".git" ]; then
  echo "Pulling latest code..."
  git pull origin main
fi

# Build and start services
echo "Building and starting services..."
docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" down
docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" build --no-cache
docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 30

# Check service health
echo "Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Run database migrations/seeding if needed
if [ "$2" = "--seed" ]; then
  echo "Seeding database..."
  docker-compose -f docker-compose.prod.yml exec backend npm run db:seed-ts
fi

# Setup log rotation
echo "Setting up log rotation..."
sudo tee /etc/logrotate.d/skillswap > /dev/null <<EOF
$PWD/backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 nodeuser nodeuser
    postrotate
        docker-compose -f $PWD/docker-compose.prod.yml restart backend
    endscript
}

$PWD/frontend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 appuser appuser
    postrotate
        docker-compose -f $PWD/docker-compose.prod.yml restart frontend
    endscript
}
EOF

# Setup backup cron job
echo "Setting up backup cron job..."
CRON_JOB="0 2 * * * cd $PWD && docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE run --rm backup"
(crontab -l 2>/dev/null | grep -v "skillswap.*backup" ; echo "$CRON_JOB") | crontab -

echo "Deployment completed successfully!"
echo ""
echo "Services are running at:"
echo "Frontend: https://${FRONTEND_HOST:-skillswap.example.com}"
echo "API: https://api.${FRONTEND_HOST:-skillswap.example.com}"
echo "Traefik Dashboard: https://traefik.${FRONTEND_HOST:-skillswap.example.com}"
echo ""
echo "To check logs:"
echo "docker-compose -f docker-compose.prod.yml logs -f [service_name]"
echo ""
echo "To check status:"
echo "docker-compose -f docker-compose.prod.yml ps"