import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from '../components/product.component';
import { LineItemEditorComponent } from '../components/line-item-editor/line-item-editor.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, ProductRoutingModule, LineItemEditorComponent],
  declarations: [ProductComponent]
})
export class ProductModule {}
