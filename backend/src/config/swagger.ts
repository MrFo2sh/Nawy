import swaggerJSDoc from "swagger-jsdoc";
import { SwaggerDefinition, Options } from "swagger-jsdoc";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Apartments Listing API",
    version: "1.0.0",
    description:
      "A comprehensive API for managing apartment listings with user authentication and advanced search capabilities.",
    contact: {
      name: "Mohamed Fouad",
      email: "m.fouad2912@gmail.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      // User Schemas
      User: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Unique user identifier",
            example: "64a1b2c3d4e5f6789012345a",
          },
          name: {
            type: "string",
            description: "User full name",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email address",
            example: "john.doe@example.com",
          },
          phone: {
            type: "string",
            description: "User phone number",
            example: "+1234567890",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "User creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "User last update timestamp",
          },
        },
      },
      UserRegistration: {
        type: "object",
        required: ["name", "email", "password", "phone"],
        properties: {
          name: {
            type: "string",
            description: "User full name",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email address",
            example: "john.doe@example.com",
          },
          password: {
            type: "string",
            minLength: 6,
            description: "User password (minimum 6 characters)",
            example: "SecurePass123",
          },
          phone: {
            type: "string",
            description: "User phone number",
            example: "+1234567890",
          },
        },
      },
      UserLogin: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "User email address",
            example: "john.doe@example.com",
          },
          password: {
            type: "string",
            description: "User password",
            example: "SecurePass123",
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          data: {
            type: "object",
            properties: {
              token: {
                type: "string",
                description: "JWT authentication token",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
              user: {
                $ref: "#/components/schemas/User",
              },
            },
          },
          message: {
            type: "string",
            example: "Login successful",
          },
        },
      },
      // Apartment Schemas
      Apartment: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Unique apartment identifier",
            example: "64a1b2c3d4e5f6789012345b",
          },
          unitName: {
            type: "string",
            description: "Apartment unit name",
            example: "Luxury Studio A1",
          },
          unitNumber: {
            type: "string",
            description: "Apartment unit number",
            example: "A101",
          },
          project: {
            type: "string",
            description: "Project name",
            example: "Sunset Towers",
          },
          description: {
            type: "string",
            description: "Detailed apartment description",
            example: "Beautiful modern studio with city views...",
          },
          bedrooms: {
            type: "integer",
            minimum: 0,
            description: "Number of bedrooms",
            example: 1,
          },
          bathrooms: {
            type: "number",
            minimum: 0,
            description: "Number of bathrooms",
            example: 1.5,
          },
          squareFootage: {
            type: "integer",
            minimum: 1,
            description: "Square footage",
            example: 800,
          },
          price: {
            type: "number",
            minimum: 0,
            description: "Monthly rent price",
            example: 2500,
          },
          address: {
            type: "string",
            description: "Street address",
            example: "123 Main Street",
          },
          city: {
            type: "string",
            description: "City",
            example: "San Francisco",
          },
          state: {
            type: "string",
            description: "State",
            example: "CA",
          },
          zipCode: {
            type: "string",
            description: "ZIP code",
            example: "94102",
          },
          amenities: {
            type: "array",
            items: {
              type: "string",
            },
            description: "List of amenities",
            example: ["Pool", "Gym", "Parking"],
          },
          images: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Array of image URLs",
            example: ["http://localhost:3001/uploads/apartments/image1.jpg"],
          },
          isAvailable: {
            type: "boolean",
            description: "Availability status",
            example: true,
          },
          floorPlan: {
            type: "string",
            nullable: true,
            description: "Floor plan image URL",
            example: "http://localhost:3001/uploads/floorplans/plan1.jpg",
          },
          petPolicy: {
            type: "string",
            enum: ["allowed", "not-allowed", "conditional"],
            description: "Pet policy",
            example: "allowed",
          },
          parkingSpaces: {
            type: "integer",
            minimum: 0,
            description: "Number of parking spaces",
            example: 1,
          },
          leaseTerms: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Available lease terms",
            example: ["12 months", "24 months"],
          },
          contactEmail: {
            type: "string",
            format: "email",
            description: "Contact email",
            example: "contact@example.com",
          },
          contactPhone: {
            type: "string",
            description: "Contact phone",
            example: "+1234567890",
          },
          virtualTourUrl: {
            type: "string",
            nullable: true,
            description: "Virtual tour URL",
            example: "https://virtualtour.example.com",
          },
          userId: {
            type: "string",
            description: "ID of user who created this apartment",
            example: "64a1b2c3d4e5f6789012345a",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update timestamp",
          },
        },
      },
      ApartmentCreate: {
        type: "object",
        required: [
          "unitName",
          "unitNumber",
          "project",
          "description",
          "bedrooms",
          "bathrooms",
          "squareFootage",
          "price",
          "address",
          "city",
          "state",
          "zipCode",
          "petPolicy",
          "parkingSpaces",
          "leaseTerms",
          "contactEmail",
          "contactPhone",
        ],
        properties: {
          unitName: {
            type: "string",
            description: "Apartment unit name",
            example: "Luxury Studio A1",
          },
          unitNumber: {
            type: "string",
            description: "Apartment unit number",
            example: "A101",
          },
          project: {
            type: "string",
            description: "Project name",
            example: "Sunset Towers",
          },
          description: {
            type: "string",
            description: "Detailed apartment description",
            example: "Beautiful modern studio with city views...",
          },
          bedrooms: {
            type: "integer",
            minimum: 0,
            description: "Number of bedrooms",
            example: 1,
          },
          bathrooms: {
            type: "number",
            minimum: 0,
            description: "Number of bathrooms",
            example: 1.5,
          },
          squareFootage: {
            type: "integer",
            minimum: 1,
            description: "Square footage",
            example: 800,
          },
          price: {
            type: "number",
            minimum: 0,
            description: "Monthly rent price",
            example: 2500,
          },
          address: {
            type: "string",
            description: "Street address",
            example: "123 Main Street",
          },
          city: {
            type: "string",
            description: "City",
            example: "San Francisco",
          },
          state: {
            type: "string",
            description: "State",
            example: "CA",
          },
          zipCode: {
            type: "string",
            description: "ZIP code",
            example: "94102",
          },
          amenities: {
            type: "array",
            items: {
              type: "string",
            },
            description: "List of amenities",
            example: ["Pool", "Gym", "Parking"],
          },
          isAvailable: {
            type: "boolean",
            description: "Availability status",
            example: true,
          },
          petPolicy: {
            type: "string",
            enum: ["allowed", "not-allowed", "conditional"],
            description: "Pet policy",
            example: "allowed",
          },
          parkingSpaces: {
            type: "integer",
            minimum: 0,
            description: "Number of parking spaces",
            example: 1,
          },
          leaseTerms: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Available lease terms",
            example: ["12 months", "24 months"],
          },
          contactEmail: {
            type: "string",
            format: "email",
            description: "Contact email",
            example: "contact@example.com",
          },
          contactPhone: {
            type: "string",
            description: "Contact phone",
            example: "+1234567890",
          },
          virtualTourUrl: {
            type: "string",
            nullable: true,
            description: "Virtual tour URL",
            example: "https://virtualtour.example.com",
          },
        },
      },
      ApartmentStats: {
        type: "object",
        properties: {
          totalApartments: {
            type: "integer",
            description: "Total number of apartments",
            example: 150,
          },
          availableApartments: {
            type: "integer",
            description: "Number of available apartments",
            example: 45,
          },
          averagePrice: {
            type: "number",
            description: "Average rental price",
            example: 2850.5,
          },
          priceRange: {
            type: "object",
            properties: {
              min: {
                type: "number",
                example: 1200,
              },
              max: {
                type: "number",
                example: 8500,
              },
            },
          },
          cityDistribution: {
            type: "array",
            items: {
              type: "object",
              properties: {
                city: {
                  type: "string",
                  example: "San Francisco",
                },
                count: {
                  type: "integer",
                  example: 25,
                },
              },
            },
          },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Indicates if the request was successful",
            example: true,
          },
          data: {
            description: "Response data (varies by endpoint)",
          },
          message: {
            type: "string",
            description: "Success or info message",
            example: "Operation completed successfully",
          },
          pagination: {
            $ref: "#/components/schemas/Pagination",
          },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            description: "Error message",
            example: "Validation failed",
          },
          error: {
            type: "string",
            description: "Detailed error information",
            example: "Invalid email format",
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            description: "Current page number",
            example: 1,
          },
          limit: {
            type: "integer",
            description: "Number of items per page",
            example: 10,
          },
          total: {
            type: "integer",
            description: "Total number of items",
            example: 150,
          },
          pages: {
            type: "integer",
            description: "Total number of pages",
            example: 15,
          },
        },
      },
      HealthCheck: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Apartments API is running",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "Current server timestamp",
          },
          uptime: {
            type: "number",
            description: "Server uptime in seconds",
            example: 3600,
          },
        },
      },
    },
  },
};

const options: Options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/index.ts"], // paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

export default specs;
