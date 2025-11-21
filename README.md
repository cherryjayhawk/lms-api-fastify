# Library Management System API

A fast and modern REST API for managing library operations built with Fastify and TypeScript.

## Features

- **User Management**: Register, authenticate, and manage library users with role-based access control
- **Book Management**: Full CRUD operations for library inventory with cover image uploads
- **Loan System**: Track book borrowing with due dates and return management
- **JWT Authentication**: Secure token-based authentication with refresh token rotation to prevent token reuse attacks
- **Admin Controls**: Admin-only endpoints for managing books and users
- **Swagger Documentation**: Auto-generated API documentation accessible at `/docs`
- **MongoDB Integration**: Persistent data storage with MongoDB
- **Static File Serving**: Serve book covers and other uploads from `/uploads` endpoint

## Tech Stack

- **Framework**: Fastify 5 with TypeScript
- **Database**: MongoDB
- **Authentication**: JWT with `@fastify/jwt`
- **File Uploads**: Multipart form handling with `@fastify/multipart`
- **Documentation**: Swagger/OpenAPI with `@fastify/swagger`
- **Security**: Bcrypt password hashing

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB instance (local or Atlas URI)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** - Create `.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017/lms
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   ADMIN_SECRET_KEY=your-admin-setup-key
   PORT=3000
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Production**
   ```bash
   npm run build
   npm start
   ```

5. **View API Documentation**
   Once running, open [http://localhost:3000/docs](http://localhost:3000/docs) in your browser for interactive Swagger documentation.

## API Endpoints

### Authentication
- `POST /register` - Create a new user account
- `POST /login` - Authenticate user, returns access & refresh tokens
- `POST /refresh` - Get new access token using refresh token (requires valid JWT)
- `POST /logout` - Invalidate refresh token
- `GET /me` - Get authenticated user info (requires JWT)

### Books
- `GET /books` - List all books (supports pagination & filtering)
- `GET /books/:id` - Get book details
- `POST /books` - Create book (admin only)
- `PATCH /books/:id` - Update book (admin only)
- `DELETE /books/:id` - Delete book (admin only)

### Users
- `GET /users` - List users (admin only)
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user account (admin only)

### Loans
- `GET /loans` - List loans with filtering options
- `POST /loans` - Create book loan
- `PATCH /loans/:id` - Update loan status
- `GET /loans/user/:userId` - Get user's loan history

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: 15-minute access tokens, 7-day refresh tokens
- **Refresh Token Rotation**: Automatic token rotation with family tracking
- **Token Reuse Detection**: Tracks token families to detect stolen tokens
- **Admin Setup**: One-time admin creation with secret key
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Strict schema validation for all endpoints

## Docker

Build and run with Docker:

```bash
docker-compose up
```

## Project Structure

```
src/
├── app.ts                 # Fastify app configuration
├── index.ts              # Server entry point
├── config/               # Configuration files
├── controllers/          # Request handlers
├── routes/               # Route definitions
├── schemas/              # Request/response validation schemas
├── services/             # Business logic
├── types/                # TypeScript type definitions
└── utils/                # Helper utilities
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled server

## License

ISC
