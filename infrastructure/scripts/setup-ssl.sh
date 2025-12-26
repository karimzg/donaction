#!/bin/bash
#
# SSL Certificate Setup Script for Donaction Platform
# Usage: sudo ./setup-ssl.sh [staging|production] [--dry-run]
#
# This script:
# 1. Installs Certbot with nginx plugin
# 2. Creates webroot directory for ACME challenges
# 3. Generates Let's Encrypt certificates
# 4. Configures automatic renewal via cron
# 5. Tests renewal with dry-run
#

set -euo pipefail

# Configuration (can be overridden via environment variables)
WEBROOT_PATH="${CERTBOT_WEBROOT:-/var/www/certbot}"
EMAIL="${CERTBOT_EMAIL:-hello@donaction.fr}"
LOG_FILE="${CERTBOT_LOG:-/var/log/certbot-setup.log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || LOG_FILE="/tmp/certbot-setup.log"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE" >&2
}

usage() {
    echo "Usage: sudo $0 [staging|production] [--dry-run]"
    echo ""
    echo "Arguments:"
    echo "  staging     Generate certificate for re7.donaction.fr"
    echo "  production  Generate certificates for donaction.fr and www.donaction.fr"
    echo ""
    echo "Options:"
    echo "  --dry-run   Test the process without actually generating certificates"
    echo ""
    echo "Examples:"
    echo "  sudo $0 staging"
    echo "  sudo $0 production"
    echo "  sudo $0 staging --dry-run"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Parse arguments
parse_args() {
    ENVIRONMENT=""
    DRY_RUN=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            staging|production)
                ENVIRONMENT="$1"
                shift
                ;;
            --dry-run)
                DRY_RUN="--dry-run"
                shift
                ;;
            -h|--help)
                usage
                ;;
            *)
                error "Unknown argument: $1"
                usage
                ;;
        esac
    done

    if [[ -z "$ENVIRONMENT" ]]; then
        error "Environment argument required"
        usage
    fi
}

# Install Certbot (idempotent - skips if already installed)
install_certbot() {
    if command -v certbot &> /dev/null; then
        log "Certbot already installed: $(certbot --version)"
        return 0
    fi

    log "Installing Certbot and nginx plugin..."
    apt-get update -qq
    apt-get install -y certbot python3-certbot-nginx
    log "Certbot installed: $(certbot --version)"
}

# Create webroot directory
create_webroot() {
    log "Creating webroot directory at $WEBROOT_PATH..."

    mkdir -p "$WEBROOT_PATH"
    chown -R www-data:www-data "$WEBROOT_PATH"
    chmod 755 "$WEBROOT_PATH"

    log "Webroot directory created"
}

# Generate certificates
generate_certificates() {
    local domains=""
    local cert_name=""

    if [[ "$ENVIRONMENT" == "staging" ]]; then
        domains="-d re7.donaction.fr"
        cert_name="re7.donaction.fr"
    else
        domains="-d donaction.fr -d www.donaction.fr"
        cert_name="www.donaction.fr"
    fi

    log "Generating certificates for: $domains"

    # Check if certificate already exists
    if [[ -d "/etc/letsencrypt/live/$cert_name" ]] && [[ -z "$DRY_RUN" ]]; then
        warn "Certificate already exists at /etc/letsencrypt/live/$cert_name"
        # Check if running interactively
        if [[ -t 0 ]]; then
            read -p "Do you want to renew/expand it? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log "Skipping certificate generation"
                return 0
            fi
        else
            log "Non-interactive mode: skipping existing certificate"
            return 0
        fi
    fi

    # Run certbot directly (avoiding eval for security)
    log "Running certbot..."
    local certbot_args=(certonly --webroot -w "$WEBROOT_PATH" --email "$EMAIL" --agree-tos --non-interactive)

    # Add domains
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        certbot_args+=(-d re7.donaction.fr)
    else
        certbot_args+=(-d donaction.fr -d www.donaction.fr)
    fi

    # Add dry-run flag if needed
    if [[ -n "$DRY_RUN" ]]; then
        certbot_args+=(--dry-run)
        log "Running in dry-run mode..."
    fi

    # Execute certbot
    if certbot "${certbot_args[@]}"; then
        log "Certificate generation successful"
    else
        error "Certificate generation failed"
        exit 1
    fi
}

# Setup auto-renewal cron
setup_cron() {
    local cron_file="/etc/cron.d/certbot-renew"
    local cron_job="0 0,12 * * * root certbot renew --quiet --post-hook \"systemctl reload nginx\" >> /var/log/certbot-renew.log 2>&1"

    if [[ -n "$DRY_RUN" ]]; then
        log "Dry-run: Would create cron job at $cron_file"
        log "Dry-run: $cron_job"
        return 0
    fi

    log "Setting up auto-renewal cron job..."

    cat > "$cron_file" << EOF
# Certbot auto-renewal for Donaction
# Runs twice daily as recommended by Let's Encrypt
# Managed by setup-ssl.sh - do not edit manually
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

$cron_job
EOF

    chmod 644 "$cron_file"
    log "Cron job created at $cron_file"
}

# Test renewal (skip if already in dry-run mode to avoid redundancy)
test_renewal() {
    if [[ -n "$DRY_RUN" ]]; then
        log "Skipping renewal test (already in dry-run mode)"
        return 0
    fi

    log "Testing certificate renewal with dry-run..."
    if certbot renew --dry-run; then
        log "Renewal test passed"
    else
        warn "Renewal test failed - check configuration"
    fi
}

# Reload nginx
reload_nginx() {
    if [[ -n "$DRY_RUN" ]]; then
        log "Dry-run: Would reload nginx"
        return 0
    fi

    log "Testing nginx configuration..."
    if nginx -t; then
        log "Nginx configuration valid"
        systemctl reload nginx
        log "Nginx reloaded"
    else
        error "Nginx configuration test failed"
        exit 1
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "========================================"
    log "SSL Setup Complete!"
    echo "========================================"
    echo ""

    if [[ "$ENVIRONMENT" == "staging" ]]; then
        echo "Certificate location: /etc/letsencrypt/live/re7.donaction.fr/"
        echo "Domain: re7.donaction.fr"
    else
        echo "Certificate location: /etc/letsencrypt/live/www.donaction.fr/"
        echo "Domains: donaction.fr, www.donaction.fr"
    fi

    echo ""
    echo "Webroot: $WEBROOT_PATH"
    echo "Auto-renewal: Enabled (cron twice daily)"
    echo "Log file: $LOG_FILE"
    echo ""
    echo "Manual renewal command:"
    echo "  sudo certbot renew"
    echo ""
    echo "Force renewal command:"
    echo "  sudo certbot renew --force-renewal"
    echo ""
    echo "Check certificate expiry:"
    echo "  sudo certbot certificates"
    echo ""
}

# Check nginx is installed
check_nginx() {
    if ! command -v nginx &> /dev/null; then
        error "Nginx not installed. Please install nginx first."
        exit 1
    fi
    log "Nginx found: $(nginx -v 2>&1)"
}

# Main
main() {
    check_root
    parse_args "$@"

    log "Starting SSL setup for $ENVIRONMENT environment"

    if [[ -n "$DRY_RUN" ]]; then
        warn "Running in DRY-RUN mode - no changes will be made"
    fi

    check_nginx
    install_certbot
    create_webroot
    generate_certificates
    setup_cron
    test_renewal
    reload_nginx
    print_summary
}

main "$@"
