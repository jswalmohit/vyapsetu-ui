import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';

@NgModule({
  imports: [CommonModule, CustomerRoutingModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  declarations: [CustomerComponent]
})
export class CustomerModule {}
