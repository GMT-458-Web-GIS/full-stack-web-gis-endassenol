[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/dxPbR2Gs)
# 📍 Role-Based Urban Event & Facility GIS  
### Web GIS Final Project

## 📌 Project Overview
This project is a role-based Web GIS application designed to manage and visualize urban events using geospatial data. The system focuses on secure backend development with spatial database support, role-based access control, and spatial querying mechanisms suitable for map-based applications.

The project follows a backend-first and modular development approach. Core GIS functionalities are implemented at the API level, while frontend integration is planned as a future extension.

---

## 🎯 Project Objectives
- To design a secure and scalable **Web GIS backend**
- To manage spatial event data using **PostGIS**
- To implement **role-based authentication and authorization**
- To support spatial filtering for map-based visualization
- To provide a solid backend foundation for future frontend development

---

## 🧩 User Roles
The system supports multiple user roles with different access levels:

- **Admin**
  - Full access to all events
  - Can create, update, and delete any event
- **Organizer**
  - Can create events
  - Can update and delete only the events they own
- **User**
  - Read-only access to event data

Authorization is enforced using JWT-based authentication and role middleware.

---

## 🗂️ Project Structure
```text
backend/
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── events.routes.js
│   │   └── health.routes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roles.js
│   ├── db/
│   │   └── pg.js
│   ├── utils/
│   │   └── jwt.js
│   ├── app.js
│   └── server.js
├── .env
├── package.json
└── README.md

## ✅ Implemented Features

### 🔐 Authentication & Authorization
- User registration and login functionality
- JWT-based authentication mechanism
- Role-based authorization (admin / organizer / user)
- Protected routes using authentication and role middleware

### 🌍 Spatial Event Management (CRUD)
- Creation of spatial events with geographic coordinates
- Storage of events as `POINT` geometries (EPSG:4326)
- Retrieval of event data in GeoJSON format
- Update operations with ownership and role validation
- Delete operations with role-based access control

### 🔎 Spatial Filtering & Querying
- Category-based event filtering using query parameters
- Bounding box (BBOX) spatial filtering with `ST_MakeEnvelope`
- Efficient spatial queries supported by PostGIS functions

### 🗄️ Database & Data Management
- PostgreSQL database with PostGIS extension
- Spatial indexing using GiST indexes on geometry columns
- Relational integrity enforced through foreign key constraints
- Secure storage of user credentials with hashed passwords

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

---
## 📚 API Documentation (Swagger)

The backend API of this project is documented using **Swagger UI**, which provides an interactive interface for exploring and testing all available endpoints.

### Accessing Swagger UI
After starting the backend server, the Swagger interface can be accessed at: http://localhost:5000/docs


### JWT Authorization via Swagger
Some API endpoints require authentication and role-based authorization.

To authorize requests in Swagger:

1. Obtain a JWT token by calling:
   - `POST /auth/register` or
   - `POST /auth/login`

2. Copy the `token` value from the response.

3. Click the **Authorize** button located at the top-right corner of the Swagger UI.

4. Paste the token into the Bearer authorization field and confirm.

After authorization, protected endpoints such as event creation, update, and deletion can be tested directly through the Swagger interface.

### Protected Endpoints
- `POST /events`
- `PATCH /events/{id}`
- `DELETE /events/{id}`

Swagger enables visual inspection of request and response structures and simplifies testing of secured API operations.


## ⚡ Performance Monitoring & Spatial Indexing Experiment

This section evaluates the impact of spatial indexing on query performance within the PostGIS-enabled `events` table.

To conduct the experiment, the database was populated with **2001 point-based event records** stored in the **EPSG:4326** coordinate reference system. Spatial queries were tested using bounding box filters in combination with `EXPLAIN ANALYZE` in order to observe PostgreSQL query planner behavior.

### Spatial Index Performance Comparison

#### Without GiST Index (Sequential Scan)

In the absence of a spatial index, PostgreSQL performs a **sequential scan** over the entire `events` table.  
This execution strategy is typically chosen when no suitable spatial index exists or when the query selectivity is low.

The corresponding query plan output is provided as a screenshot in the repository under:

- `screenshots/seq_scan_wide_bbox.PNG`

Key observations from the execution plan:

- Query Plan: Sequential Scan  
- Rows scanned: Entire table (2001 records)  
- Execution time: approximately **1.4 ms**

Although this approach may be acceptable for small datasets, it does not scale efficiently as the number of spatial features increases.

---

#### With GiST Spatial Index (Bitmap Index Scan)

After creating a **GiST spatial index** on the geometry column, the same spatial query was re-evaluated using a **more selective bounding box**.

The indexed query plan output is available as a screenshot in:

- `screenshots/gist_index_narrow_bbox.PNG`

Key observations from the indexed execution plan:

- Query Plan: Bitmap Index Scan  
- Rows returned: approximately **55**  
- Execution time: approximately **0.06 ms**

In this case, the PostgreSQL query planner successfully utilized the spatial index, significantly reducing both the number of scanned rows and the overall execution time.

---

### Performance Evaluation Summary

The results of this experiment demonstrate that:

- Spatial indexing is critical for efficient query execution in Web GIS backends
- GiST indexes significantly improve performance for selective spatial queries
- Indexed spatial filtering scales far more effectively than sequential scans as dataset size grows

These findings confirm that proper spatial indexing is an essential component of backend architectures supporting real-time, map-based visualization and spatial filtering.

---

## 🚧 Planned Features
The following features are planned for future development and may be revised as the project progresses:

- 🌐 **Frontend Integration**
  - Interactive web map using Leaflet or OpenLayers
  - Visualization of event locations with markers
  - Popup components displaying event details
  - Client-side category and spatial filtering

- ⚡ **Performance & Index Analysis**
  - Performance comparison of spatial queries with and without GiST indexes
  - Evaluation of query execution plans using `EXPLAIN ANALYZE`
  - Discussion of spatial indexing impact on large datasets

- 🧠 **NoSQL Integration**
  - MongoDB integration for storing event comments or activity logs
  - Demonstration of hybrid relational–NoSQL data architecture
  - Separation of structured spatial data and unstructured content

- 🎨 **UI & UX Enhancements**
  - Role-based interface behavior
  - Event creation and editing forms
  - Responsive layout for different screen sizes

---

## 🛠️ Technologies Used
- **Node.js** & **Express.js**
- **PostgreSQL** with **PostGIS** extension
- **JSON Web Token (JWT)** for authentication
- **RESTful API** architecture
- **GeoJSON** format for spatial data exchange

---

## 📌 Development Notes
The project is developed incrementally with regular Git commits to demonstrate version control discipline. Backend components are implemented in a modular structure to ensure maintainability, readability, and extensibility.

---

## 📅 Current Status
✔ Backend core completed  
✔ Authentication and role-based authorization implemented  
✔ Spatial CRUD operations functional  
✔ Category and bounding box filtering supported  
⏳ Frontend integration planned  

---

## 🤖 AI Assistance Disclosure
During the development of this project, AI-based tools were used as a supportive resource for brainstorming, architectural planning, and documentation drafting. All implementation decisions, testing processes, and final code integrations were performed and validated by the project author. The AI assistance served solely as a guidance tool and did not replace individual problem-solving or development responsibility.

---

## 📚 License
This project is developed as part of the **Web GIS Final Project** coursework.
