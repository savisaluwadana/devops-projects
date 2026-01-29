# 🐘 PostgreSQL Database Administration

Learn PostgreSQL database management for DevOps.

## 🎯 Learning Objectives
- Install and configure PostgreSQL
- Manage users and permissions
- Backup and restore databases
- Monitor performance
- Set up replication

---

## Lab 1: Installation & Setup

### Docker Setup
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=secretpassword \
  -e POSTGRES_DB=myapp \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15

# Connect
docker exec -it postgres psql -U postgres
```

### Basic Commands
```sql
-- Database management
CREATE DATABASE myapp;
DROP DATABASE myapp;
\l                    -- List databases
\c myapp              -- Connect to database

-- Table management
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

\dt                   -- List tables
\d users              -- Describe table
```

---

## Lab 2: User Management

### Create Users
```sql
-- Create user
CREATE USER appuser WITH PASSWORD 'password123';

-- Create role
CREATE ROLE readonly;
GRANT CONNECT ON DATABASE myapp TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;

-- Assign role
GRANT readonly TO appuser;

-- Superuser
CREATE USER admin WITH SUPERUSER PASSWORD 'adminpass';
```

### Permissions
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE myapp TO appuser;
GRANT SELECT, INSERT, UPDATE ON users TO appuser;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO appuser;

-- Revoke
REVOKE DELETE ON users FROM appuser;

-- View grants
\du                   -- List users
\dp                   -- List permissions
```

---

## Lab 3: Backup & Restore

### Backup
```bash
# Single database
pg_dump -U postgres -d myapp > backup.sql
pg_dump -U postgres -d myapp -F c > backup.dump

# All databases
pg_dumpall -U postgres > all_databases.sql

# Specific tables
pg_dump -U postgres -d myapp -t users > users_backup.sql

# With compression
pg_dump -U postgres -d myapp | gzip > backup.sql.gz
```

### Restore
```bash
# From SQL file
psql -U postgres -d myapp < backup.sql

# From custom format
pg_restore -U postgres -d myapp backup.dump

# Create fresh database
createdb -U postgres myapp_restored
pg_restore -U postgres -d myapp_restored backup.dump
```

### Automated Backup Script
```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="myapp"

pg_dump -U postgres -d $DB_NAME -F c > "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

# Keep only last 7 days
find $BACKUP_DIR -name "*.dump" -mtime +7 -delete
```

---

## Lab 4: Performance & Monitoring

### Useful Queries
```sql
-- Active connections
SELECT * FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size('myapp'));

-- Table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::text))
FROM pg_tables WHERE schemaname = 'public';

-- Slow queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;

-- Index usage
SELECT indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes;
```

### Configuration Tuning
```ini
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 768MB
work_mem = 16MB
maintenance_work_mem = 128MB
max_connections = 100
```

---

## ✅ Completion Checklist
- [ ] Installed PostgreSQL
- [ ] Created databases and tables
- [ ] Configured users and permissions
- [ ] Performed backup and restore
- [ ] Monitored performance
