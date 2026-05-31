# Environment Configuration Guide

## Overview
This project uses environment-specific configuration files to manage different base URLs for development and production environments.

## Environment Files

### 1. `src/environments/environment.ts` (Default/Development)
- **Base URL**: `https://localhost:7050`
- **Use Case**: Local development against local backend
- **File Replacement**: Used when building with `development` configuration

### 2. `src/environments/environment.prod.ts` (Production/DEV)
- **Base URL**: `https://vyap-hqpi.onrender.com`
- **Use Case**: Production/DEV environment
- **File Replacement**: Used when building with `production` configuration

### 3. `src/environments/environment.local.ts` (Local Alternative)
- **Base URL**: `https://localhost:7050`
- **Use Case**: Alternative local environment configuration

## Build Configurations

### Development Build
```bash
npm start
# or
ng serve
```
- Uses `environment.ts`
- Base URL: `https://localhost:7050`

### Production Build
```bash
npm run build
# or
ng build --configuration=production
```
- Uses `environment.prod.ts`
- Base URL: `https://vyap-hqpi.onrender.com`

## API Endpoints

### Base URLs
Both environments use these relative API endpoints:

```typescript
{
  customers: '/api/customers',
  products: '/api/products'
}
```

### Customer Service Endpoints
- **GET** `{baseUrl}/api/customers` - Get all customers
- **GET** `{baseUrl}/api/customers/:mobile` - Get customer by mobile number
- **POST** `{baseUrl}/api/customers` - Create new customer
- **PUT** `{baseUrl}/api/customers/:id` - Update customer
- **DELETE** `{baseUrl}/api/customers/:id` - Delete customer

### Product Service Endpoints
- **GET** `{baseUrl}/api/products` - Get all products
- **GET** `{baseUrl}/api/products/:id` - Get product by ID
- **POST** `{baseUrl}/api/products` - Create new product
- **PUT** `{baseUrl}/api/products/:id` - Update product
- **DELETE** `{baseUrl}/api/products/:id` - Delete product

## Updated Services

### CustomerService
Located at: `src/app/customer/services/customer.service.ts`

Key methods:
- `getCustomers()` - Fetch all customers
- `fetchByMobile(mobile: string)` - Fetch customer by mobile number
- `createCustomer(data)` - Create new customer
- `updateCustomer(id, data)` - Update existing customer
- `deleteCustomer(id)` - Delete customer

### ProductService
Located at: `src/app/product/services/product.service.ts`

Key methods:
- `getProducts()` - Fetch all products
- `getProductById(id)` - Fetch product by ID
- `addProduct(data)` - Create new product
- `updateProduct(id, data)` - Update existing product
- `deleteProduct(id)` - Delete product

## Configuration Structure

```typescript
// Environment file structure
export const environment = {
  production: boolean,        // Whether this is production build
  baseUrl: string,           // Base URL for API calls
  apiEndpoints: {
    customers: string,       // Customers endpoint path
    products: string         // Products endpoint path
  }
};
```

## Accessing Environment Variables

In any service or component:

```typescript
import { environment } from '../../../environments/environment';

// Access base URL
const apiUrl = environment.baseUrl;

// Access full endpoint
const customersUrl = `${environment.baseUrl}${environment.apiEndpoints.customers}`;
```

## Adding More Services

When adding new services, follow this pattern:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class YourService {
  private apiUrl = `${environment.baseUrl}/api/your-endpoint`;

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }
}
```

## Notes

- HttpClient is provided globally in `app.config.ts` using `provideHttpClient()`
- All services now use Observable-based API calls instead of in-memory data
- File replacements in `angular.json` automatically swap environment files based on build configuration
- The environment configuration is set at build time, not runtime
