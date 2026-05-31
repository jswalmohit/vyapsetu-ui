import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly PRODUCT_ENDPOINT = '/api/Products';
  private apiUrl = `${environment.baseUrl}${this.PRODUCT_ENDPOINT}`;

  // In-memory data for demo
  private products: Product[] = [];

  constructor(private http: HttpClient) {}

  // Get all products
  // API: GET /api/products
  getProducts(): Observable<Product[]> {
    return this.http
      .get<ApiResponse<Product[]>>(`${this.apiUrl}`)
      .pipe(map((response) => response.data));
  }

  // Get product by ID
  // API: GET /api/products/:id
  getProductById(id: number): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  // Add new product
  // API: POST /api/products
  addProduct(data: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}`, data);
  }

  // Update product
  // API: PUT /api/products/:id
  updateProduct(id: number, data: Omit<Product, 'id'>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
  }

  // Delete product
  // API: DELETE /api/products/:id
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

