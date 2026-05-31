import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from './services/customer.service';
import { Customer } from './models/customer.model';
import { ProductService } from '../product/services/product.service';
import { Product } from '../product/models/product.model';

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
  showCustomerModal = true; // open on page load
  modalState: 'fetch' | 'found' | 'register' = 'fetch';

  // Forms
  fetchForm: FormGroup;
  registerForm: FormGroup;

  // Customer
  customer?: Customer;

  // Products & selection
  products: Product[] = [];
  filteredProducts: Product[] = [];
  productSearch = '';

  // Cart
  cart: CartItem[] = [];

  // Bill
  showBill = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private productService: ProductService
  ) {
    this.fetchForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      mobile: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // load products from ProductService
    this.products = this.productService.getProducts();
    this.filteredProducts = [...this.products];

    // modal opens automatically; modalState defaults to 'fetch'
  }

  // Fetch flow
  fetchCustomer(): void {
    const mobile = this.fetchForm.value.mobile?.toString().trim();
    if (!mobile) return;
    this.customerService.fetchByMobile(mobile).subscribe((cust) => {
      if (cust) {
        this.customer = cust;
        this.modalState = 'found';
      } else {
        this.modalState = 'register';
        this.registerForm.patchValue({ mobile });
      }
    });
  }

  // Create new customer
  createCustomer(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const data = this.registerForm.value;
    this.customerService.createCustomer({
      name: data.name,
      address: data.address,
      mobile: data.mobile
    }).subscribe((created) => {
      this.customer = created;
      this.closeModal();
    });
  }

  continueShopping(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.showCustomerModal = false;
    this.modalState = 'fetch';
  }

  // Profile edit (simple inline editing via modal reuse)
  editProfile(): void {
    if (!this.customer) return;
    this.modalState = 'register';
    this.registerForm.setValue({
      name: this.customer.name,
      address: this.customer.address,
      mobile: this.customer.mobile
    });
    this.showCustomerModal = true;
  }

  // Product search
  onProductSearch(value: string): void {
    this.productSearch = value.toLowerCase().trim();
    this.filteredProducts = this.products.filter((p) =>
      p.productName.toLowerCase().includes(this.productSearch) ||
      p.productId.toLowerCase().includes(this.productSearch)
    );
  }

  // Cart operations
  addToCart(product: Product): void {
    const existing = this.cart.find((c) => c.product.id === product.id);
    if (existing) {
      if (existing.quantity < product.quantity) existing.quantity += 1;
      return;
    }
    if (product.quantity <= 0) return;
    this.cart.push({ product, quantity: 1 });
  }

  increaseQty(item: CartItem): void {
    if (item.quantity < item.product.quantity) item.quantity += 1;
  }

  decreaseQty(item: CartItem): void {
    if (item.quantity > 1) item.quantity -= 1;
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
    // In a real app, this would call a backend to create an order/invoice.
    this.showBill = true;
  }
}
