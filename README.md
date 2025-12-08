# Donaction

Platform for associations to receive and manage sponsorships/donations.

## Getting started

### Docker Setup

Get the network IP address of the PostgreSQL container:
```bash
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${PROJECT_SLUG}_postgres_v5
```
Replace `${PROJECT_SLUG}` by `donaction`

Then connect to PgAdmin, and register a new server, filling the hostname by the network IP address.

### Database import/export

Before pushing Strapi/API modifications, run these 2 commands to export database and Strapi conf:
```bash
docker exec -it donaction_backend /bin/bash -c "npm run export-db-archive"
docker exec -it donaction_backend /bin/bash -c "npm run export-db"
```

When pulling Strapi/API modifications, run this command:
```bash
docker exec -it donaction_backend /bin/bash -c "npm run import-db"
```
