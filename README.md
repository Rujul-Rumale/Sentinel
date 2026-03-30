# Sentinel India

Sentinel India is a geospatial OSINT portal focused on India and the surrounding region. It combines a Spring Boot API, a React + Leaflet frontend, MySQL-backed persistence, live and near-real-time external data feeds, and a bundled production build that can be deployed as a single service.

The app supports place search, bookmarks and history, weather and air-quality context, land-use and rainfall lookups, live flights and marine traffic, multiple satellite and specialty overlays, and a SQL-backed cache for third-party API responses.

## Highlights

- Place search using Bhuvan search APIs
- Weather, precipitation, wind, cloud, pressure, humidity, dew point, and snow overlays
- Air-quality lookup via OpenAQ
- Live flights over India via OpenSky
- Marine vessel snapshots sourced from AISStream
- NASA GIBS layers for MODIS, VIIRS, Himawari, aerosols, snow, SST, NO2, and soil moisture
- Basemap switching for OSM, ESRI imagery, topo, dark, and terrain styles
- Bookmarking and recent-search persistence in MySQL
- SQL-backed API cache with a 5-minute TTL
- Single-image deployment for Railway using Docker

## Stack

- Backend: Spring Boot 3, Spring Web, Spring Data JPA, WebSocket, Lombok
- Frontend: React 19, Vite 8, React Leaflet, Recharts, Axios
- Database: MySQL
- Deployment: Dockerfile-based Railway deploy

## Project Structure

```text
.
|-- src/main/java/com/bhuvaninsight
|   |-- config
|   |-- controller
|   |-- model
|   |-- repository
|   `-- service
|-- src/main/resources
|-- frontend
|   |-- src
|   |   |-- components
|   |   |-- hooks
|   |   `-- api.js
|   `-- package.json
|-- Dockerfile
|-- railway.toml
`-- pom.xml
```

## Core Endpoints

- `GET /api/health` - health check used by Railway
- `GET /api/search?q=...` - Bhuvan place search
- `GET /api/weather?lat=...&lon=...` - weather forecast proxy
- `GET /api/air?lat=...&lon=...` - air-quality lookup
- `GET /api/flights` - live flight state vectors
- `GET /api/vessels` - current AIS vessel snapshot
- `GET /api/lulc?district=...` - land-use statistics
- `GET /api/rainfall` - rainfall dataset proxy
- `GET /api/satellite?norad=...` - satellite position lookup
- `GET /api/train?no=...` - train status lookup
- `GET /api/locations` - saved bookmarks
- `GET /api/locations/history` - recent searches

## Environment Variables

This repository no longer stores working API keys in source. Configure secrets in your shell, IDE run configuration, or Railway variables.

You can use either direct MySQL fields or a full URL:

### Database

- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLDATABASE` or `MYSQL_DATABASE`
- `MYSQLUSER` or `MYSQL_USER`
- `MYSQLPASSWORD` or `MYSQL_PASSWORD`

Optional alternatives also supported by the backend:

- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `DB_URL`
- `DB_USER`
- `DB_PASS`

### External APIs

- `BHUVAN_TOKEN`
- `OPENAQ_KEY`
- `OPENSKY_USER`
- `OPENSKY_PASS`
- `N2YO_KEY`
- `AISSTREAM_KEY`
- `RAILAPI_KEY`
- `DATAGOVIN_KEY`
- `OWM_KEY`

See [`./.env.example`](./.env.example) for a reference template.

## Local Development

### Prerequisites

- Java 17+
- MySQL 8+
- Node.js 22+ if you want to run the frontend directly with Vite

### 1. Configure the database

Create a MySQL database and make its credentials available through environment variables.

Example values:

```bash
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLDATABASE=sentinel_india
MYSQLUSER=sentinel
MYSQLPASSWORD=sentinel123
```

### 2. Start the backend

```bash
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080` by default.

### 3. Start the frontend in dev mode

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` to the backend.

## Production Build

The Maven build installs Node/NPM, builds the React app, copies the frontend bundle into Spring static resources, and produces a single executable jar.

```bash
./mvnw clean package -DskipTests
java -jar target/sentinel-india-0.0.1-SNAPSHOT.jar
```

## Railway Deployment

This repo is set up for a single Railway service that serves both the API and the frontend.

### Required setup

1. Deploy from the repository root that contains `Dockerfile`, `pom.xml`, and `railway.toml`
2. Attach a MySQL service
3. Add the MySQL variables to the app service
4. Add any external API keys you want enabled
5. Redeploy

### Health check

Railway uses:

```text
/api/health
```

### Common Railway failure

If logs show:

```text
Unknown database 'sentinel_india'
```

then the app did not receive the real database name from Railway and fell back to the default. In that case, set `MYSQLDATABASE` or `MYSQL_DATABASE` on the service and redeploy.

## Caching

The backend stores third-party API responses in MySQL using the `api_cache` table. Cached entries use a global 5-minute TTL and fall back to stale data when a refresh fails.

## Notes

- Some features are unavailable until their corresponding API keys are configured
- Marine traffic depends on AISStream availability
- Weather overlays require an OpenWeather key for tile access
- Frontend production builds use same-origin API calls by default, which keeps single-service deploys simple

## Development Notes

- `./mvnw clean package -DskipTests` is the canonical production build
- `frontend/.env` is optional for local frontend-only customization
- `.env` files are ignored by Git; use `.env.example` as a template instead
