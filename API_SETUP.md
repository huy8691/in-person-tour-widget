# API Setup Guide

## Backend API Integration

This Next.js app is configured to work with an external .NET Core API backend.

### API Configuration

The app uses the following configuration:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.careforkids.com.au',
  ENDPOINTS: {
    PROVIDER_CONFIG: '/api/provider-config',
    CCS_CALCULATION: '/api/ccs/calculate',
    PROVIDER_RESULTS: '/api/provider/results',
  },
}
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Production API
NEXT_PUBLIC_API_URL=https://api.careforkids.com.au

# Development API (if different)
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Required API Endpoints

The backend should implement these endpoints:

#### 1. Provider Configuration
```
GET /api/provider-config?id={providerId}
```

**Response:**
```json
{
  "id": 1,
  "customerName": "ABC Childcare",
  "customerContact": "ABC Team",
  "customerEmail": "info@abcchildcare.com",
  "payingLicense": true,
  "domain": "abcchildcare.com",
  "primaryColour": "#2563eb",
  "secondaryColour": "#dbeafe",
  "accentColour": "#3b82f6",
  "fontFamily": "Georgia, serif",
  "logo": "https://example.com/logo.png",
  "resultFeature": 1,
  "resultFeatureData": "{\"centers\": [\"Center 1\", \"Center 2\"]}",
  "created": "2025-09-19T10:00:00Z"
}
```

#### 2. CCS Calculation
```
POST /api/ccs/calculate
```

**Request:**
```json
{
  "familyIncome": 75000,
  "numberOfChildren": 2,
  "children": [
    {
      "age": 4,
      "hoursPerWeek": 40,
      "dailyFee": 120
    }
  ]
}
```

#### 3. Provider Results
```
GET /api/provider/results?id={providerId}&postcode={postcode}
```

### Database Schema

The backend should implement the `CcsCalcWhiteLabelConfig` table:

```sql
CREATE TABLE CcsCalcWhiteLabelConfig (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerName NVARCHAR(2000),
    CustomerContact NVARCHAR(1000),
    CustomerEmail NVARCHAR(1000),
    PayingLicense BIT NOT NULL,
    Domain NVARCHAR(500),
    PrimaryColour NVARCHAR(50),
    SecondaryColour NVARCHAR(50),
    AccentColour NVARCHAR(50),
    FontFamily NVARCHAR(200),
    Logo NVARCHAR(1000),
    ResultFeature INT,
    ResultFeatureData NVARCHAR(1000),
    Created DATETIME
);
```

### Development Mode

For development without backend, you can:

1. Use mock data in `src/providers/provider-service.ts`
2. Set `NEXT_PUBLIC_API_URL=http://localhost:3000` to use local mock
3. The app will fallback to default Care for Kids config if API fails

### Testing

Test the API integration:

```bash
# Test provider config by ID
curl "http://localhost:3000?id=1"

# Test theme system
curl "http://localhost:3000/theme-test"
```

### CORS Configuration

Ensure the backend API allows CORS for the Next.js domain:

```csharp
// In Startup.cs or Program.cs
services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", builder =>
    {
        builder.WithOrigins("http://localhost:3000", "https://tools.careforkids.com.au")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
```
