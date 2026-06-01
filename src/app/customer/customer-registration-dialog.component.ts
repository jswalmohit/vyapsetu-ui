import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-customer-registration-dialog',
  templateUrl: './customer-registration-dialog.component.html',
  styleUrls: ['./customer-registration-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class CustomerRegistrationDialogComponent implements OnChanges {
  @Input() initialPhone = '';
  @Input() initialAddress = '';
  @Input() mode: 'register' | 'edit' = 'register';
  @Input() isLoading = false;
  @Input() errorMessage?: string;
  @Output() save = new EventEmitter<{ customerName: string; phoneNumber: string; address?: string }>();
  @Output() cancel = new EventEmitter<void>();

  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      customerName: ['', Validators.required],
      phoneNumber: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialPhone) {
      const phone = (changes.initialPhone.currentValue ?? '').toString().replace(/\D/g, '').slice(0, 10);
      this.registerForm.get('phoneNumber')?.setValue(phone);
    }

    if (changes.initialAddress && this.mode === 'edit') {
      this.registerForm.get('address')?.setValue(this.initialAddress || '');
    }

    if (changes.mode) {
      const addressControl = this.registerForm.get('address');
      if (this.mode === 'edit') {
        addressControl?.setValidators([Validators.required]);
      } else {
        addressControl?.clearValidators();
      }
      addressControl?.updateValueAndValidity({ emitEvent: false });
    }
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const customerName = this.registerForm.get('customerName')?.value?.toString().trim() ?? '';
    const phoneNumber = this.registerForm.get('phoneNumber')?.value?.toString() ?? '';
    const address = this.registerForm.get('address')?.value?.toString().trim() ?? undefined;
    this.save.emit({ customerName, phoneNumber, address });
  }

  get customerNameControl() {
    return this.registerForm.get('customerName');
  }

  get addressControl() {
    return this.registerForm.get('address');
  }
}
