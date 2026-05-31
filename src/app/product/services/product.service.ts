import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [ ];

  getProducts(): Product[] {
    return [...this.products];
  }

  addProduct(data: Omit<Product, 'id'>): void {
    const nextId = this.products.length
      ? Math.max(...this.products.map((product) => product.id)) + 1
      : 1;

    this.products = [...this.products, { id: nextId, ...data }];
  }

  updateProduct(updatedProduct: Product): void {
    this.products = this.products.map((product) =>
      product.id === updatedProduct.id ? { ...updatedProduct } : product
    );
  }

  deleteProduct(id: number): void {
    this.products = this.products.filter((product) => product.id !== id);
  }
}

