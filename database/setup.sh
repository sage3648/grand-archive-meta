#!/bin/bash

# Grand Archive Meta Database Setup Script
# This script helps set up the MongoDB database with indexes and sample data

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

print_error() {
    echo -e "${RED}✗ ${NC}$1"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Check if mongosh is installed
check_mongosh() {
    if ! command -v mongosh &> /dev/null; then
        print_error "mongosh is not installed"
        print_info "Please install MongoDB Shell: https://www.mongodb.com/docs/mongodb-shell/install/"
        exit 1
    fi
    print_success "mongosh is installed"
}

# Check if mongoimport is installed
check_mongoimport() {
    if ! command -v mongoimport &> /dev/null; then
        print_warning "mongoimport is not installed"
        print_info "Sample data import will be skipped"
        print_info "Install MongoDB Database Tools: https://www.mongodb.com/docs/database-tools/installation/installation/"
        return 1
    fi
    print_success "mongoimport is installed"
    return 0
}

# Check environment variables
check_env() {
    if [ -z "$MONGODB_URI" ]; then
        print_error "MONGODB_URI environment variable is not set"
        print_info "Please set it with: export MONGODB_URI='your-connection-string'"
        exit 1
    fi
    print_success "MONGODB_URI is set"
}

# Test database connection
test_connection() {
    print_info "Testing database connection..."
    if mongosh "$MONGODB_URI" --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_success "Database connection successful"
    else
        print_error "Failed to connect to database"
        print_info "Please check your MONGODB_URI and network connection"
        exit 1
    fi
}

# Create indexes
create_indexes() {
    print_info "Creating indexes..."
    if mongosh "$MONGODB_URI" < indexes.js > /dev/null 2>&1; then
        print_success "Indexes created successfully"
    else
        print_error "Failed to create indexes"
        exit 1
    fi
}

# Validate database
validate_database() {
    print_info "Running database validation..."
    if mongosh "$MONGODB_URI" < validate.js; then
        print_success "Database validation complete"
    else
        print_warning "Database validation completed with warnings"
    fi
}

# Import sample data
import_sample_data() {
    local has_mongoimport=$1

    if [ "$has_mongoimport" -eq 0 ]; then
        print_info "Importing sample data..."

        # Import champion
        if mongoimport --uri="$MONGODB_URI" \
            --collection=champions \
            --file=seed-data/sample_champion.json \
            --quiet > /dev/null 2>&1; then
            print_success "Imported sample champion"
        else
            print_warning "Failed to import sample champion (may already exist)"
        fi

        # Import event
        if mongoimport --uri="$MONGODB_URI" \
            --collection=events \
            --file=seed-data/sample_event.json \
            --quiet > /dev/null 2>&1; then
            print_success "Imported sample event"
        else
            print_warning "Failed to import sample event (may already exist)"
        fi

        # Import decklist
        if mongoimport --uri="$MONGODB_URI" \
            --collection=decklists \
            --file=seed-data/sample_decklist.json \
            --quiet > /dev/null 2>&1; then
            print_success "Imported sample decklist"
        else
            print_warning "Failed to import sample decklist (may already exist)"
        fi

        # Import standing
        if mongoimport --uri="$MONGODB_URI" \
            --collection=standings \
            --file=seed-data/sample_standing.json \
            --quiet > /dev/null 2>&1; then
            print_success "Imported sample standing"
        else
            print_warning "Failed to import sample standing (may already exist)"
        fi

        # Import card stats
        if mongoimport --uri="$MONGODB_URI" \
            --collection=card_performance_stats \
            --file=seed-data/sample_card_stats.json \
            --quiet > /dev/null 2>&1; then
            print_success "Imported sample card stats"
        else
            print_warning "Failed to import sample card stats (may already exist)"
        fi

        # Import crawler state
        if mongoimport --uri="$MONGODB_URI" \
            --collection=crawler_state \
            --file=seed-data/sample_crawler_state.json \
            --quiet > /dev/null 2>&1; then
            print_success "Imported sample crawler state"
        else
            print_warning "Failed to import sample crawler state (may already exist)"
        fi
    else
        print_warning "Skipping sample data import (mongoimport not available)"
    fi
}

# Show database info
show_info() {
    print_info "Retrieving database information..."
    mongosh "$MONGODB_URI" --quiet --eval "
        const dbStats = db.stats();
        print('Database: ' + dbStats.db);
        print('Collections: ' + dbStats.collections);
        print('Data Size: ' + (dbStats.dataSize / 1024 / 1024).toFixed(2) + ' MB');
        print('Storage Size: ' + (dbStats.storageSize / 1024 / 1024).toFixed(2) + ' MB');
        print('Index Size: ' + (dbStats.indexSize / 1024 / 1024).toFixed(2) + ' MB');
        print('');
        print('Collection Document Counts:');
        const collections = ['champions', 'events', 'standings', 'decklists', 'card_performance_stats', 'crawler_state'];
        collections.forEach(coll => {
            if (db.getCollectionNames().includes(coll)) {
                const count = db[coll].countDocuments();
                print('  ' + coll + ': ' + count);
            }
        });
    "
}

# Main script
main() {
    print_header "Grand Archive Meta Database Setup"

    # Change to script directory
    cd "$(dirname "$0")"

    # Pre-flight checks
    print_header "Pre-flight Checks"
    check_mongosh
    local has_mongoimport=1
    if check_mongoimport; then
        has_mongoimport=0
    fi
    check_env
    test_connection

    # Ask user what to do
    print_header "Setup Options"
    echo "What would you like to do?"
    echo "1) Full setup (indexes + sample data)"
    echo "2) Create indexes only"
    echo "3) Import sample data only"
    echo "4) Validate database"
    echo "5) Show database info"
    echo "6) Exit"
    echo ""
    read -p "Enter choice [1-6]: " choice

    case $choice in
        1)
            print_header "Full Setup"
            create_indexes
            import_sample_data $has_mongoimport
            validate_database
            show_info
            print_success "\nSetup complete!"
            ;;
        2)
            print_header "Creating Indexes"
            create_indexes
            print_success "\nIndexes created!"
            ;;
        3)
            print_header "Importing Sample Data"
            import_sample_data $has_mongoimport
            print_success "\nSample data imported!"
            ;;
        4)
            print_header "Database Validation"
            validate_database
            ;;
        5)
            print_header "Database Information"
            show_info
            ;;
        6)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac

    print_header "Next Steps"
    echo "• Review the schema documentation: schema.md"
    echo "• Check the quick reference guide: QUICK_REFERENCE.md"
    echo "• Read the database README: README.md"
    echo "• Run validation periodically: mongosh \"\$MONGODB_URI\" < validate.js"
    echo ""
}

# Run main function
main
