import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../control/product/product.component';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private dataListProduct = new BehaviorSubject<Product[]>([]);
  dataListProduct$ = this.dataListProduct.asObservable();

  updateDataListProduct(dataList: Product[]) {
    this.dataListProduct.next(dataList);
  }
  constructor() { }
}
