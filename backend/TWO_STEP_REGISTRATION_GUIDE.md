# Two-Step Registration System Guide

## Overview
This document explains the two-step registration system implemented for the Ayurvedic Herbs Supply Chain Tracking System, which matches the UI mockups you provided.

## Registration Flow

### Step 1: Initial Registration
**Endpoint**: `POST /api/auth/register`

**Purpose**: User provides email, password, and role to get a JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "farmer" // farmer, manufacturer, tester, customer, regulator
}
```

**Response**:
```json
{
  "success": true,
  "message": "Initial registration successful! Please complete your profile.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "registrationStep": 1,
  "nextStep": "Complete role-specific registration",
  "role": "farmer"
}
```

**What happens**:
- User gets a temporary JWT token
- User is stored in `pendingRegistrations` array
- User can now access role-specific registration form

### Step 2: Role-Specific Registration
**Endpoint**: `POST /api/auth/complete-registration`

**Purpose**: User fills role-specific form with basic details

**Headers**: `Authorization: Bearer <JWT_TOKEN_FROM_STEP_1>`

**Request Body** (varies by role):

#### Farmer Registration
```json
{
  "farmerName": "John Doe",
  "contactInfo": {
    "phone": "+91-9876543210",
    "address": "Farm Address, Kerala"
  },
  "licenseNumber": "FARM123456",
  "farmLocation": {
    "latitude": 10.8505,
    "longitude": 76.2711,
    "address": "Farm Location, Kerala"
  },
  "herbTypes": ["Tulsi", "Ashwagandha"],
  "experience": "5 years",
  "certifications": ["Organic Certified", "GAP Certified"]
}
```

#### Manufacturer Registration
```json
{
  "companyName": "Herb Processing Co.",
  "gmpLicense": "GMP789012",
  "facilityLocation": {
    "address": "Industrial Area, Kochi",
    "coordinates": { "latitude": 10.0168, "longitude": 76.3558 }
  },
  "contactInfo": {
    "phone": "+91-9876543211",
    "email": "contact@herbprocessing.com"
  },
  "processingCapabilities": ["Solar Drying", "Powdering"],
  "certifications": ["GMP Certified", "ISO 22000"]
}
```

#### Tester Registration
```json
{
  "labName": "Quality Lab Inc.",
  "nablAccreditation": "NABL123456",
  "labLocation": {
    "address": "Lab Complex, Bangalore",
    "coordinates": { "latitude": 12.9716, "longitude": 77.5946 }
  },
  "contactInfo": {
    "phone": "+91-9876543212",
    "email": "info@qualitylab.com"
  },
  "testingCapabilities": ["Chemical Analysis", "Microbiological Testing"],
  "certifications": ["NABL Accredited", "ISO 17025"]
}
```

#### Customer Registration
```json
{
  "customerName": "Jane Smith",
  "contactInfo": {
    "phone": "+91-9876543213",
    "address": "Customer Address, Mumbai"
  },
  "preferences": {
    "herbTypes": ["Tulsi", "Neem"],
    "notifications": true
  }
}
```

#### Regulator Registration
```json
{
  "regulatorName": "Food Safety Authority",
  "department": "Quality Control",
  "jurisdiction": "Kerala",
  "contactInfo": {
    "phone": "+91-9876543214",
    "email": "regulator@fsa.gov.in"
  },
  "authorityLevel": "INSPECTOR"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Registration completed successfully! Your account is pending verification.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "registrationStep": 2,
  "isComplete": true,
  "isVerified": false,
  "userId": "FARMER_1703123456_abc123",
  "nextStep": "Account verification pending"
}
```

**What happens**:
- User details are validated based on role
- User is moved from `pendingRegistrations` to `users` array
- User gets a new JWT token with complete registration status
- User account is marked as `isVerified: false` (pending verification)

## User Verification System

### For Admin/Regulator: View Pending Verifications
**Endpoint**: `GET /api/auth/pending-verifications`

**Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`

