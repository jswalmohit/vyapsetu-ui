import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    {
      id: 1,
      productName: 'Wireless Keyboard',
      productId: 'KB-1001',
      costPrice: 42.5,
      gst: 18,
      quantity: 34
    },
    {
      id: 2,
      productName: 'Bluetooth Mouse',
      productId: 'MS-2002',
      costPrice: 28.75,
      gst: 18,
      quantity: 47
    },
    {
      id: 3,
      productName: 'USB-C Hub',
      productId: 'HB-3003',
      costPrice: 65.0,
      gst: 12,
      quantity: 19
    }
  ];

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

