import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CustomerComponent } from './customer.component';
import { CustomerService } from './services/customer.service';
import { ProductService } from '../product/services/product.service';
import { LoadingService } from '../services/loading.service';
import { CustomerModule } from './customer.module';
import { Customer } from './models/customer.model';

describe('CustomerComponent', () => {
  let fixture: ComponentFixture<CustomerComponent>;
  let component: CustomerComponent;
  let customerService: any;
  let productService: any;

  beforeEach(async () => {
    customerService = {
      getCustomerByPhone: vi.fn(),
      createCustomer: vi.fn(),
      updateCustomer: vi.fn()
    };
    productService = {
      getProducts: vi.fn()
    };
    productService.getProducts.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [CustomerModule, RouterTestingModule],
      providers: [
        { provide: CustomerService, useValue: customerService },
        { provide: ProductService, useValue: productService },
        LoadingService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should normalize mobile input to digits and limit to ten characters', () => {
    const event = { target: { value: 'abc12345678901' } } as unknown as Event;
    component.onMobileInput(event);
    expect(component.mobileControl.value).toBe('1234567890');
    expect((event.target as HTMLInputElement).value).toBe('1234567890');
  });

  it('should normalize pasted mobile values and prevent default paste behavior', () => {
    const clipboardData = { getData: () => 'a1b2c345678901' };
    const preventDefault = vi.fn();
    const event = { clipboardData, preventDefault } as unknown as ClipboardEvent;

    component.onMobilePaste(event);

    expect(preventDefault).toHaveBeenCalled();
    expect(component.mobileControl.value).toBe('1234567890');
  });

  it('should not call API when mobile input is invalid', () => {
    component.fetchForm.setValue({ mobile: '123' });
    component.fetchCustomer();

    expect(customerService.getCustomerByPhone).not.toHaveBeenCalled();
    expect(component.fetchForm.invalid).toBe(true);
  });

  it('should open registration dialog when no customers are found', () => {
    customerService.getCustomerByPhone.mockReturnValue(of({ count: 0, customers: [] }));
    component.fetchForm.setValue({ mobile: '1234567890' });

    component.fetchCustomer();

    expect(customerService.getCustomerByPhone).toHaveBeenCalledWith('1234567890');
    expect(component.modalState).toBe('register');
    expect(component.registrationPhone).toBe('1234567890');
    expect(component.showCustomerModal).toBe(true);
  });

  it('should select the single matching customer when customer search returns one match', () => {
    const foundCustomer: Customer = {
      id: 1,
      name: 'Alice',
      mobile: '1234567890',
      address: ''
    };
    customerService.getCustomerByPhone.mockReturnValue(of({ count: 1, customers: [foundCustomer] }));
    component.fetchForm.setValue({ mobile: '1234567890' });

    component.fetchCustomer();

    expect(component.customer).toEqual(foundCustomer);
    expect(component.matchingCustomers).toEqual([foundCustomer]);
    expect(component.modalState).toBe('found');
  });

  it('should show success notification after creating a customer', () => {
    const createdCustomer: Customer = {
      id: 2,
      name: 'Bob',
      mobile: '0987654321',
      address: ''
    };
    customerService.createCustomer.mockReturnValue(of(createdCustomer));
    component.modalState = 'fetch';

    component.handleDialogSave({ customerName: 'Bob', phoneNumber: '0987654321' });

    expect(customerService.createCustomer).toHaveBeenCalledWith({
      customerName: 'Bob',
      phoneNumber: '0987654321'
    });
    expect(component.customer).toEqual(createdCustomer);
    expect(component.modalState).toBe('found');
    expect(component.showCustomerModal).toBe(false);
    expect(component.notificationType).toBe('success');
  });

  it('should set dialogErrorMessage when customer registration fails', () => {
    customerService.createCustomer.mockReturnValue(throwError(() => new Error('server error')));
    component.modalState = 'fetch';

    component.handleDialogSave({ customerName: 'Bob', phoneNumber: '0987654321' });

    expect(component.dialogErrorMessage).toBe('Unable to register customer. Please try again.');
  });

  it('should select a customer and set found state', () => {
    const customer: Customer = { id: 3, name: 'Carol', mobile: '1112223333', address: '' };

    component.selectCustomer(customer);

    expect(component.customer).toEqual(customer);
    expect(component.modalState).toBe('found');
    expect(component.matchingCustomers).toEqual([customer]);
  });

  it('should open edit profile modal when customer exists', () => {
    component.customer = { id: 4, name: 'Dana', mobile: '2223334444', address: '' };
    component.editProfile();

    expect(component.modalState).toBe('profile');
    expect(component.registrationPhone).toBe('2223334444');
    expect(component.showCustomerModal).toBe(true);
  });

  it('should close modal and reset state when continueShopping is called', () => {
    component.showCustomerModal = true;
    component.modalState = 'found';

    component.continueShopping();

    expect(component.showCustomerModal).toBe(false);
    expect(component.modalState).toBe('fetch');
  });
});
