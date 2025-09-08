/**
 * User-related TypeScript interfaces and types
 */

import { Document } from "mongoose";

// Base user interface for the application
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  // Method to compare passwords
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User data for registration (without password hash)
export interface IUserRegistration {
  name: string;
  email: string;
  password: string;
  phone: string;
}

// User data for login
export interface IUserLogin {
  email: string;
  password: string;
}

// User data returned in responses (without password)
export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

// JWT payload structure
export interface IJWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Authentication response with token
export interface IAuthResponse {
  token: string;
  user: IUserResponse;
}

// Request with authenticated user
export interface IAuthRequest extends Request {
  user?: IUserResponse;
}
