import { ChangeDetectorRef, Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { forkJoin } from 'rxjs';
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
  showLineItemsModal = false;
  deleteTarget?: Product;
  selectedProduct?: Product;
  lineItems: any[] = [];
  // change tracking for line items
  lineItemsOriginal: any[] = [];
  lineItemsAdded = new Set<string>();
  lineItemsEdited = new Set<string>();
  lineItemsDeleted = new Set<string>();
  // Action-level loading observables (initialized in constructor)
  saveAction$ = null as unknown as import('rxjs').Observable<boolean>;
  deleteAction$ = null as unknown as import('rxjs').Observable<boolean>;
  loadLineItemsAction$ = null as unknown as import('rxjs').Observable<boolean>;
  saveLineItemsAction$ = null as unknown as import('rxjs').Observable<boolean>;
  today: string = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private cd: ChangeDetectorRef,
    @Inject(LoadingService) private loading: LoadingService
  ) {
    this.today = this.getTodayDateString();
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      productId: ['', Validators.required],
      costPrice: [null, [Validators.required, Validators.min(0)]],
      gst: [18, [Validators.required, Validators.min(0)]],
      quantity: [null, [Validators.required, Validators.min(0)]],
      purchaseDate: [this.today, [Validators.required, this.maxDateValidator(this.today)]]
    });

    this.saveAction$ = this.loading.actionStatus$('saveProduct');
    this.deleteAction$ = this.loading.actionStatus$('deleteProduct');
    this.loadLineItemsAction$ = this.loading.actionStatus$('loadLineItems');
    this.saveLineItemsAction$ = this.loading.actionStatus$('saveLineItems');
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  get f() {
    return this.productForm.controls;
  }

  private getTodayDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private maxDateValidator(maxDate: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const controlDate = new Date(control.value);
      const max = new Date(maxDate);
      return controlDate <= max ? null : { maxDate: { value: control.value } };
    };
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
    this.productForm.reset({
      gst: 18,
      purchaseDate: this.today
    });
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
      quantity: product.quantity,
      purchaseDate: product.purchaseDate
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
        quantity: Number(formValue.quantity),
        purchaseDate: formValue.purchaseDate
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
        quantity: Number(formValue.quantity),
        purchaseDate: formValue.purchaseDate
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

  openLineItemsModal(product: Product): void {
    this.selectedProduct = product;
    this.lineItems = [];
    this.showLineItemsModal = true;
    // fetch using productId (string identifier expected by API)
    this.loadLineItems(product.productId);
  }
  loadLineItems(productId: string): void {
    this.loading
      .track(
        this.productService.getLineItemsByProductId(productId),
        'loadLineItems'
      )
      .subscribe({
        next: (response: any) => {
          this.lineItems = response.data || [];
          // preserve original snapshot for change detection
          this.lineItemsOriginal = this.lineItems.map((i: any) => ({ ...i }));
          this.lineItemsAdded.clear();
          this.lineItemsEdited.clear();
          this.lineItemsDeleted.clear();
          this.cd.detectChanges();
        },
        error: (error) => {
          console.error('Error loading line items:', error);
          this.lineItems = [];
          this.lineItemsOriginal = [];
          this.cd.detectChanges();
        }
      });
  }

  addLineItemRow(): void {
    const tmpId = `tmp-${Date.now()}`;
    const newRow = {
      id: tmpId,
      productId: this.selectedProduct?.productId ?? '',
      purchasePrice: 0,
      gst: 0,
      quantity: 0,
      purchaseDate: this.today,
      createdDate: new Date().toISOString(),
      sellerGSTIN: '',
      sellerName: ''
    };
    this.lineItems.unshift(newRow);
    this.lineItemsAdded.add(tmpId);
    this.cd.detectChanges();
    // focus first input in the new row after render
    setTimeout(() => {
      const el = document.querySelector('.line-item-row input');
      try { (el as HTMLElement)?.focus(); } catch {}
    }, 50);
  }

  onLineItemChange(item: any): void {
    if (!item) return;
    if (String(item.id).startsWith('tmp-')) {
      this.lineItemsAdded.add(item.id);
    } else {
      const orig = this.lineItemsOriginal.find((o) => String(o.id) === String(item.id));
      if (!orig) {
        this.lineItemsEdited.add(item.id);
      } else {
        const changed =
          orig.purchasePrice !== item.purchasePrice ||
          orig.gst !== item.gst ||
          orig.quantity !== item.quantity ||
          orig.purchaseDate !== item.purchaseDate ||
          orig.sellerGSTIN !== item.sellerGSTIN ||
          orig.sellerName !== item.sellerName;
        if (changed) this.lineItemsEdited.add(item.id);
        else this.lineItemsEdited.delete(item.id);
      }
    }
  }

  removeLineItemRow(item: any): void {
    if (!item) return;
    if (String(item.id).startsWith('tmp-')) {
      this.lineItems = this.lineItems.filter((i) => i.id !== item.id);
      this.lineItemsAdded.delete(item.id);
    } else {
      this.lineItems = this.lineItems.filter((i) => i.id !== item.id);
      this.lineItemsDeleted.add(item.id);
      this.lineItemsEdited.delete(item.id);
    }
  }

  hasLineItemChanges(): boolean {
    return this.lineItemsAdded.size > 0 || this.lineItemsEdited.size > 0 || this.lineItemsDeleted.size > 0;
  }

  saveLineItems(): void {
    const adds = this.lineItems.filter((i) => String(i.id).startsWith('tmp-'));
    const edits = this.lineItemsOriginal.filter((orig) => this.lineItemsEdited.has(orig.id));
    const deletes = Array.from(this.lineItemsDeleted);

    const ops: any[] = [];
    // deletes
    deletes.forEach((id) => ops.push(this.productService.deleteLineItem(id)));
    // updates
    edits.forEach((it) => ops.push(this.productService.updateLineItem(it.id, it)));
    // creates
    adds.forEach((it) => ops.push(this.productService.addLineItem(it)));

    if (ops.length === 0) return;

    this.loading.track(forkJoin(ops), 'saveLineItems').subscribe({
      next: () => {
        // reload
        if (this.selectedProduct) this.loadLineItems(this.selectedProduct.productId);
      },
      error: (err) => console.error('Error saving line items', err)
    });
  }

  closeLineItemsModal(): void {
    this.showLineItemsModal = false;
    this.selectedProduct = undefined;
    this.lineItems = [];
  }
}
