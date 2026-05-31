import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Customer } from '../models/customer.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly CUSTOMER_ENDPOINT = '/api/customers';
  private apiUrl = `${environment.baseUrl}${this.CUSTOMER_ENDPOINT}`;

  // In-memory data for demo. Replace with real API endpoints.
  private customers: Customer[] = [
    { id: 1, name: 'Amrita Sen', mobile: '9876543210', address: '123 Park Lane, City' }
  ];

  constructor(private http: HttpClient) {}

  // Fetch customer by mobile number
  // API: GET /api/customers/:mobile
  fetchByMobile(mobile: string): Observable<Customer | null> {
    return this.http.get<Customer | null>(`${this.apiUrl}/${mobile}`);
    // Fallback in-memory for demo:
    // const found = this.customers.find((c) => c.mobile === mobile) || null;
    // return of(found).pipe(delay(500));
  }

  // Create a new customer
  // API: POST /api/customers
  createCustomer(data: Omit<Customer, 'id'>): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}`, data);
    // Fallback in-memory for demo:
    // const nextId = this.customers.length
    //   ? Math.max(...this.customers.map((c) => c.id)) + 1
    //   : 1;
    // const customer: Customer = { id: nextId, ...data };
    // this.customers = [...this.customers, customer];
    // return of(customer).pipe(delay(500));
  }

  // Get all customers
  // API: GET /api/customers
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}`);
  }

  // Update customer
  // API: PUT /api/customers/:id
  updateCustomer(id: number, data: Omit<Customer, 'id'>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, data);
  }

  // Delete customer
  // API: DELETE /api/customers/:id
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