**Response**:
```json
{
  "success": true,
  "message": "Pending verifications retrieved successfully",
  "data": {
    "users": [
      {
        "id": "FARMER_1703123456_abc123",
        "email": "farmer@example.com",
        "role": "farmer",
        "farmerName": "John Doe",
        "licenseNumber": "FARM123456",
        "isComplete": true,
        "isVerified": false,
        "verificationStatus": "pending",
        "createdAt": "2024-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalUsers": 5,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### For Admin/Regulator: Verify User
**Endpoint**: `PUT /api/auth/verify-user/:userId`

**Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`

**Request Body**:
```json
{
  "verificationStatus": "approved", // "approved" or "rejected"
  "verificationNotes": "All documents verified successfully"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User verification status updated to: approved",
  "user": {
    "id": "FARMER_1703123456_abc123",
    "email": "farmer@example.com",
    "role": "farmer",
    "isVerified": true,
    "verificationStatus": "approved"
  }
}
```

## Login Flow

### Standard Login
**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (Complete & Verified User):
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "FARMER_1703123456_abc123",
    "email": "farmer@example.com",
    "role": "farmer",
    "isComplete": true,
    "isVerified": true
  }
}
```

**Response** (Incomplete Registration):
```json
{
  "success": false,
  "message": "Registration incomplete. Please complete your profile.",
  "registrationStep": 1,
  "nextStep": "Complete role-specific registration"
}
```

## Registration Status Check

### Check Current Status
**Endpoint**: `GET /api/auth/registration-status`

**Headers**: `Authorization: Bearer <JWT_TOKEN>`

**Response**:
```json
{
  "success": true,
  "data": {
    "registrationStep": 2,
    "isComplete": true,
    "isVerified": false,
    "verificationStatus": "pending",
    "role": "farmer",
    "email": "farmer@example.com"
  }
}
```

## Frontend Integration

### Step 1: Initial Registration Form
```javascript
// Frontend form for step 1
const initialRegistration = async (formData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
      role: formData.role
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store JWT token
    localStorage.setItem('token', data.token);
    // Redirect to role-specific registration form
    window.location.href = `/register/${data.role}`;
  }
};
```

### Step 2: Role-Specific Registration Form
```javascript
// Frontend form for step 2
const completeRegistration = async (roleSpecificData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/auth/complete-registration', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(roleSpecificData)
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Update stored token
    localStorage.setItem('token', data.token);
    // Show verification pending message
    showMessage('Registration complete! Account verification pending.');
  }
};
```

## Data Storage Structure

### Pending Registrations (Step 1)
```javascript
{
  tempUserId: "TEMP_1703123456_abc123",
  email: "user@example.com",
  password: "hashedPassword",
  role: "farmer",
  registrationStep: 1,
  isComplete: false,
  createdAt: "2024-12-01T10:00:00Z"
}
```

### Complete Users (Step 2)
```javascript
{
  id: "FARMER_1703123456_abc123",
  email: "user@example.com",
  password: "hashedPassword",
  role: "farmer",
  farmerName: "John Doe",
  contactInfo: { ... },
  licenseNumber: "FARM123456",
  farmLocation: { ... },
  registrationStep: 2,
  isComplete: true,
  isVerified: false,
  verificationStatus: "pending",
  createdAt: "2024-12-01T10:00:00Z",
  verifiedAt: null,
  verifiedBy: null
}
```

## Security Features

1. **JWT Token Management**: Different tokens for different registration steps
2. **Role Validation**: Strict validation of role-specific data
3. **Password Hashing**: All passwords are securely hashed
4. **Email Uniqueness**: Prevents duplicate registrations
5. **Verification System**: Admin/Regulator approval required
6. **Incomplete Registration Handling**: Users cannot access protected routes until complete

## Error Handling

### Common Error Responses
```json
// Invalid role
{
  "success": false,
  "message": "Invalid role. Must be one of: farmer, manufacturer, tester, customer, regulator"
}

// Email already exists
{
  "success": false,
  "message": "User with this email already exists."
}

// Incomplete role-specific data
{
  "success": false,
  "message": "Invalid role-specific data",
  "errors": ["Farmer name is required", "License number is required"]
}

// Pending registration not found
{
  "success": false,
  "message": "Pending registration not found. Please start registration again."
}
```

This two-step registration system perfectly matches your UI mockups and provides a secure, user-friendly registration process with proper verification controls.
