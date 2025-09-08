# 🏠 Apartments Listing Application

A modern, full-stack apartment listing platform built with TypeScript, React, and Node.js. Users can browse apartments publicly and manage their own listings after authentication.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-20+-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** (Required)
- **Git**

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd apartments-app
   ```

2. **🐳 Start the Application**

   **Single command to run everything:**

   ```bash
   # Start all services (frontend, backend, database) and seed data
   docker-compose up --build
   ```

   This single command will:

   - Build and start MongoDB, Backend API, and Frontend
   - Automatically seed the database with sample data
   - Make the application available at http://localhost:3000

   **How it works**: The docker-compose configuration includes a seeder service that automatically runs once after the backend is healthy, ensuring your database is populated with sample data. The seeder exits after completion, leaving only the main services running.

### 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **📖 Swagger Documentation**: http://localhost:3001/api-docs
- **🏥 Health Check**: http://localhost:3001/health

### 🔐 Test Account

Use these credentials to test the application:

- **Email**: test@example.com
- **Password**: Test123!@#

## 📋 Features

### 🌟 Core Features

- **🏠 Public Apartment Browsing** - Browse all available apartments without authentication
- **🔍 Advanced Search & Filtering** - Filter by price, location, bedrooms, amenities, etc.
- **📱 Responsive Design** - Optimized for mobile, tablet, and desktop
- **🔐 User Authentication** - Secure JWT-based login and registration
- **📝 Apartment Management** - Create, edit, and delete apartment listings
- **🖼️ Image Upload** - Multiple image support with preview and management
- **👤 User Profile Management** - Edit profile and change password securely
- **📊 Pagination** - Efficient browsing of large apartment listings

### 🔒 Authentication Features

- **Modal-based Login/Register** - Seamless authentication without page redirects
- **JWT Token Security** - Secure token-based authentication
- **Password Validation** - Real-time password strength validation
- **Phone Number Formatting** - Auto-formatting for phone numbers
- **Session Persistence** - Stay logged in across browser sessions
- **Ownership Protection** - Users can only manage their own listings

### 🎨 User Interface

- **Modern Design** - Clean, professional UI with Tailwind CSS
- **Loading States** - Smooth loading indicators and skeleton screens
- **Toast Notifications** - Real-time feedback for user actions
- **Modal System** - Professional modal dialogs for forms and confirmations
- **Mobile-First** - Responsive design optimized for all devices
- **Accessibility** - WCAG compliant with keyboard navigation

## 🏗️ Technology Stack

### Backend

- **Node.js** + **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **Swagger** + **OpenAPI 3.0** - API documentation
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing

### Frontend

- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **React Hot Toast** - Toast notifications
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client

### DevOps & Tools

- **Docker** + **docker-compose** - Containerization
- **ESLint** + **Prettier** - Code linting and formatting
- **Husky** - Git hooks
- **Jest** - Testing framework (configured but not used)

## 📁 Project Structure

```
apartments-app/
├── backend/                    # Node.js Backend API
│   ├── src/
│   │   ├── config/            # Database and app configuration
│   │   ├── controllers/       # Route handlers and business logic
│   │   ├── middleware/        # Authentication, validation, error handling
│   │   ├── models/           # MongoDB schemas and models
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic services
│   │   ├── types/            # TypeScript type definitions
│   │   ├── index.ts          # Application entry point
│   │   └── seed.ts           # Database seeding script
│   ├── uploads/              # File upload directory
│   ├── Dockerfile            # Backend container configuration
│   └── package.json          # Backend dependencies
├── frontend/                  # Next.js Frontend Application
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # Reusable React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility libraries and API clients
│   │   └── types/            # TypeScript type definitions
│   ├── public/               # Static assets
│   ├── Dockerfile            # Frontend container configuration
│   └── package.json          # Frontend dependencies
├── docker-compose.yml         # Multi-container Docker setup
└── README.md                 # Project documentation
```

## � API Documentation

### 🌐 Interactive Documentation

The API is fully documented using **Swagger/OpenAPI 3.0** specification. Access the interactive documentation at:

**🔗 [http://localhost:3001/api-docs](http://localhost:3001/api-docs)**

### ✨ Documentation Features

- **📋 Complete API Reference** - All endpoints with detailed descriptions
- **🔧 Interactive Testing** - Test API endpoints directly from the browser
- **📝 Request/Response Examples** - Sample data for all endpoints
- **🔐 Authentication Support** - Built-in JWT token authentication
- **📊 Schema Definitions** - Complete data models and validation rules
- **🎯 Error Responses** - Detailed error codes and messages

### 🛠️ API Endpoints Overview

| **Category**          | **Endpoint**                       | **Method** | **Description**                   | **Auth** |
| --------------------- | ---------------------------------- | ---------- | --------------------------------- | -------- |
| **🏠 Apartments**     | `/api/v1/apartments`               | `GET`      | Get all apartments with filtering | ❌       |
|                       | `/api/v1/apartments`               | `POST`     | Create new apartment              | ✅       |
|                       | `/api/v1/apartments/{id}`          | `GET`      | Get apartment by ID               | ❌       |
|                       | `/api/v1/apartments/{id}`          | `PUT`      | Update apartment (owner only)     | ✅       |
|                       | `/api/v1/apartments/{id}`          | `DELETE`   | Delete apartment (owner only)     | ✅       |
|                       | `/api/v1/apartments/search`        | `GET`      | Search apartments by text         | ❌       |
|                       | `/api/v1/apartments/stats`         | `GET`      | Get apartment statistics          | ❌       |
|                       | `/api/v1/apartments/my-apartments` | `GET`      | Get user's apartments             | ✅       |
| **🔐 Authentication** | `/api/v1/auth/register`            | `POST`     | Register new user                 | ❌       |
|                       | `/api/v1/auth/login`               | `POST`     | User login                        | ❌       |
|                       | `/api/v1/auth/me`                  | `GET`      | Get current user profile          | ✅       |
|                       | `/api/v1/auth/logout`              | `POST`     | User logout                       | ✅       |
|                       | `/api/v1/auth/profile`             | `PUT`      | Update user profile               | ✅       |
| **🏥 System**         | `/health`                          | `GET`      | API health check                  | ❌       |

### 🔑 Authentication

The API uses **JWT Bearer Token** authentication:

```bash
# Include in request headers:
Authorization: Bearer <your-jwt-token>
```

### 📊 Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

### 🎯 Quick API Examples

**Get All Apartments:**

```bash
curl -X GET "http://localhost:3001/api/v1/apartments?page=1&limit=10"
```

**Search Apartments:**

```bash
curl -X GET "http://localhost:3001/api/v1/apartments/search?q=luxury+downtown"
```

**User Login:**

```bash
curl -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!@#"}'
```

**Create Apartment (with Authentication):**

```bash
curl -X POST "http://localhost:3001/api/v1/apartments" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"unitName": "Modern Studio", "project": "Downtown Lofts", ...}'
```

### 🔍 Advanced Filtering

**Apartment Filtering Parameters:**

| Parameter     | Type      | Description                                         | Example               |
| ------------- | --------- | --------------------------------------------------- | --------------------- |
| `page`        | `number`  | Page number (default: 1)                            | `?page=2`             |
| `limit`       | `number`  | Items per page (default: 10, max: 100)              | `?limit=20`           |
| `search`      | `string`  | Text search across name, project, description       | `?search=luxury`      |
| `city`        | `string`  | Filter by city                                      | `?city=San Francisco` |
| `state`       | `string`  | Filter by state                                     | `?state=CA`           |
| `minPrice`    | `number`  | Minimum price filter                                | `?minPrice=2000`      |
| `maxPrice`    | `number`  | Maximum price filter                                | `?maxPrice=5000`      |
| `bedrooms`    | `number`  | Minimum bedrooms                                    | `?bedrooms=2`         |
| `bathrooms`   | `number`  | Minimum bathrooms                                   | `?bathrooms=1.5`      |
| `isAvailable` | `boolean` | Filter by availability                              | `?isAvailable=true`   |
| `petPolicy`   | `string`  | Pet policy (`allowed`/`not-allowed`/`conditional`)  | `?petPolicy=allowed`  |
| `sortBy`      | `string`  | Sort field (`price`, `bedrooms`, `createdAt`, etc.) | `?sortBy=price`       |
| `sortOrder`   | `string`  | Sort order (`asc`/`desc`)                           | `?sortOrder=desc`     |

**Complex Query Example:**

```bash
curl "http://localhost:3001/api/v1/apartments?city=San Francisco&minPrice=2000&maxPrice=4000&bedrooms=1&sortBy=price&sortOrder=asc"
```

## �📊 Database Schema

### 🏠 Apartment Model

```typescript
interface Apartment {
  _id: string; // Unique identifier
  unitName: string; // "Luxury Studio A1"
  unitNumber: string; // "A101", "2B"
  project: string; // "Sunset Towers"
  description: string; // Detailed description
  bedrooms: number; // 0, 1, 2, 3+
  bathrooms: number; // 0.5, 1, 1.5, 2+
  squareFootage: number; // Square feet
  price: number; // Monthly rent
  address: string; // Street address
  city: string; // City
  state: string; // State/Province
  zipCode: string; // ZIP/Postal code
  amenities: string[]; // Array of amenities
  images: string[]; // Image file paths
  isAvailable: boolean; // Availability status
  floorPlan?: string; // Floor plan image
  petPolicy: "allowed" | "not-allowed" | "conditional";
  parkingSpaces: number; // Number of parking spaces
  leaseTerms: string[]; // Available lease terms
  contactEmail: string; // Contact information
  contactPhone: string; // Contact phone
  virtualTourUrl?: string; // Virtual tour URL
  userId: ObjectId; // Owner reference
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

### 👤 User Model

```typescript
interface User {
  _id: string; // Unique identifier
  name: string; // Full name
  email: string; // Unique email (login)
  password: string; // Hashed password
  phone: string; // Phone number
  createdAt: Date; // Registration date
  updatedAt: Date; // Last update
}
```

## 🔌 API Endpoints

### 🏠 Apartment Endpoints

| Method   | Endpoint                           | Description                                  | Auth Required |
| -------- | ---------------------------------- | -------------------------------------------- | ------------- |
| `GET`    | `/api/v1/apartments`               | Get all apartments with filters & pagination | No            |
| `GET`    | `/api/v1/apartments/:id`           | Get single apartment by ID                   | No            |
| `GET`    | `/api/v1/apartments/my-apartments` | Get current user's apartments                | Yes           |
| `POST`   | `/api/v1/apartments`               | Create new apartment with images             | Yes           |
| `PUT`    | `/api/v1/apartments/:id`           | Update apartment (owner only)                | Yes           |
| `DELETE` | `/api/v1/apartments/:id`           | Delete apartment (owner only)                | Yes           |

### 🔐 Authentication Endpoints

| Method | Endpoint                | Description                      | Auth Required |
| ------ | ----------------------- | -------------------------------- | ------------- |
| `POST` | `/api/v1/auth/register` | User registration                | No            |
| `POST` | `/api/v1/auth/login`    | User login                       | No            |
| `GET`  | `/api/v1/auth/me`       | Get current user profile         | Yes           |
| `PUT`  | `/api/v1/auth/profile`  | Update profile & change password | Yes           |
| `POST` | `/api/v1/auth/logout`   | User logout                      | Yes           |

### 📄 Query Parameters

**Apartment Filtering:**

```typescript
interface ApartmentFilters {
  page?: number; // Page number (default: 1)
  limit?: number; // Items per page (default: 12)
  search?: string; // Search in name, project, description
  minPrice?: number; // Minimum price filter
  maxPrice?: number; // Maximum price filter
  bedrooms?: number; // Minimum bedrooms
  bathrooms?: number; // Minimum bathrooms
  city?: string; // City filter
  state?: string; // State filter
  project?: string; // Project filter
  isAvailable?: boolean; // Availability filter
  petPolicy?: "allowed" | "not-allowed" | "conditional";
  sortBy?: "createdAt" | "price" | "unitName";
  sortOrder?: "asc" | "desc";
}
```

## 🛠️ Development

### Environment Variables

**Backend (.env):**

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/apartments_db
DB_NAME=apartments_db
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

**Frontend (.env.local):**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 🗄️ Database Seeding

The application automatically seeds the database when started with Docker. The seed data includes:

**Seed Data Includes:**

- **31 Sample Apartments** - Diverse apartments across multiple cities
- **5 Sample Users** - Including a test user with credentials
- **Test User Apartments** - First 4 apartments belong to test user
- **Realistic Data** - Names, descriptions, prices, and amenities

**Test User Credentials:**

- Email: `test@example.com`
- Password: `Test123!@#`

---

## 👨‍💻 Author

**Built with ❤️ by Mohamed Fouad**
