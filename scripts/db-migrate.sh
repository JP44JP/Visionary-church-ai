#!/bin/bash

# =============================================================================
# Database Migration Script for VisionaryChurch-AI
# Handles multi-tenant database migrations and seeding
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Default values
ENVIRONMENT="${ENVIRONMENT:-development}"
DATABASE_URL="${DATABASE_URL:-}"
DRY_RUN="${DRY_RUN:-false}"
ROLLBACK="${ROLLBACK:-false}"
SEED_DATA="${SEED_DATA:-false}"
BACKUP_BEFORE="${BACKUP_BEFORE:-true}"
TENANT_ID="${TENANT_ID:-}"

# Function to print colored output
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

usage() {
    cat << EOF
Usage: $0 [OPTIONS] COMMAND

Database migration management for VisionaryChurch-AI

COMMANDS:
    migrate         Run all pending migrations
    rollback        Rollback last migration
    seed            Seed database with initial data
    reset           Reset database (DROP and recreate)
    status          Show migration status
    create          Create new migration
    tenant-setup    Set up new tenant schema

OPTIONS:
    -e, --environment    Environment (development|staging|production)
    -d, --database-url   Database connection URL
    -t, --tenant-id      Specific tenant ID for tenant operations
    -s, --seed          Also seed data after migration
    -n, --dry-run       Show what would be done without executing
    -b, --no-backup     Skip backup before migration (not recommended)
    -h, --help          Show this help message

EXAMPLES:
    $0 migrate --environment production --seed
    $0 tenant-setup --tenant-id church-demo-001
    $0 rollback --dry-run
    $0 status --environment staging

EOF
}

# Parse command line arguments
COMMAND=""
while [[ $# -gt 0 ]]; do
    case $1 in
        migrate|rollback|seed|reset|status|create|tenant-setup)
            COMMAND="$1"
            shift
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--database-url)
            DATABASE_URL="$2"
            shift 2
            ;;
        -t|--tenant-id)
            TENANT_ID="$2"
            shift 2
            ;;
        -s|--seed)
            SEED_DATA="true"
            shift
            ;;
        -n|--dry-run)
            DRY_RUN="true"
            shift
            ;;
        -b|--no-backup)
            BACKUP_BEFORE="false"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

if [[ -z "$COMMAND" ]]; then
    print_error "Command is required"
    usage
    exit 1
fi

# Load environment variables
if [[ -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]]; then
    source "$PROJECT_ROOT/.env.$ENVIRONMENT"
elif [[ -f "$PROJECT_ROOT/.env" ]]; then
    source "$PROJECT_ROOT/.env"
fi

# Use provided DATABASE_URL or fall back to environment variable
DATABASE_URL="${DATABASE_URL:-$DATABASE_URL}"

if [[ -z "$DATABASE_URL" ]]; then
    print_error "DATABASE_URL is required"
    exit 1
fi

print_status "Environment: $ENVIRONMENT"
print_status "Command: $COMMAND"

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if required tools are installed
    for tool in psql pg_dump; do
        if ! command -v $tool &> /dev/null; then
            print_error "$tool is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check database connection
    if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        print_error "Cannot connect to database"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to create database backup
create_backup() {
    if [[ "$BACKUP_BEFORE" == "false" ]] || [[ "$DRY_RUN" == "true" ]]; then
        return
    fi
    
    print_status "Creating database backup..."
    
    local backup_file="/tmp/church_db_backup_${TIMESTAMP}.sql"
    pg_dump "$DATABASE_URL" > "$backup_file"
    
    print_success "Database backup created: $backup_file"
}

# Function to run migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "DRY RUN: Would run migrations"
        npx prisma migrate diff --preview-feature
        return
    fi
    
    # Run Prisma migrations
    npx prisma migrate deploy
    
    # Generate Prisma client
    npx prisma generate
    
    print_success "Migrations completed"
}

# Function to rollback migrations
rollback_migrations() {
    print_warning "Rolling back migrations..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "DRY RUN: Would rollback migrations"
        return
    fi
    
    # Note: Prisma doesn't have built-in rollback, so we use backup
    print_error "Automatic rollback not supported with Prisma"
    print_status "Please restore from backup manually if needed"
    exit 1
}

