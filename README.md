# PawMatch

Pet adoption platform with AI-powered matchmaking.

## Architecture

```text
Browser
   ↓
Next.js (:3000)
   ↓
Laravel (:8000)
   ↓
FastAPI (:8001)
   ↓
PostgreSQL
```

| Service  | Directory          | Port | Role                                |
| -------- | ------------------ | ---: | ----------------------------------- |
| Frontend | `nextjs-frontend/` | 3000 | UI, routing, SSR                    |
| API      | `api-backend/`     | 8000 | Authentication, CRUD, orchestration |
| Matching | `microservice/`    | 8001 | Cosine similarity, recommendations  |
| Database | PostgreSQL         | 5432 | Persistent application data         |

## Prerequisites

Make sure the following are installed:

* Node.js 20+
* PHP 8.3+
* Composer
* Python 3.12+
* PostgreSQL 16+

## Setup

### 1. Database

Create the PostgreSQL database:

```sql
CREATE DATABASE petadoption;
```

### 2. Frontend

```bash
cd nextjs-frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend will run at:

```text
http://localhost:3000
```

### 3. Backend

```bash
cd api-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

The Laravel API will run at:

```text
http://localhost:8000
```

### 4. Matching Microservice

Create and activate a Python virtual environment:

```bash
cd microservice
python -m venv .venv
```

#### Windows

```bash
.venv\Scripts\activate
```

#### macOS / Linux

```bash
source .venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
cp .env.example .env
```

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload --port 8001
```

The matching service will run at:

```text
http://localhost:8001
```

## Environment Variables

Each service contains its own `.env.example` file.

Copy the example file and configure the required environment variables:

```text
nextjs-frontend/.env.example → nextjs-frontend/.env.local
api-backend/.env.example → api-backend/.env
microservice/.env.example → microservice/.env
```

> **Important:** Never commit `.env` or `.env.local` files to the repository.

## Development Commands

| Command                                     | Description                          |
| ------------------------------------------- | ------------------------------------ |
| `npm run dev`                               | Start the Next.js development server |
| `php artisan serve`                         | Start the Laravel development server |
| `php artisan migrate`                       | Run Laravel database migrations      |
| `php artisan test`                          | Run Laravel tests                    |
| `uvicorn app.main:app --reload --port 8001` | Start the FastAPI development server |

## Tech Stack

### Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide

### Backend

* Laravel 11
* PHP 8.3+
* Laravel Sanctum

### Matching Service

* FastAPI
* Python 3.12+
* SQLAlchemy
* NumPy
* Cosine Similarity

### Database

* PostgreSQL 16+
* JSONB
* Full-text search

## Project Structure

```text
PawMatch/
├── api-backend/          # Laravel API
├── nextjs-frontend/      # Next.js frontend
├── microservice/         # FastAPI matching service
├── PLANNING.md           # Product and architecture notes
└── README.md             # Project documentation
```

## Service Responsibilities

### Next.js Frontend

Responsible for:

* User interface
* Client-side interactions
* Routing
* Server-side rendering
* Communicating with the Laravel API

### Laravel API

Responsible for:

* Authentication
* Authorization
* CRUD operations
* Business logic
* Database interaction
* Orchestrating requests to the matching service

### FastAPI Matching Service

Responsible for:

* Processing matching data
* Generating feature vectors
* Calculating cosine similarity
* Generating pet recommendations
* Returning matching results to the Laravel API

### PostgreSQL

Responsible for:

* User data
* Pet records
* Adoption information
* Matching-related data
* Application persistence

## Matching System

PawMatch uses a similarity-based matchmaking approach to recommend pets to potential adopters.

The matching service processes relevant adopter and pet attributes, represents them as numerical vectors, and calculates their similarity using **cosine similarity**.

The resulting similarity scores are used by the application to generate personalized pet recommendations.

## License

Private

## Initial Commit

```bash
git add .
git commit -m "chore: initial monorepo scaffold with README"
```
