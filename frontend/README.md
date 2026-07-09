# DevConnect

DevConnect is a full-stack developer networking platform where users can create profiles, search for other developers, send connection requests, and chat in real time.

## Features

- JWT authentication with protected API routes
- Developer profiles with bio and skills
- User search and connection requests (accept / reject)
- Real-time chat with WebSocket (STOMP) and message history
- Responsive React UI

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, React Router, Axios, STOMP, SockJS |
| Backend | Java 17, Spring Boot 3, Spring Security, JPA |
| Database | MySQL |
| Real-time | Spring WebSocket + STOMP |

## Project Structure

```
Desktop/
├── backend/                 # Spring Boot API
└── devconnect-frontend/     # React frontend
```

## Prerequisites

- Node.js 18+
- Java 17+
- MySQL 8+
- Maven (or use included `mvnw`)

## Database Setup

Create the database in MySQL:

```sql
CREATE DATABASE devconnect;
```

Update credentials in `backend/src/main/resources/application.properties` if needed:

```properties
spring.datasource.username=root
spring.datasource.password=your_password
```

Optional environment variables:

```bash
DB_PASSWORD=your_password
JWT_SECRET=your-32-char-or-longer-secret-key-here
```

## Run Locally

### 1. Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs at `http://localhost:8080`

### 2. Start Frontend

```bash
cd devconnect-frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Login and receive JWT |
| GET | `/api/profile/{id}` | Get user profile |
| PUT | `/api/profile/{id}` | Update profile |
| GET | `/api/profile/search?name=` | Search users |
| POST | `/api/connections/send` | Send connection request |
| GET | `/api/connections/pending/{id}` | Pending requests |
| PUT | `/api/connections/accept/{id}` | Accept request |
| DELETE | `/api/connections/reject/{id}` | Reject request |
| GET | `/api/connections/accepted/{id}` | Accepted connections |
| GET | `/api/chat/history/{userId}/{otherUserId}` | Chat history |
| WS | `/chat` | WebSocket endpoint |

Protected routes require header: `Authorization: Bearer <token>`

## Resume Bullet Points

- Built a full-stack developer networking app with **React** and **Spring Boot**, featuring JWT auth, user search, connection management, and real-time chat
- Implemented **WebSocket (STOMP)** messaging with persistent chat history stored in **MySQL**
- Designed RESTful APIs with **Spring Security** stateless authentication and role-based route protection

## Demo Flow (for interviews)

1. Register two users with different skills/bios
2. Search and send a connection request
3. Accept the request from the other account
4. Open Chat and send real-time messages
5. Edit profile and explain JWT + WebSocket architecture

## Deployment (optional next step)

- Frontend: Vercel / Netlify
- Backend: Render / Railway
- Database: PlanetScale / Railway MySQL

Set `VITE_API_URL` to your deployed backend URL before building the frontend.

## License

MIT — free to use for portfolio and learning.
