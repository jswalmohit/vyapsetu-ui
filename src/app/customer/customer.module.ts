import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { CustomerRegistrationDialogComponent } from './customer-registration-dialog.component';

@NgModule({
  imports: [CommonModule, CustomerRoutingModule, FormsModule, ReactiveFormsModule, CustomerRegistrationDialogComponent],
  declarations: [CustomerComponent]
})
export class CustomerModule {}
