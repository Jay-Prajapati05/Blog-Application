# Blog Application

A full-stack blog platform built with the MERN stack. Users can register, log in, write posts, search and paginate through them, and leave comments. The project focuses on working with **relationships between data** (users, posts, comments), **forms**, and **multi-page navigation** with dynamic routes.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Seed Data](#seed-data)
- [API Documentation](#api-documentation)
- [Data Models](#data-models)
- [Frontend Routes](#frontend-routes)
- [Design Decisions](#design-decisions)
- [Future Improvements](#future-improvements)

## Features

- **Authentication**: register, login and session restore using JWT. Passwords are hashed with bcrypt.
- **Posts (CRUD)**: logged-in users can create posts. Only the author can edit or delete their own post.
- **Comments**: anyone can add a comment on a post and view all comments of that post (newest first).
- **Search**: case-insensitive search by post title.
- **Pagination**: 5 posts per page, driven by the URL (`/?page=2&search=react`), so refresh, back button and shared links all work.
- **Routing**: React Router with a dynamic route `/posts/:id` and protected routes for create and edit.
- **Centralized error handling**: consistent JSON error responses for validation errors, invalid IDs, duplicates and unexpected failures.
- **Seed script**: fills the database with sample users, posts and comments in one command.

<!-- Add screenshots of the Home page, Post Detail page and Create Post form here -->

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React (Vite), React Router, Axios, Context API |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens (jsonwebtoken), bcryptjs |
| Tooling | dotenv, cors, nodemon |

## Project Structure

```
blog-app/
├── backend/
│   ├── src/
│   │   ├── config/          # database connection
│   │   ├── controllers/     # read request, send response
│   │   ├── services/        # business logic and database calls (+ seed script)
│   │   ├── models/          # Mongoose schemas (User, Post, Comment)
│   │   ├── routes/          # route definitions
│   │   ├── middlewares/     # auth (protect) and global error handler
│   │   ├── utils/           # AppError, asyncHandler
│   │   ├── app.js           # express app and route mounting
│   │   └── server.js        # entry point (loads env, connects DB, starts server)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # axios instance with auth interceptor
│   │   ├── context/         # AuthContext (login state)
│   │   ├── components/      # Navbar, ProtectedRoute, PostCard, Pagination, CommentSection
│   │   ├── pages/           # Home, PostDetail, PostForm, Login, Register
│   │   ├── utils/           # helpers (formatDate)
│   │   ├── App.jsx          # routes
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm
- MongoDB (local installation or a MongoDB Atlas connection string)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/blog-app.git
cd blog-app
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file from the example (`cp .env.example .env` on macOS/Linux, `copy .env.example .env` on Windows) and fill in the values:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the API runs on | `8000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/blog-app` |
| `JWT_SECRET` | Long random string used to sign tokens | `change_this_to_a_long_random_string` |
| `CLIENT_URL` | Frontend origin allowed by CORS (no trailing slash) | `http://localhost:5173` |

Start the server:

```bash
npm run dev
```

The API is now available at `http://localhost:8000`. Check `http://localhost:8000/health`, it should return `{"status":"ok"}`.

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:8000/api
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`. Restart the dev server whenever you change `.env`.

### Available scripts

| Location | Command | Description |
|---|---|---|
| `backend` | `npm run dev` | Start the API with nodemon |
| `backend` | `npm run seed` | Clear the database and insert sample data |
| `frontend` | `npm run dev` | Start the Vite dev server |
| `frontend` | `npm run build` | Create a production build |

## Seed Data

```bash
cd backend
npm run seed
```

This **deletes all existing users, posts and comments** and then creates:

- 3 users
- 12 posts (enough for 3 pages of pagination)
- 15 comments on the first five posts

All seeded users share the password `password123`:

| Name | Email |
|---|---|
| Ana Sharma | ana@example.com |
| Rohan Patel | rohan@example.com |
| Meera Iyer | meera@example.com |

The script refuses to run when `NODE_ENV=production`.

## API Documentation

**Base URL:** `http://localhost:8000/api`

Protected endpoints need this header:

```
Authorization: Bearer <token>
```

All responses are JSON. Successful responses contain `"success": true`. Errors look like this:

```json
{ "success": false, "message": "Post not found" }
```

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create an account and receive a token |
| POST | `/auth/login` | No | Log in and receive a token |
| GET | `/auth/me` | Yes | Get the currently logged-in user |

**POST `/auth/register`**

```json
// Request body
{ "name": "Test", "email": "test@mail.com", "password": "123456" }

// 201 Created
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "Test", "email": "test@mail.com" }
}
```

**POST `/auth/login`**

```json
// Request body
{ "email": "test@mail.com", "password": "123456" }

// 200 OK (same shape as register)
```

### Posts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/posts` | No | List posts (5 per page) with optional title search |
| GET | `/posts/:id` | No | Get a single post |
| POST | `/posts` | Yes | Create a post |
| PUT | `/posts/:id` | Yes (author only) | Update a post |
| DELETE | `/posts/:id` | Yes (author only) | Delete a post and its comments |

**GET `/posts`** query parameters:

| Param | Default | Description |
|---|---|---|
| `page` | `1` | Page number (invalid values fall back to 1) |
| `search` | empty | Case-insensitive match on the title |

```json
// 200 OK
{
  "success": true,
  "posts": [
    {
      "_id": "...",
      "title": "Understanding React hooks",
      "content": "...",
      "tags": ["react", "frontend"],
      "author": { "_id": "...", "name": "Rohan Patel" },
      "createdAt": "2026-09-30T10:00:00.000Z",
      "updatedAt": "2026-09-30T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "totalPages": 3, "totalPosts": 12 }
}
```

Example: `GET /posts?search=react&page=1`

**POST `/posts`** and **PUT `/posts/:id`**

```json
// Request body (for PUT, every field is optional)
{
  "title": "My first post",
  "content": "Hello blog world",
  "tags": ["mern", "node"]
}
```

`tags` can be an array or a comma-separated string. Tags are trimmed, lowercased and de-duplicated. Create returns `201` with the new post, update returns `200` with the updated post.

**DELETE `/posts/:id`**

```json
// 200 OK
{ "success": true, "message": "Post deleted" }
```

### Comments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/posts/:postId/comments` | No | List comments of a post, newest first |
| POST | `/posts/:postId/comments` | No | Add a comment to a post |

**POST `/posts/:postId/comments`**

```json
// Request body (text is limited to 500 characters)
{ "name": "Rahul", "text": "Nice post!" }

// 201 Created
{
  "success": true,
  "comment": {
    "_id": "...",
    "postId": "...",
    "name": "Rahul",
    "text": "Nice post!",
    "createdAt": "2026-09-30T10:05:00.000Z"
  }
}
```

### Health check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` (no `/api` prefix) | Returns `{"status":"ok"}` |

### Status codes and errors

| Code | Meaning | Example message |
|---|---|---|
| 400 | Validation failed, invalid ID or malformed JSON | `Title and content are required`, `Invalid ID`, `Invalid JSON in request body` |
| 401 | Missing, invalid or expired token, or wrong credentials | `Not authorized, token missing`, `Invalid email or password` |
| 403 | Logged in but not the owner of the post | `You can only modify your own posts` |
| 404 | Post or route not found | `Post not found`, `Route not found: /api/xyz` |
| 409 | Duplicate value | `Email is already registered` |
| 500 | Unexpected server error | `Something went wrong on the server` |

## Data Models

**User**

| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique, lowercase |
| `password` | String | required, stored as a bcrypt hash (the 6 character minimum is checked in the service before hashing), excluded from queries by default |
| `createdAt`, `updatedAt` | Date | automatic timestamps |

**Post**

| Field | Type | Notes |
|---|---|---|
| `title` | String | required |
| `content` | String | required |
| `author` | ObjectId (ref `User`) | required |
| `tags` | [String] | normalized to lowercase |
| `createdAt`, `updatedAt` | Date | automatic timestamps |

**Comment**

| Field | Type | Notes |
|---|---|---|
| `postId` | ObjectId (ref `Post`) | required, indexed |
| `name` | String | required |
| `text` | String | required, max 500 characters (enforced in the service) |
| `createdAt`, `updatedAt` | Date | automatic timestamps |

**Relationships**

```
User 1 ──── * Post 1 ──── * Comment
     (author)      (postId)
```

## Frontend Routes

| Path | Page | Access |
|---|---|---|
| `/` | Home: post list, search and pagination | Public |
| `/posts/:id` | Post detail with comments | Public |
| `/create` | Create a post | Logged-in users only |
| `/edit/:id` | Edit a post | Logged-in users only (author) |
| `/login` | Login | Public |
| `/register` | Register | Public |

Visiting a protected route while logged out redirects to `/login`, and after logging in the user is sent back to the page they originally wanted.

## Design Decisions

- **Controller / service separation.** Controllers only read the request and send the response. Business logic and database calls live in services, which keeps code reusable (the seed script and controllers can share logic) and easy to test.
- **Centralized error handling.** A custom `AppError` marks expected errors (`isOperational`) so their message is returned to the client, while unexpected errors return a generic message and are logged on the server. Mongoose `CastError`, `ValidationError` and duplicate key errors are mapped to proper status codes.
- **Comments are referenced, not embedded.** Comments live in their own collection with a `postId` reference. A post document stays small however many comments it gets, and comments can be queried and paginated independently. Deleting a post also deletes its comments.
- **Pagination.** Uses `skip = (page - 1) * 5` and `limit = 5` with a stable newest-first sort. The response includes `totalPages` and `totalPosts` so the UI can build Prev/Next controls.
- **URL as the source of truth for the UI.** `page` and `search` live in the query string, not in component state.
- **Ownership is enforced on the server.** The frontend hides Edit and Delete for non-authors, but the API independently returns `403` for anyone who is not the author.
- **Safe search.** User input is regex-escaped before it reaches MongoDB, so special characters are treated as plain text.
- **Token storage.** The JWT is kept in `localStorage` and attached to every request by an Axios interceptor. This keeps the project simple. For a production app, `httpOnly` cookies are the safer choice against XSS.

## Future Improvements

- Filter posts by tag
- Edit and delete comments, and link comments to logged-in users
- Rate limiting and request validation with a schema library
- Refresh tokens and `httpOnly` cookie auth
- Automated tests (API and component tests)
- Deployment (API on Render or Railway, frontend on Vercel or Netlify, database on MongoDB Atlas)

## Author

Built by [Jay Prajapati](https://github.com/Jay-Prajapati05)
