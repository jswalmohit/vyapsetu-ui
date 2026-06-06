import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Component({
  standalone: false,
  selector: 'app-line-items-modal',
  templateUrl: './line-items-modal.component.html',
  styleUrls: ['./line-items-modal.component.scss']
})
export class LineItemsModalComponent {
  @Input() selectedProduct?: Product;
  @Input() lineItems: any[] = [];
  @Input() loadLineItemsAction$?: Observable<boolean>;
  @Input() today = '';

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
