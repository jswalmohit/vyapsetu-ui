import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { CustomerService, CustomerSearchResult } from './services/customer.service';
import { Customer } from './models/customer.model';
import { ProductService } from '../product/services/product.service';
import { Product } from '../product/models/product.model';
import { LoadingService } from '../services/loading.service';

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  standalone: false,
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  // Modal and flow state
  showCustomerModal = true;
  modalState: 'fetch' | 'found' | 'register' | 'profile' = 'fetch';

  // Forms
  fetchForm: FormGroup;

  // Customer
  customer?: Customer;
  matchingCustomers: Customer[] = [];
  registrationPhone = '';

  // Notifications
  notificationMessage?: string;
  notificationType?: 'success' | 'error' | 'info';
  dialogErrorMessage?: string;

  // Products & selection
  products: Product[] = [];
  filteredProducts: Product[] = [];
  productSearch = '';
  loadingProducts = true;

  // Cart
  cart: CartItem[] = [];

  // Bill
  showBill = false;

  // button-level actions
  fetchAction$ = null as unknown as import('rxjs').Observable<boolean>;
  createAction$ = null as unknown as import('rxjs').Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private productService: ProductService,
    private loading: LoadingService
  ) {
    this.fetchForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/), Validators.minLength(10), Validators.maxLength(10)]]
    });

    this.fetchAction$ = this.loading.actionStatus$('fetchCustomer');
    this.createAction$ = this.loading.actionStatus$('createCustomer');
  }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(
      (products) => {
        this.products = products;
        this.loadingProducts = false;
        this.applyProductFilter();
      },
      () => {
        this.loadingProducts = false;
      }
    );
  }

  get mobileControl(): AbstractControl {
    return this.fetchForm.get('mobile') as AbstractControl;
  }

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = digits;
    this.mobileControl.setValue(digits, { emitEvent: false });
  }

  onMobilePaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digits = pasted.replace(/\D/g, '').slice(0, 10);
    event.preventDefault();
    this.mobileControl.setValue(digits);
  }

  clearNotifications(): void {
    this.notificationMessage = undefined;
    this.notificationType = undefined;
    this.dialogErrorMessage = undefined;
  }

  private setNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.notificationMessage = message;
    this.notificationType = type;
  }

  private showError(message: string): void {
    this.setNotification(message, 'error');
  }

  private showSuccess(message: string): void {
    this.setNotification(message, 'success');
  }

  fetchCustomer(): void {
    if (this.fetchForm.invalid) {
      this.fetchForm.markAllAsTouched();
      return;
    }

    const mobile = this.mobileControl.value?.toString().trim();
    if (!mobile) {
      this.showError('Enter a valid 10-digit phone number before searching.');
      return;
    }

    this.clearNotifications();
    this.loading
      .track(
        this.customerService.getCustomerByPhone(mobile).pipe(
          catchError(() => {
            this.showError('Unable to fetch customer. Please try again.');
            return of({ count: 0, customers: [] } as CustomerSearchResult);
          })
        ),
        'fetchCustomer'
      )
      .subscribe((result) => {
        if (result?.customers?.length) {
          this.matchingCustomers = result.customers;
          if (result.customers.length === 1) {
            this.customer = result.customers[0];
          }
          this.modalState = 'found';
        } else {
          this.openRegistrationDialog(mobile);
        }
      });
  }

  openRegistrationDialog(phone: string): void {
    this.clearNotifications();
    this.registrationPhone = phone;
    this.modalState = 'register';
    this.showCustomerModal = true;
  }

  handleDialogSave(payload: { customerName: string; phoneNumber: string; address?: string }): void {
    this.dialogErrorMessage = undefined;
    if (this.modalState === 'profile' && this.customer) {
      this.updateCustomer(payload);
      return;
    }

    this.loading
      .track(
        this.customerService.createCustomer({
          customerName: payload.customerName,
          phoneNumber: payload.phoneNumber
        }).pipe(
          catchError(() => {
            this.dialogErrorMessage = 'Unable to register customer. Please try again.';
            return of(null);
          })
        ),
        'createCustomer'
      )
      .subscribe((created) => {
        if (!created) {
          return;
        }

        this.customer = created;
        this.matchingCustomers = [created];
        this.modalState = 'found';
        this.showCustomerModal = false;
        this.showSuccess('Customer registered successfully.');
      });
  }

  private updateCustomer(payload: { customerName: string; phoneNumber: string; address?: string }): void {
    if (!this.customer) {
      return;
    }

    this.loading
      .track(
        this.customerService.updateCustomer(this.customer.id, {
          name: payload.customerName,
          address: payload.address ?? this.customer.address,
          mobile: this.customer.mobile
        }).pipe(
          catchError(() => {
            this.dialogErrorMessage = 'Unable to update customer. Please try again.';
            return of(null);
          })
        ),
        'createCustomer'
      )
      .subscribe((updated) => {
        if (!updated) {
          return;
        }

        this.customer = updated;
        this.matchingCustomers = [updated];
        this.modalState = 'found';
        this.showCustomerModal = false;
        this.showSuccess('Customer profile updated successfully.');
      });
  }

  selectCustomer(customer: Customer): void {
    this.customer = customer;
    this.modalState = 'found';
    this.matchingCustomers = [customer];
  }

  continueShopping(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.showCustomerModal = false;
    this.modalState = 'fetch';
    this.clearNotifications();
  }

  // Profile edit (simple inline editing via modal reuse)
  editProfile(): void {
    if (!this.customer) {
      return;
    }

    this.clearNotifications();
    this.modalState = 'profile';
    this.registrationPhone = this.customer.mobile;
    this.showCustomerModal = true;
  }

  // Product search
  onProductSearch(value: string): void {
    this.productSearch = (value ?? '').toLowerCase().trim();
    this.applyProductFilter();
  }

  private applyProductFilter(): void {
    const search = this.productSearch;
    this.filteredProducts = search
      ? this.products.filter((p) =>
          p.productName.toLowerCase().includes(search) || p.productId.toLowerCase().includes(search)
        )
      : [...this.products];
  }

  // Cart operations
  addToCart(product: Product): void {
    const existing = this.cart.find((c) => c.product.id === product.id);
    if (existing) {
      if (existing.quantity < product.quantity) {
        existing.quantity += 1;
      }
      return;
    }
    if (product.quantity <= 0) {
      return;
    }
    this.cart.push({ product, quantity: 1 });
  }

  increaseQty(item: CartItem): void {
    if (item.quantity < item.product.quantity) {
      item.quantity += 1;
    }
  }

  decreaseQty(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity -= 1;
    }
  }

  removeItem(item: CartItem): void {
    this.cart = this.cart.filter((c) => c !== item);
  }

  // Billing calculations
  get subtotal(): number {
    return this.cart.reduce((s, c) => s + c.product.costPrice * c.quantity, 0);
  }

  get totalGst(): number {
    return this.cart.reduce((s, c) => s + (c.product.costPrice * c.quantity * c.product.gst) / 100, 0);
  }

  get grandTotal(): number {
    return this.subtotal + this.totalGst;
  }

  generateBill(): void {
    this.showBill = true;
  }
}
