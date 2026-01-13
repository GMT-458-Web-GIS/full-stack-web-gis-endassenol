[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/dxPbR2Gs)

# 📍 Role-Based Urban Event & Facility GIS  
### Web GIS Final Project

## 📌 Project Overview
This project is a role-based Web GIS application designed to manage, query, and monitor urban events using geospatial data. The system focuses on secure backend development with spatial database support, role-based access control, request logging, and API-level spatial querying mechanisms suitable for map-based applications.

The project follows a backend-first and modular development approach. Core GIS and security functionalities are implemented at the API level, while frontend integration is provided as a lightweight demonstration and may be further extended.

---

## 🎯 Project Objectives
- To design a secure and scalable Web GIS backend  
- To manage spatial event data using PostGIS  
- To implement role-based authentication and authorization  
- To support spatial filtering for map-based visualization  
- To monitor backend activity through request logging  
- To provide a solid backend foundation for future frontend development  

---

## 🧩 User Roles
The system supports multiple user roles with different access levels:

- **Admin**
  - Full access to all events
  - Can create, update, and delete any event
  - Can access system request logs
- **Organizer**
  - Can create events
  - Can update and delete only the events they own
- **User**
  - Read-only access to event data

Authorization is enforced using JWT-based authentication and role-based middleware.

---

## 🗂️ Project Structure

backend/
├── src/
│ ├── routes/
│ │ ├── auth.routes.js
│ │ ├── events.routes.js
│ │ ├── logs.routes.js
│ │ └── health.routes.js
│ ├── middleware/
│ │ ├── auth.js
│ │ ├── requireAdmin.js
│ │ └── mongoLogger.js
│ ├── db/
│ │ ├── pg.js
│ │ └── mongo.js
│ ├── models/
│ │ └── EventLog.js
│ ├── docs/
│ │ └── swagger.js
│ ├── app.js
│ └── server.js
frontend/
├── index.html
└── app.js
screenshots/
README.md
docker-compose.yml


---

## ✅ Implemented Features

### 🔐 Authentication & Authorization
- User registration and login functionality  
- JWT-based authentication mechanism  
- Role-based authorization (admin / organizer / user)  
- Protected routes using authentication and role middleware  

---

### 🌍 Spatial Event Management (CRUD)
- Creation of spatial events with geographic coordinates  
- Storage of events as `POINT` geometries (EPSG:4326)  
- Retrieval of event data in GeoJSON format  
- Update operations with ownership and role validation  
- Delete operations with role-based access control  

---

### 🔎 Spatial Filtering & Querying
- Category-based event filtering using query parameters  
- Bounding box (BBOX) spatial filtering with `ST_MakeEnvelope`  
- Efficient spatial queries supported by PostGIS functions  

---

### 🗄️ Database & Data Management
- PostgreSQL database with PostGIS extension  
- Spatial indexing using GiST indexes on geometry columns  
- Relational integrity enforced through foreign key constraints  
- Secure storage of user credentials with hashed passwords  

---

### 🔍 Request Logging & Monitoring (MongoDB)
All incoming HTTP requests are logged using MongoDB through a custom logging middleware.

Each request log includes:
- HTTP method  
- Request path  
- Response status code  
- Request duration (ms)  
- Client IP address  
- User-Agent information  
- Timestamp  

This structure enables backend monitoring, debugging, and performance analysis.

---

### 🔐 Admin-only Logs Endpoint
An admin-restricted endpoint is implemented to access request logs:

- **GET `/logs`** (admin only)

This endpoint:
- Requires JWT authentication  
- Enforces admin role authorization  
- Supports filtering via query parameters  

Example: GET /logs?limit=50&method=GET&status=200&path=/events


Non-admin users receive a **403 Forbidden** response.

---

## 🧪 API Endpoints Overview

| Method | Endpoint | Description |
|------|--------|------------|
| GET | `/health` | Server health check |
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |
| GET | `/events` | List events (supports spatial and category filters) |
| POST | `/events` | Create a new event (admin / organizer) |
| PATCH | `/events/:id` | Update an existing event |
| DELETE | `/events/:id` | Delete an event |
| GET | `/logs` | View request logs (admin only) |

---

## 📚 API Documentation (Swagger)

Swagger UI provides an interactive interface for exploring and testing the API.

http://localhost:5000/docs


### JWT Authorization Flow
1. Call `POST /auth/login`  
2. Copy the returned JWT token  
3. Click **Authorize** in Swagger UI  
4. Paste the token into the Bearer field  

---

## ⚡ Performance Monitoring & Spatial Indexing Experiment
A performance evaluation was conducted to assess the impact of spatial indexing on PostGIS query execution.

- Dataset: 2001 point-based event records  
- CRS: EPSG:4326  
- Tool: EXPLAIN ANALYZE  

Results show that GiST spatial indexing significantly improves query performance and scalability.

---

## 🚧 Planned Features
- Extended frontend visualization (Leaflet / OpenLayers)  
- Advanced role-based UI behavior  
- Extended analytics on request logs  
- Hybrid NoSQL–relational data usage scenarios  

---

## 🛠️ Technologies Used
- Node.js & Express.js  
- PostgreSQL with PostGIS  
- MongoDB  
- JSON Web Token (JWT)  
- Swagger (OpenAPI)  
- RESTful API architecture  
- GeoJSON  

---

## 📌 Development Notes
The project was developed incrementally with regular Git commits. The backend architecture emphasizes modularity, maintainability, and security, while demonstrating practical Web GIS backend design principles.

---

## 📅 Current Status
✔ Backend core completed  
✔ Authentication and role-based authorization implemented  
✔ Spatial CRUD operations functional  
✔ Category and bounding box filtering supported  
✔ Request logging and admin log access implemented  

---

## 🤖 AI Assistance Disclosure
AI-based tools were used as a supportive resource for brainstorming, architectural planning, debugging guidance, and documentation drafting. All implementation decisions and final integrations were performed and validated by the project author.

---

## 📚 License
This project is developed as part of the **Web GIS Final Project** coursework.

