import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from '../components/product.component';
import { ProductAddModalComponent } from '../components/product-add-modal.component';
import { LineItemsModalComponent } from '../components/line-items-modal.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, ProductRoutingModule],
  declarations: [ProductComponent, ProductAddModalComponent, LineItemsModalComponent]
})
export class ProductModule {}