# Function to seed database
seed_database() {
    print_status "Seeding database with initial data..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "DRY RUN: Would seed database"
        return
    fi
    
    # Run seed script
    if [[ -f "src/scripts/seed.ts" ]]; then
        npx tsx src/scripts/seed.ts
    else
        print_warning "Seed script not found"
    fi
    
    print_success "Database seeding completed"
}

# Function to reset database
reset_database() {
    print_warning "Resetting database (this will DELETE ALL DATA)..."
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        print_error "Cannot reset production database"
        exit 1
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "DRY RUN: Would reset database"
        return
    fi
    
    read -p "Are you sure you want to reset the database? (yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        print_status "Database reset cancelled"
        exit 0
    fi
    
    cd "$PROJECT_ROOT"
    
    # Reset database
    npx prisma migrate reset --force
    
    print_success "Database reset completed"
}

# Function to show migration status
show_status() {
    print_status "Showing migration status..."
    
    cd "$PROJECT_ROOT"
    
    # Show Prisma migration status
    npx prisma migrate status
    
    # Show database schema info
    psql "$DATABASE_URL" -c "
        SELECT 
            schemaname,
            tablename,
            tableowner
        FROM pg_tables 
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
        ORDER BY schemaname, tablename;
    "
    
    print_success "Status check completed"
}

# Function to create new migration
create_migration() {
    print_status "Creating new migration..."
    
    read -p "Enter migration name: " migration_name
    
    if [[ -z "$migration_name" ]]; then
        print_error "Migration name is required"
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "DRY RUN: Would create migration: $migration_name"
        return
    fi
    
    # Create migration
    npx prisma migrate dev --name "$migration_name"
    
    print_success "Migration created: $migration_name"
}

# Function to set up tenant schema
setup_tenant() {
    if [[ -z "$TENANT_ID" ]]; then
        print_error "Tenant ID is required for tenant setup"
        exit 1
    fi
    
    print_status "Setting up tenant schema for: $TENANT_ID..."
    
    local schema_name="tenant_${TENANT_ID//-/_}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "DRY RUN: Would create schema: $schema_name"
        return
    fi
    
    # Create tenant-specific schema
    psql "$DATABASE_URL" << EOF
-- Create tenant schema
CREATE SCHEMA IF NOT EXISTS $schema_name;

-- Set search path to include new schema
SET search_path TO $schema_name, public;

-- Create tenant-specific tables
-- Members table
CREATE TABLE IF NOT EXISTS $schema_name.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,
    address JSONB,
    membership_status VARCHAR(20) DEFAULT 'active',
    tags TEXT[],
    custom_fields JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS $schema_name.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    location VARCHAR(255),
    max_attendees INTEGER,
    registration_required BOOLEAN DEFAULT FALSE,
    registration_deadline TIMESTAMP,
    tags TEXT[],
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prayer requests table
CREATE TABLE IF NOT EXISTS $schema_name.prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'active',
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    requester_id UUID,
    requester_name VARCHAR(200),
    requester_email VARCHAR(255),
    assigned_to UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_email ON $schema_name.members(email);
CREATE INDEX IF NOT EXISTS idx_members_membership_status ON $schema_name.members(membership_status);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON $schema_name.events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON $schema_name.prayer_requests(status);

-- Grant permissions (adjust as needed)
GRANT USAGE ON SCHEMA $schema_name TO church_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA $schema_name TO church_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA $schema_name TO church_app;

-- Insert tenant record in shared.tenants table
INSERT INTO shared.tenants (id, name, schema_name, subdomain, status, settings, created_at)
VALUES (
    '$TENANT_ID',
    'Church Demo',
    '$schema_name',
    '${TENANT_ID}',
    'active',
    '{}',
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

COMMIT;
EOF
    
    print_success "Tenant schema setup completed for: $TENANT_ID"
}

# Main function
main() {
    print_status "=== Database Migration Tool ==="
    
    check_prerequisites
    
    case "$COMMAND" in
        migrate)
            create_backup
            run_migrations
            if [[ "$SEED_DATA" == "true" ]]; then
                seed_database
            fi
            ;;
        rollback)
            create_backup
            rollback_migrations
            ;;
        seed)
            seed_database
            ;;
        reset)
            create_backup
            reset_database
            ;;
        status)
            show_status
            ;;
        create)
            create_migration
            ;;
        tenant-setup)
            setup_tenant
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            usage
            exit 1
            ;;
    esac
    
    print_success "=== Migration Tool Completed ==="
}

# Run main function
main "$@"