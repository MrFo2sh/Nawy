import mongoose, { Schema } from "mongoose";
import { IApartment } from "../types";

const apartmentSchema = new Schema<IApartment>(
  {
    unitName: {
      type: String,
      required: [true, "Unit name is required"],
      trim: true,
      maxlength: [100, "Unit name cannot exceed 100 characters"],
    },
    unitNumber: {
      type: String,
      required: [true, "Unit number is required"],
      trim: true,
      maxlength: [20, "Unit number cannot exceed 20 characters"],
    },
    project: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    bedrooms: {
      type: Number,
      required: [true, "Number of bedrooms is required"],
      min: [0, "Bedrooms cannot be negative"],
      max: [10, "Bedrooms cannot exceed 10"],
    },
    bathrooms: {
      type: Number,
      required: [true, "Number of bathrooms is required"],
      min: [0.5, "Bathrooms must be at least 0.5"],
      max: [10, "Bathrooms cannot exceed 10"],
    },
    squareFootage: {
      type: Number,
      required: [true, "Square footage is required"],
      min: [100, "Square footage must be at least 100"],
      max: [10000, "Square footage cannot exceed 10,000"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [50, "State cannot exceed 50 characters"],
    },
    zipCode: {
      type: String,
      required: [true, "ZIP code is required"],
      trim: true,
      maxlength: [10, "ZIP code cannot exceed 10 characters"],
    },
    amenities: {
      type: [String],
      default: [],
      validate: {
        validator: function (amenities: string[]) {
          return amenities.length <= 20;
        },
        message: "Cannot have more than 20 amenities",
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 10;
        },
        message: "Cannot have more than 10 images",
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    floorPlan: {
      type: String,
      trim: true,
    },
    petPolicy: {
      type: String,
      enum: {
        values: ["allowed", "not-allowed", "conditional"],
        message:
          "Pet policy must be either allowed, not-allowed, or conditional",
      },
      required: [true, "Pet policy is required"],
    },
    parkingSpaces: {
      type: Number,
      required: [true, "Number of parking spaces is required"],
      min: [0, "Parking spaces cannot be negative"],
      max: [10, "Parking spaces cannot exceed 10"],
    },
    leaseTerms: {
      type: [String],
      required: [true, "Lease terms are required"],
      validate: {
        validator: function (terms: string[]) {
          return terms.length > 0;
        },
        message: "At least one lease term is required",
      },
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please provide a valid phone number"],
    },
    virtualTourUrl: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/.*$/,
        "Virtual tour URL must be a valid HTTP/HTTPS URL",
      ],
    },
    // User who created this apartment listing
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better query performance
apartmentSchema.index({
  unitName: "text",
  project: "text",
  description: "text",
});
apartmentSchema.index({ unitNumber: 1, project: 1 }, { unique: true });
apartmentSchema.index({ price: 1 });
apartmentSchema.index({ bedrooms: 1 });
apartmentSchema.index({ bathrooms: 1 });
apartmentSchema.index({ city: 1 });
apartmentSchema.index({ state: 1 });
apartmentSchema.index({ isAvailable: 1 });
apartmentSchema.index({ createdAt: -1 });

export const Apartment = mongoose.model<IApartment>(
  "Apartment",
  apartmentSchema
);
