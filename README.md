# Full-Stack Food Ordering System with RBAC


A production-ready full-stack web application with Role-Based Access Control (RBAC) and relational access control by country.

## Tech Stack
- **Backend:** FastAPI (Python), SQLAlchemy, JWT Authentication, SQLite
- **Frontend:** React (Vite, SWC), Axios, Lucide-React, React Router

## RBAC & Country-Based Access Matrix

| Action | Admin | Manager | Member | Country Constraint |
| :--- | :---: | :---: | :---: | :--- |
| View Restaurants & Menu | YES | YES | YES | Own Country Only (Admins see all) |
| Create Order (Add Items) | YES | YES | YES | Own Country Only |
| Place Order (Checkout) | YES | YES | **NO** | Own Country Only |
| Cancel Order | YES | YES | **NO** | Own Country Only |
| Update Payment Method | YES | **NO** | **NO** | N/A |

## Setup Instructions

### Backend
1. Navigate to `backend/`
2. Create virtual environment: `python -m venv venv`
3. Activate: `./venv/Scripts/activate`
4. Install: `pip install fastapi uvicorn sqlalchemy pydantic-settings python-multipart pyjwt[crypto] passlib[bcrypt]`
5. Seed Database: `python -m seed` (Auto-seeds if DB is empty)
6. Run: `uvicorn main:app --reload`

### Frontend
1. Navigate to `frontend/`
2. Install: `npm install`
3. Run: `npm run dev`

## Seeded Users & Credentials
Password for all: `password123`

| Username | Role | Country | Notes |
| :--- | :--- | :--- | :--- |
| `fury` | ADMIN | ALL | Can see and manage everything in all countries. |
| `marvel` | MANAGER | INDIA | Can manage Indian orders. Cannot update payments. |
| `america` | MANAGER | AMERICA | Can manage American orders. |
| `thanos` | MEMBER | INDIA | Can only view and create orders in India. Cannot checkout/cancel. |
| `thor` | MEMBER | INDIA | Can only view and create orders in India. |
| `travis` | MEMBER | AMERICA | Can only view and create orders in America. |

## API Documentation
Once the backend is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Implementation Details
- **RBAC:** Enforced using a `require_role` dependency in FastAPI endpoints.
- **Relational Access Control:** Every query filters by `current_user.country` unless the user is an `ADMIN`.
- **403 Forbidden:** The backend returns explicit 403 status codes for unauthorized actions, and the UI displays disabled buttons/explanations.
 http://127.0.0.1:5173/
