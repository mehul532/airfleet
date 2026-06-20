# AirFleet Orchestrator

AirFleet Orchestrator is a full-stack demo for managing DIY air filtration units
(Corsi-Rosenthal boxes) across sites such as schools and public housing. It
tracks simulated PM2.5 readings, powers units on or off from threshold logic,
estimates filter saturation from cumulative particulate exposure, and surfaces
fleet-wide replacement alerts.

## Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Vite, Tailwind CSS
- Charts: Recharts

## Local Setup

Install dependencies:

```bash
npm run install:all
```

Start MongoDB locally, then copy the server environment file if needed:

```bash
cp server/.env.example server/.env
```

The default `server/.env` values are:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/airfleet
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SIMULATOR_ENABLED=true
SIMULATOR_INTERVAL_MS=10000
```

Run the app:

```bash
npm run dev
```

Open the client at `http://localhost:5173`. The API runs at
`http://localhost:4000/api`.

If MongoDB is not installed locally, run the API with an in-memory MongoDB
instance for demo/testing:

```bash
npm --prefix server run dev:memory
npm --prefix client run dev
```

Verify the API end to end against in-memory MongoDB:

```bash
npm --prefix server run verify:api
```

## Demo Data

On server start, the database is seeded if empty with:

- Lincoln High School in Sacramento, USA using the `wildfire_spike` profile
- Sunrise Public School in Delhi, India using the `chronic_high` profile

Each site starts with four filtration units.

## Core Rules

- PM2.5 threshold: `35` ug/m3
- Filter capacity: `5000`
- Particulate load rate: `pm25 * 0.1` per active simulator tick
- Power state flips only after three consecutive ticks agree, preventing
  flicker around the threshold
- Replacement alerts are created when cumulative particulate load exceeds
  capacity

## API Overview

- `GET /api/sites`
- `POST /api/sites`
- `GET /api/sites/:id`
- `PUT /api/sites/:id`
- `DELETE /api/sites/:id`
- `GET /api/units`
- `POST /api/units`
- `GET /api/units/:id`
- `PUT /api/units/:id`
- `DELETE /api/units/:id`
- `POST /api/units/:id/readings`
- `GET /api/units/:id/status`
- `POST /api/units/:id/reset-filter`
- `GET /api/alerts`
- `POST /api/simulator/fast-forward`

## Modeling Assumptions

The baseline CADR formula is deliberately simplified for the MVP:

```txt
fanCFM * 0.0283 * 0.7
```

It should be treated as a demo assumption, not a real engineering
specification for procurement or health-safety decisions.
