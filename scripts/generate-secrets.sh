#!/bin/bash

# Joe Perks Platform - Secure Secret Generation Script
# This script generates cryptographically secure secrets for all environments
# Usage: ./scripts/generate-secrets.sh [environment]
# Environments: development, staging, production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to generate a secure random string
generate_secret() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to generate a UUID
generate_uuid() {
    if command -v uuidgen &> /dev/null; then
        uuidgen | tr '[:upper:]' '[:lower:]'
    else
        # Fallback if uuidgen is not available
        openssl rand -hex 16 | sed 's/\(..\)/\1-/g; s/.\{8\}-\(.\{4\}\)-\(.\{4\}\)-\(.\{4\}\)-/&/; s/-$//'
    fi
}

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    print_error "OpenSSL is required but not installed. Please install OpenSSL first."
    exit 1
fi

# Get environment parameter
ENVIRONMENT=${1:-development}

if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment. Use: development, staging, or production"
    exit 1
fi

print_header "Generating Secrets for $ENVIRONMENT Environment"

# Create directories if they don't exist
mkdir -p config/secrets/$ENVIRONMENT
mkdir -p config/keys/jwt
mkdir -p config/keys/encryption

# Generate secrets
print_status "Generating JWT secrets..."
JWT_SECRET=$(generate_secret 64)
REFRESH_TOKEN_SECRET=$(generate_secret 64)

print_status "Generating session secrets..."
COOKIE_SECRET=$(generate_secret 64)
SESSION_SECRET=$(generate_secret 64)

print_status "Generating application secrets..."
APP_SECRET=$(generate_secret 32)
WEBHOOK_SECRET=$(generate_secret 32)

print_status "Generating encryption keys..."
ENCRYPTION_KEY=$(generate_secret 32)

# Create the secrets file
SECRETS_FILE="config/secrets/$ENVIRONMENT/.env.$ENVIRONMENT"

print_status "Creating secrets file: $SECRETS_FILE"

cat > "$SECRETS_FILE" << EOF
# Generated secrets for $ENVIRONMENT environment
# Generated on: $(date)
# DO NOT COMMIT THIS FILE TO VERSION CONTROL

# JWT Configuration
JWT_SECRET=$JWT_SECRET
REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET

# Session Configuration
COOKIE_SECRET=$COOKIE_SECRET
SESSION_SECRET=$SESSION_SECRET

# Application Secrets
APP_SECRET=$APP_SECRET
WEBHOOK_SECRET=$WEBHOOK_SECRET

# Encryption
ENCRYPTION_KEY=$ENCRYPTION_KEY

# =============================================================================
# COPY THE ABOVE SECRETS TO YOUR MAIN ENVIRONMENT FILE
# Then add your service-specific secrets (Stripe, Stytch, etc.)
# =============================================================================
EOF

# Save individual key files
echo "$JWT_SECRET" > "config/keys/jwt/${ENVIRONMENT}_jwt.key"
echo "$REFRESH_TOKEN_SECRET" > "config/keys/jwt/${ENVIRONMENT}_refresh.key"
echo "$ENCRYPTION_KEY" > "config/keys/encryption/${ENVIRONMENT}_encryption.key"

print_status "Secrets generated successfully!"
print_warning "Next steps:"
echo "1. Copy the generated secrets from $SECRETS_FILE"
echo "2. Create your main environment file from the template:"
echo "   cp config/environments/.env.$ENVIRONMENT.example config/secrets/$ENVIRONMENT/.env.$ENVIRONMENT"
echo "3. Replace the placeholder secrets with the generated ones"
echo "4. Add your service-specific API keys (Stripe, Stytch, etc.)"
echo ""
print_warning "Security reminders:"
echo "- Never commit actual secrets to version control"
echo "- Use different secrets for each environment"
echo "- Rotate secrets regularly (quarterly recommended)"
echo "- Store production secrets in a secure password manager"

print_header "Secret Generation Complete"
