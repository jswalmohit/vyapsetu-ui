import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from '../components/product.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, ProductRoutingModule],
  declarations: [ProductComponent]
})
export class ProductModule {}
