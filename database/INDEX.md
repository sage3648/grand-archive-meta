# Grand Archive Meta Database - Documentation Index

Complete guide to the Grand Archive Meta MongoDB database.

## 📚 Documentation Files

### Core Documentation
1. **[schema.md](./schema.md)** (54KB) - **START HERE**
   - Complete database schema documentation
   - All 8 collections with detailed field descriptions
   - Relationships and entity diagrams
   - Index strategies and rationale
   - Data validation rules
   - Security best practices
   - Backup and scaling strategies
   - Production deployment guide

2. **[README.md](./README.md)** (6.7KB)
   - Quick start guide
   - Setup instructions
   - Collections overview table
   - Maintenance tasks and schedules
   - Troubleshooting guide

3. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** (11KB)
   - Common queries and commands
   - Aggregation examples
   - Performance tips
   - Troubleshooting patterns
   - Handy code snippets

## 🔧 Scripts

### Setup & Management
1. **[setup.sh](./setup.sh)** (8KB) - **INTERACTIVE SETUP**
   - Interactive database setup wizard
   - Creates indexes
   - Imports sample data
   - Validates database
   - Shows database info
   - Usage: `./setup.sh`

2. **[indexes.js](./indexes.js)** (17KB)
   - Creates all 51 database indexes
   - Comprehensive index creation script
   - Usage: `mongosh "$MONGODB_URI" < indexes.js`

3. **[validate.js](./validate.js)** (10KB)
   - Validates database schema and integrity
   - Checks for orphaned documents
   - Verifies indexes exist
   - Shows usage statistics
   - Usage: `mongosh "$MONGODB_URI" < validate.js`

## 📦 Sample Data

Located in `seed-data/` directory:

1. **sample_champion.json** - Example champion (Silvie)
2. **sample_event.json** - Example regional tournament
3. **sample_decklist.json** - Example winning decklist
4. **sample_standing.json** - Example tournament standing
5. **sample_card_stats.json** - Example card performance stats
6. **sample_crawler_state.json** - Example crawler state

Import all with:
```bash
for file in seed-data/*.json; do
  collection=$(basename "$file" .json | sed 's/sample_//')
  mongoimport --uri="$MONGODB_URI" --collection="$collection" --file="$file"
done
```

## 🔄 Migrations

Located in `migrations/` directory:

1. **MIGRATION_TEMPLATE.js** - Template for creating new migrations
2. **2024-02-15-add-format-to-standings.js** - Example migration

Create new migrations using the template and name them: `YYYY-MM-DD-description.js`

## 📊 Database Schema Overview

### Collections (8 total)

| Collection | Documents | Purpose |
|------------|-----------|---------|
| **champions** | Variable | Champion/archetype master data |
| **events** | Variable | Tournament events |
| **standings** | High volume | Player standings per event |
| **decklists** | High volume | Tournament decklists |
| **card_performance_stats** | ~500+ | Aggregated card statistics |
| **crawler_state** | ~10 | Web crawler state tracking |
| **users** | Future | User accounts (not yet implemented) |
| **saved_decklists** | Future | User-saved decklists (not yet implemented) |

### Total Indexes: 51

- champions: 4 indexes
- events: 6 indexes
- standings: 6 indexes
- decklists: 8 indexes
- card_performance_stats: 8 indexes
- crawler_state: 4 indexes
- users: 7 indexes (future)
- saved_decklists: 8 indexes (future)

## 🚀 Quick Start Guide

### 1. First Time Setup

```bash
# Set environment variable
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/grand-archive-meta"

# Run interactive setup
cd database/
./setup.sh
```

### 2. Manual Setup

```bash
# Create indexes
mongosh "$MONGODB_URI" < indexes.js

# Import sample data
mongoimport --uri="$MONGODB_URI" --collection=champions --file=seed-data/sample_champion.json
mongoimport --uri="$MONGODB_URI" --collection=events --file=seed-data/sample_event.json
# ... etc

# Validate
mongosh "$MONGODB_URI" < validate.js
```

### 3. Development Workflow

```bash
# Make schema changes
# Update schema.md documentation

# Create migration if needed
cp migrations/MIGRATION_TEMPLATE.js migrations/2024-XX-XX-your-change.js
# Edit migration file

# Test on development database
export MONGODB_URI="mongodb://localhost/grand-archive-meta-dev"
mongosh "$MONGODB_URI" < migrations/2024-XX-XX-your-change.js

# Validate changes
mongosh "$MONGODB_URI" < validate.js

# Apply to production (with backup!)
mongodump --uri="$MONGODB_URI_PROD" --out=./backup/$(date +%Y-%m-%d)
export MONGODB_URI="$MONGODB_URI_PROD"
mongosh "$MONGODB_URI" < migrations/2024-XX-XX-your-change.js
```

