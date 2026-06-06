import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-line-item-editor',
  imports: [CommonModule],
  templateUrl: './line-item-editor.component.html',
  styleUrls: ['./line-item-editor.component.scss']
})
export class LineItemEditorComponent {
  @Input() lineItems: any[] = [];
  @Input() today = '';
  @Input() canAdd = false;
  @Input() showRemoveControls = true;
  @Input() title = 'Line Items';

  @Output() addLineItem = new EventEmitter<void>();
  @Output() lineItemChange = new EventEmitter<any>();
  @Output() removeLineItem = new EventEmitter<any>();

  trackById(_: number, item: any): any {
    return item?.id ?? _;
  }

  onNumberChange(value: number, item: any, field: string): void {
    const normalized = Number.isNaN(value) ? 0 : value;
    item[field] = Math.max(0, normalized);
    this.lineItemChange.emit(item);
  }

  onTextChange(value: string, item: any, field: string): void {
    item[field] = value;
    this.lineItemChange.emit(item);
  }
}
