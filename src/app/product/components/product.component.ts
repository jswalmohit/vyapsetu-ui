import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { LoadingService } from '../../services/loading.service';

@Component({
  standalone: false,
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  searchTerm = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  productForm: FormGroup;
  modalTitle = 'Add Product';
  isEditMode = false;
  activeProductId?: number;
  showProductModal = false;
  showDeleteModal = false;
  deleteTarget?: Product;
  // Action-level loading observables (initialized in constructor)
  saveAction$ = null as unknown as import('rxjs').Observable<boolean>;
  deleteAction$ = null as unknown as import('rxjs').Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private cd: ChangeDetectorRef,
    private loading: LoadingService
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      productId: ['', Validators.required],
      costPrice: [null, [Validators.required, Validators.min(0)]],
      gst: [null, [Validators.required, Validators.min(0)]],
      quantity: [null, [Validators.required, Validators.min(0)]]
    });

    this.saveAction$ = this.loading.actionStatus$('saveProduct');
    this.deleteAction$ = this.loading.actionStatus$('deleteProduct');
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  get f() {
    return this.productForm.controls;
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilter();
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.cd.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredProducts = term
      ? this.products.filter(
          (product) =>
            product.productName.toLowerCase().includes(term) ||
            product.productId.toLowerCase().includes(term)
        )
      : [...this.products];
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilter();
  }

  openAddProduct(): void {
    this.modalTitle = 'Add Product';
    this.isEditMode = false;
    this.activeProductId = undefined;
    this.productForm.reset();
    this.productForm.markAsUntouched();
    this.productForm.markAsPristine();
    this.showProductModal = true;
  }

  openEditProduct(product: Product): void {
    this.modalTitle = 'Edit Product';
    this.isEditMode = true;
    this.activeProductId = product.id;
    this.productForm.setValue({
      productName: product.productName,
      productId: product.productId,
      costPrice: product.costPrice,
      gst: product.gst,
      quantity: product.quantity
    });
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;

    if (this.isEditMode && this.activeProductId != null) {
      this.loading
        .track(
          this.productService.updateProduct(this.activeProductId, {
        productName: formValue.productName,
        productId: formValue.productId,
        costPrice: Number(formValue.costPrice),
        gst: Number(formValue.gst),
        quantity: Number(formValue.quantity)
          }),
          'saveProduct'
        )
        .subscribe({
          next: () => {
            this.loadProducts();
            this.closeProductModal();
          },
          error: (error) => {
            console.error('Error updating product:', error);
          }
        });
    } else {
      this.loading
        .track(
          this.productService.addProduct({
        productName: formValue.productName,
        productId: formValue.productId,
        costPrice: Number(formValue.costPrice),
        gst: Number(formValue.gst),
        quantity: Number(formValue.quantity)
          }),
          'saveProduct'
        )
        .subscribe({
          next: () => {
            this.loadProducts();
            this.closeProductModal();
          },
          error: (error) => {
            console.error('Error adding product:', error);
          }
        });
    }
  }

  confirmDelete(product: Product): void {
    this.deleteTarget = product;
    this.showDeleteModal = true;
  }

  deleteProduct(): void {
    if (!this.deleteTarget) {
      return;
    }
    this.loading
      .track(this.productService.deleteProduct(this.deleteTarget.id), 'deleteProduct')
      .subscribe({
        next: () => {
          this.loadProducts();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteTarget = undefined;
  }
}