## 📖 Reading Order for New Developers

1. **Start**: [README.md](./README.md) - Get oriented
2. **Learn**: [schema.md](./schema.md) - Understand the data model
3. **Practice**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Try common queries
4. **Setup**: Run `./setup.sh` - Set up your local database
5. **Explore**: Use sample data to test queries
6. **Build**: Reference docs as you develop

## 🔍 Common Tasks

### Find Information About...

- **A collection's structure** → schema.md → Find collection section
- **How to query something** → QUICK_REFERENCE.md → Common Queries
- **Database setup** → README.md → Quick Start
- **Performance issues** → QUICK_REFERENCE.md → Performance Analysis
- **Security settings** → schema.md → Security Best Practices
- **Backup procedures** → schema.md → Backup and Scaling
- **Creating migrations** → migrations/MIGRATION_TEMPLATE.js

### Need to...

- **Set up database** → Run `./setup.sh`
- **Create indexes** → Run `mongosh "$MONGODB_URI" < indexes.js`
- **Validate database** → Run `mongosh "$MONGODB_URI" < validate.js`
- **Import test data** → Use `mongoimport` with seed-data files
- **Check database health** → Run validate.js
- **Optimize a query** → QUICK_REFERENCE.md → Performance Analysis
- **Make schema changes** → Create migration using template

## 📈 File Sizes Reference

```
schema.md               54 KB  - Comprehensive documentation
indexes.js              17 KB  - All index definitions
QUICK_REFERENCE.md      11 KB  - Command reference
validate.js             10 KB  - Validation script
setup.sh                 8 KB  - Setup wizard
README.md                7 KB  - Overview and guide
sample_decklist.json     6 KB  - Largest sample file
```

## 🎯 Key Concepts

### Denormalization Strategy
We denormalize certain fields for performance:
- `championName` in standings/decklists (from champions)
- `placement` in decklists (from standings)
- Trade-off: Faster reads, but must update when source changes

### Index Strategy
- Unique indexes: Prevent duplicates (slugs, IDs)
- Compound indexes: Support multi-field queries (format + date)
- Multi-key indexes: Support array queries (card inclusions)
- Order matters: equality → sort → range

### Data Integrity
- Foreign keys enforced at application level
- Use validate.js to check for orphaned documents
- Regular validation recommended

### Performance
- All queries should use indexes
- Use `.explain()` to verify
- Monitor slow queries
- Consider archiving old data

## 🔐 Security Checklist

- [ ] Connection string in environment variable
- [ ] Strong database user password
- [ ] IP whitelist configured
- [ ] TLS/SSL enabled
- [ ] Different credentials per environment
- [ ] Audit logging enabled
- [ ] Regular password rotation
- [ ] Backup testing performed

## 🛠 Maintenance Schedule

### Daily
- Monitor slow queries
- Check crawler errors
- Verify backups

### Weekly
- Review index usage
- Check disk space
- Analyze query patterns

### Monthly
- Test backup restore
- Review access logs
- Optimize slow queries

### Quarterly
- Rotate passwords
- Archive old data
- Performance audit
- Security audit

## 📞 Support & Resources

### Documentation
- This directory contains all documentation
- Start with README.md for overview
- See schema.md for detailed specs

### External Resources
- [MongoDB Docs](https://docs.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Tools
- **mongosh** - MongoDB Shell
- **mongoimport/mongoexport** - Data import/export
- **mongodump/mongorestore** - Backup/restore
- **MongoDB Compass** - GUI for MongoDB

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-02-11 | Initial database documentation |

## 🗂 Directory Structure

```
database/
├── README.md                    # Overview and quick start
├── INDEX.md                     # This file
├── schema.md                    # Complete schema documentation
├── QUICK_REFERENCE.md           # Command reference guide
├── setup.sh                     # Interactive setup script
├── indexes.js                   # Index creation script
├── validate.js                  # Validation script
├── seed-data/                   # Sample data for testing
│   ├── sample_champion.json
│   ├── sample_event.json
│   ├── sample_decklist.json
│   ├── sample_standing.json
│   ├── sample_card_stats.json
│   └── sample_crawler_state.json
└── migrations/                  # Database migrations
    ├── MIGRATION_TEMPLATE.js
    └── 2024-02-15-add-format-to-standings.js
```

---

**Last Updated**: 2024-02-11
**Maintained By**: Grand Archive Meta Team
