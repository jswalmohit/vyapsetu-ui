import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-product-add-modal',
  templateUrl: './product-add-modal.component.html',
  styleUrls: ['./product-add-modal.component.scss']
})
export class ProductAddModalComponent {
  @Input() productForm!: FormGroup;
  @Input() modalTitle = 'Add Product';
  @Input() today = '';
  @Input() saveAction$?: Observable<boolean>;

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get f() {
    return this.productForm.controls;
  }

  onSave(): void {
    this.save.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
