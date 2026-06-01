import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';
import { environment } from '../../../environments/environment';

export interface CustomerSearchResult {
  count: number;
  customers: Customer[];
}

export interface CreateCustomerRequest {
  customerName: string;
  phoneNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly CUSTOMER_ENDPOINT = '/api/customers';
  private apiUrl = `${environment.baseUrl}${this.CUSTOMER_ENDPOINT}`;

  constructor(private http: HttpClient) {}

  // Search customers by phone number
  // API: GET /api/customers/GetCustomerByPhone?phoneNumber={phoneNumber}
  getCustomerByPhone(phoneNumber: string): Observable<CustomerSearchResult> {
    return this.http.get<CustomerSearchResult>(`${this.apiUrl}/GetCustomerByPhone`, {
      params: { phoneNumber }
    });
  }

  // Create a new customer
  // API: POST /api/customers/CreateCustomer
  createCustomer(data: CreateCustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/CreateCustomer`, data);
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
