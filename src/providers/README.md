# Provider System

Hệ thống provider cho các white-label widget (CCS Calculator, In‑Person Tour, ...) - đã được tối ưu và refactor.

## 📁 Cấu trúc thư mục

```
src/providers/
├── index.tsx             # Main provider logic, components & theme wrapper
├── provider-theme.ts     # Theme system & CSS variables
├── provider-service.ts   # Service layer & business logic
└── README.md             # Documentation
```

## 🔧 Thành phần chính

### `index.tsx`
- **ThemeProvider component** - Next.js theme wrapper (next-themes integration)
- **ProviderConfig interface** - TypeScript definitions
- **useProviderConfig hook** - React hook for provider state
- **ProviderLayout component** - Layout with header, main, footer
- **fetchConfig function** - External API integration
- **defaultConfig** - Care for Kids default configuration

### `provider-theme.ts`
- **useProviderTheme hook** - Dynamic theme application
- **CSS Variables** - Provider-specific styling
- **Contrast calculation** - WCAG-compliant text colors
- **Utility functions** - Access provider config from CSS

### `provider-service.ts`
- **Business logic** - Provider configuration logic
- **Mock data** - Development fallback data
- **Helper functions** - Domain matching, license validation
- **Service layer** - Separated from UI components

## 🚀 Cách sử dụng

### Import
```typescript
import { useProviderConfig, ProviderLayout, ThemeProvider } from '@/providers';
```

### Trong layout.tsx
```typescript
import { ThemeProvider, ProviderLayout } from '@/providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ProviderLayout>
          {children}
        </ProviderLayout>
      </body>
    </html>
  );
}
```

### Trong component
```typescript
import { useProviderConfig } from '@/providers';

function MyComponent() {
  const { config, loading, error } = useProviderConfig();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{config?.customerName}</h1>
      {/* Your content */}
    </div>
  );
}
```

## 🎨 Provider Configuration

### Database Schema
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

### TypeScript Interface
```typescript
interface ProviderConfig {
  id: number;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  payingLicense: boolean;
  domain: string;
  primaryColour: string;
  secondaryColour: string;
  accentColour: string;
  fontFamily: string;
  logo: string;
  resultFeature: number;
  resultFeatureData: string;
  created: string;
}
```

## 🔄 Flow hoạt động

1. **URL**: `?id=1` (single parameter as per client feedback)
2. **ProviderLayout**: Tự động extract ID từ URL
3. **useProviderConfig**: Fetch config từ external API by ID
4. **Domain Validation**: Kiểm tra domain match để prevent copy-paste
5. **useProviderTheme**: Áp dụng colors, fonts vào CSS variables
6. **Render**: Hiển thị UI với provider branding

## ✨ Đặc điểm

- **Clean Architecture** - Separation of concerns
- **Type Safety** - Full TypeScript support
- **External API** - Ready for backend integration
- **Fallback System** - Graceful error handling
- **Theme System** - Dynamic CSS variables
- **Service Layer** - Reusable business logic
- **Responsive** - Loading và error states
- **SEO Ready** - Proper meta tags và branding

## 🔧 API Integration

### Required Endpoints
- `GET /api/provider-config?id={providerId}` - Provider configuration by ID
- `POST /api/ccs/calculate` - CCS calculation
- `GET /api/provider/results?id={providerId}` - Provider-specific results

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://api.careforkids.com.au
```

## 📝 Development

### Testing
```bash
# Test with provider ID
curl "http://localhost:3000?id=1"

# Test theme system
curl "http://localhost:3000/theme-test"
```

### Mock Data
- Development fallback in `provider-service.ts`
- Default Care for Kids config
- Graceful API failure handling
