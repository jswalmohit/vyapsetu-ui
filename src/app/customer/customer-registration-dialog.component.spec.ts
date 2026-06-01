import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CustomerRegistrationDialogComponent } from './customer-registration-dialog.component';

describe('CustomerRegistrationDialogComponent', () => {
  let fixture: ComponentFixture<CustomerRegistrationDialogComponent>;
  let component: CustomerRegistrationDialogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerRegistrationDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerRegistrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should preload the phone number and preserve ten digits only', () => {
    component.initialPhone = 'abc1234567890';
    component.ngOnChanges({
      initialPhone: {
        currentValue: 'abc1234567890',
        previousValue: '',
        firstChange: true,
        isFirstChange: () => true
      }
    } as any);

    expect(component.registerForm.get('phoneNumber')?.value).toBe('1234567890');
  });

  it('should require address in edit mode', () => {
    component.mode = 'edit';
    component.initialPhone = '1234567890';
    component.ngOnChanges({
      mode: {
        currentValue: 'edit',
        previousValue: 'register',
        firstChange: false,
        isFirstChange: () => false
      },
      initialPhone: {
        currentValue: '1234567890',
        previousValue: '',
        firstChange: true,
        isFirstChange: () => true
      }
    } as any);

    component.registerForm.get('customerName')?.setValue('Eva');
    component.registerForm.get('address')?.setValue('');

    component.submit();

    expect(component.registerForm.invalid).toBe(true);
  });

  it('should emit save event when form is valid', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    component.initialPhone = '1234567890';
    component.ngOnChanges({
      initialPhone: {
        currentValue: '1234567890',
        previousValue: '',
        firstChange: true,
        isFirstChange: () => true
      }
    } as any);

    component.registerForm.get('customerName')?.setValue('Frank');
    component.registerForm.get('address')?.setValue('');

    component.submit();

    expect(saveSpy).toHaveBeenCalledWith({
      customerName: 'Frank',
      phoneNumber: '1234567890',
      address: ''
    });
  });
});
