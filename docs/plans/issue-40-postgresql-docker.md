# Technical Implementation Plan: Issue #40 - PostgreSQL Docker Configuration

## Overview

Add PostgreSQL container to staging and production VPS Docker Compose setups, migrating from external database to containerized database.

### Goals
1. Add `postgres` service to staging/production docker-compose.yml
2. Update environment templates for local database config
3. Modify deploy workflows to create data directories
4. Ensure API depends on postgres with healthcheck

### Key Design Decisions
- **External port 5532**: Avoids conflict with Klubr (5432)
- **Volume**: `./data/pgdata` for persistent storage
- **Image**: `postgres:16-alpine` (lightweight)
- **Healthcheck**: `pg_isready` for reliability

---

## Step-by-Step Implementation

### Step 1: Update Staging Docker Compose

**File:** `infrastructure/staging/docker-compose.yml`

Add postgres service before existing services:
```yaml
  postgres:
    image: postgres:16-alpine
    container_name: donaction_postgres
    restart: unless-stopped
    ports:
      - "5532:5432"
    env_file:
      - .env
    environment:
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    volumes:
      - ./data/pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME} -d ${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

Update api service:
```yaml
  api:
    depends_on:
      postgres:
        condition: service_healthy
```

---

### Step 2: Update Production Docker Compose

**File:** `infrastructure/production/docker-compose.yml`

Same changes as staging.

---

### Step 3: Update Staging Environment Template

**File:** `infrastructure/staging/env.template`

```
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_SSL=false
```

---

### Step 4: Update Production Environment Template

**File:** `infrastructure/production/env.template`

Same changes as staging.

---

### Step 5: Update Staging Deploy Workflow - Directory Creation

**File:** `.github/workflows/deploy-staging.yml`

In "Create deployment directory" step, add:
```bash
mkdir -p ~/donaction-staging/data/pgdata
mkdir -p ~/donaction-staging/data/private-pdf
```

---

### Step 6: Update GitHub Secrets (Manual)

**Location:** GitHub → Settings → Secrets → Environments (staging/production)

Update these secrets:
- `DATABASE_HOST` = `postgres`
- `DATABASE_PORT` = `5432`
- `DATABASE_SSL` = `false`

**Note:** Workflow files keep using `${{ secrets.* }}` for flexibility.

---

### Step 7: Update Staging Deploy Workflow - Port Check

**File:** `.github/workflows/deploy-staging.yml`

In "Check port availability" step:
```yaml
PORTS="3100 1537 4300 5100 5532"
```

---

### Step 8-9: Update Production Deploy Workflow

**File:** `.github/workflows/deploy-production.yml`

Same changes as staging:
- Add data directories (pgdata, private-pdf)
- Add port 5532 to availability check

Also update the deploy-staging job within production workflow.

---

## Validation Criteria

### Container Health
```bash
docker inspect --format='{{.State.Health.Status}}' donaction_postgres
# Expected: "healthy"
```

### API Connection
```bash
curl https://re7.donaction.fr/service/_health
```

### Data Persistence
```bash
ls -la ~/donaction-staging/data/pgdata/
```

### Port Check
```bash
netstat -tlnp | grep 5532
```

---

## Files Summary

| File | Changes |
|------|---------|
| `infrastructure/staging/docker-compose.yml` | Add postgres, update api depends_on |
| `infrastructure/production/docker-compose.yml` | Same as staging |
| `infrastructure/staging/env.template` | DATABASE_HOST=postgres, SSL=false |
| `infrastructure/production/env.template` | Same as staging |
| `.github/workflows/deploy-staging.yml` | Add data directories, port check |
| `.github/workflows/deploy-production.yml` | Same as staging |

## Manual Steps (Post-Merge)

Update GitHub Secrets in staging and production environments:
- `DATABASE_HOST` = `postgres`
- `DATABASE_PORT` = `5432`
- `DATABASE_SSL` = `false`
