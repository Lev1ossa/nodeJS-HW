# nodejs-hw

## Setup

```bash
npm install
```

## PostgreSQL

```bash
sudo service postgresql start
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE nodejs_hw;"
```

## Migrations

```bash
npm run db:generate
npm run db:migrate
```

## Build

```bash
npm run build
```

## Run

```bash
npm run dev
```

Pizza Ordering Service runs separately:

```bash
npm run dev:ordering
```

After pulling workspace/dependency changes, run:

```bash
npm install
```

## Test

```bash
npm test
```
