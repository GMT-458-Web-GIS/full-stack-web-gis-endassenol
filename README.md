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

## ⚡ Performance Monitoring & Spatial Indexing Experiment

This section evaluates the impact of spatial indexing on query performance within the PostGIS-enabled `events` table.

To conduct the experiment, the database was populated with **2001 point-based event records** stored in **EPSG:4326** coordinate reference system. Spatial queries were tested using bounding box filters combined with `EXPLAIN ANALYZE` to observe PostgreSQL query planner behavior.

### Spatial Index Performance Comparison

#### Without GiST Index (Sequential Scan)

In the absence of a spatial index, PostgreSQL performs a **sequential scan** over the entire `events` table.  
This execution strategy is typically chosen when no suitable index exists or when the query selectivity is low.

![Sequential Scan](https://raw.githubusercontent.com/GMT-458-Web-GIS/full-stack-web-gis-endassenol/main/screenshots/seq_scan_wide_bbox.PNG)

- Query Plan: Sequential Scan  
- Rows scanned: Entire table  
- Execution time: ~1.4 ms  

Although acceptable for small datasets, this approach does not scale well as data volume increases.

---

#### With GiST Spatial Index (Bitmap Index Scan)

After creating a **GiST index** on the geometry column, spatial queries were re-evaluated using a **more selective bounding box**.

![Bitmap Index Scan](https://raw.githubusercontent.com/GMT-458-Web-GIS/full-stack-web-gis-endassenol/main/screenshots/gist_index_narrow_bbox.PNG)


- Query Plan: Bitmap Index Scan  
- Rows returned: ~55  
- Execution time: ~0.06 ms  

The query planner successfully leveraged the spatial index, significantly reducing the number of scanned rows and overall execution time.

---

### Performance Evaluation Summary

The experiment demonstrates that:

- Spatial indexes are critical for efficient querying in Web GIS applications
- GiST indexing dramatically improves performance for selective spatial queries
- Indexed spatial filtering scales far better than sequential scans as dataset size grows

These findings confirm that proper spatial indexing is essential for backend systems supporting real-time, map-based visualization and filtering.

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
