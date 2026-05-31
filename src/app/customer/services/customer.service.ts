import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  // In-memory data for demo. Replace with real API endpoints.
  private customers: Customer[] = [
    { id: 1, name: 'Amrita Sen', mobile: '9876543210', address: '123 Park Lane, City' }
  ];

  constructor(private http: HttpClient) {}

  // Placeholder for real API call:
  // return this.http.get<Customer>(`/api/customers/${mobile}`)
  fetchByMobile(mobile: string): Observable<Customer | null> {
    const found = this.customers.find((c) => c.mobile === mobile) || null;
    return of(found).pipe(delay(500));
  }

  // Placeholder for creating customer via API:
  // return this.http.post<Customer>('/api/customers', data)
  createCustomer(data: Omit<Customer, 'id'>): Observable<Customer> {
    const nextId = this.customers.length
      ? Math.max(...this.customers.map((c) => c.id)) + 1
      : 1;
    const customer: Customer = { id: nextId, ...data };
    this.customers = [...this.customers, customer];
    return of(customer).pipe(delay(500));
  }
}
