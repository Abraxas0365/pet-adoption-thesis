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
PostgreSQL (:5432)
```

| Service  | Directory          | Port | Role                                |
| -------- | ------------------ | ---: | ----------------------------------- |
| Frontend | `nextjs-frontend/` | 3000 | UI, routing, SSR                    |
| API      | `api-backend/`     | 8000 | Authentication, CRUD, orchestration |
| Matching | `microservice/`    | 8001 | Cosine similarity, recommendations  |
| Database | PostgreSQL         | 5432 | Persistent application data         |

## Prerequisites

Make sure the following are installed before setting up PawMatch:

* Node.js 20+
* PHP 8.3+
* Composer
* Python 3.12+
* PostgreSQL 16+
* Git

> **Windows:** The project is designed for Windows development and provides `setup.bat` for automated setup.

---

# Setup

There are two ways to set up PawMatch:

1. **Automated Setup — Recommended**
2. **Manual Setup — For developers who want to configure each service individually**

## Automated Setup

The recommended setup method is `setup.bat`. It automatically installs the required dependencies and prepares each application service.

### 1. Clone the Repository

Clone the repository or your fork:

```bash
git clone <repository-url>
cd pet-adoption-thesis
```

### 2. Create the PostgreSQL Database

Make sure PostgreSQL is running, then create the database:

```sql
CREATE DATABASE petadoption;
```

### 3. Run the Setup Script

From the `pet-adoption-thesis` root directory:

```bat
setup.bat
```

The script automatically:

* Installs root Node.js dependencies
* Installs Next.js dependencies
* Creates `nextjs-frontend/.env.local`
* Installs Laravel Composer dependencies
* Creates `api-backend/.env`
* Generates the Laravel application key
* Creates the Python virtual environment
* Installs Python dependencies
* Creates `microservice/.env`

### 4. Configure Environment Variables

After `setup.bat` finishes, review the generated environment files:

```text
nextjs-frontend/.env.local
api-backend/.env
microservice/.env
```

Configure the required values, especially the PostgreSQL connection settings in:

```text
api-backend/.env
```

> **Important:** Never commit `.env` or `.env.local` files to the repository.

### 5. Run Database Migrations

Once the Laravel database configuration is correct:

```bash
cd api-backend
php artisan migrate
cd ..
```

### 6. Start PawMatch

From the project root:

```bash
npm run dev
```

This starts the three application services concurrently:

```text
Next.js  → http://localhost:3000
Laravel  → http://localhost:8000
FastAPI  → http://localhost:8001
```

At this point, the PawMatch development environment should be running.

---

# Manual Setup

> **Optional:** This section is only necessary if you do not want to use `setup.bat`, or if you need to troubleshoot/setup individual services manually.

## 1. Root Dependencies

From the project root:

```bash
npm install
```

The root `package.json` only contains project-level development tooling such as `concurrently`. It does **not** contain the Next.js dependencies.

## 2. Database

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE petadoption;
```

## 3. Next.js Frontend

```bash
cd nextjs-frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

## 4. Laravel Backend

Open a new terminal:

```bash
cd api-backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure the database connection in `.env`, then run:

```bash
php artisan migrate
php artisan serve
```

The API runs at:

```text
http://localhost:8000
```

## 5. FastAPI Matching Microservice

Open another terminal:

```bash
cd microservice
python -m venv .venv
```

Activate the virtual environment.

### Windows

```bat
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the environment file:

```bat
copy .env.example .env
```

Start the service:

```bash
uvicorn app.main:app --reload --port 8001
```

The matching service runs at:

```text
http://localhost:8001
```

---

# Service Startup

PostgreSQL should be running before starting the application services.

The overall architecture is:

```text
PostgreSQL
    ↓
Laravel API
    ↓
FastAPI Matching Service
    ↓
Next.js Frontend
```

The `npm run dev` command starts the three application services concurrently. It does not start PostgreSQL.

---

# Development Commands

## Start All Services

From the project root:

```bash
npm run dev
```

## Start Next.js Only

```bash
cd nextjs-frontend
npm run dev
```

## Start Laravel Only

```bash
cd api-backend
php artisan serve
```

## Start FastAPI Only

```bash
cd microservice
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8001
```

## Run Laravel Migrations

```bash
cd api-backend
php artisan migrate
```

## Run Laravel Tests

```bash
cd api-backend
php artisan test
```

---

# Tech Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide

## Backend

* Laravel 11
* PHP 8.3+
* Laravel Sanctum

## Matching Service

* FastAPI
* Python 3.12+
* SQLAlchemy
* NumPy
* Cosine Similarity

## Database

* PostgreSQL 16+
* JSONB
* Full-text search

---

# Project Structure

```text
pet-adoption-thesis/
├── api-backend/          # Laravel API
├── nextjs-frontend/      # Next.js frontend
├── microservice/         # FastAPI matching service
├── setup.bat             # Automated Windows setup
├── package.json          # Root development scripts and tooling
├── package-lock.json     # Root npm dependency lockfile
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

---

# Matching System

PawMatch uses a similarity-based matchmaking approach to recommend pets to potential adopters.

The matching service processes relevant adopter and pet attributes, represents them as numerical vectors, and calculates their similarity using **cosine similarity**.

The resulting similarity scores are used by the application to generate personalized pet recommendations.

---

# Environment Variables

Each service has its own environment configuration.

```text
nextjs-frontend/
└── .env.local

api-backend/
└── .env

microservice/
└── .env
```

Example configuration files are provided:

```text
nextjs-frontend/.env.example
api-backend/.env.example
microservice/.env.example
```

> **Important:** Environment files may contain credentials and secrets. Do not commit them to Git.

---

# Team Development

Each developer should work from their own fork or branch.

After cloning the repository, the recommended workflow is:

```text
Clone/Fork
    ↓
setup.bat
    ↓
Configure .env files
    ↓
Run database migrations
    ↓
npm run dev
```

For normal development:

```bash
git pull
```

After making changes:

```bash
git add .
git commit -m "description of changes"
git push
```

Keep service-specific dependencies inside their respective projects:

```text
Root
└── npm
    └── concurrently

Next.js
└── npm
    └── Next.js dependencies

Laravel
└── Composer
    └── PHP dependencies

FastAPI
└── Python virtual environment
    └── Python dependencies
```

The root `package.json` is used only for project-level development commands and orchestration. It does not contain the Next.js dependencies.

---

# License

Private

# Initial Commit

```bash
git add .
git commit -m "chore: initial monorepo scaffold with README"
```
