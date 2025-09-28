import { Injectable } from '@angular/core';
import { BehaviorSubject, find, Observable } from 'rxjs';
import { OutputProduct } from 'src/app/shared/model/OutputProduct';
import { Product } from 'src/app/shared/model/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly _products$ = new BehaviorSubject<Product[]>([]);
  public readonly products$ = this._products$.asObservable();

  constructor() { }

  // Inicializar productos (por ejemplo desde la API)
  setProducts(products: Product[]): void {
    this._products$.next([...products]);
  }

  // Obtener todos
  getAll(): Product[] {
    return this._products$.getValue();
  }

  // Obtener por id
  getById(id: number): Product | undefined {
    return this.getAll().find(p => p.id === id);
  }

  getByNameAndDesc(name: string, desc: string): Product | undefined {
    const pd = this.getAll().find(p =>
      p.name.trim().toLowerCase() == name.trim().toLowerCase() &&
      p.description.trim().toLowerCase() == desc.trim().toLowerCase()
    );
    return pd
  }

  // Agregar uno
  add(product: Product): void {
    if (this.getAll().some(p => p.id === product.id)) return;
    const products = this.getAll();
    this._products$.next([...products, product]);
  }

  // Modificar uno (por id) con Partial
  update(updatedProduct: Partial<Product> & { id: number }): void {
    const products = this.getAll().map(p =>
      p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
    );
    this._products$.next(products);
  }

  updateOutputGeneral(updatedProduct: Partial<Product> & { id: number, amount: number }): void {
    const products = this.getAll().map(p => {
      if (p.id === updatedProduct.id) {
        return {
          ...p,
          amount: (p.amount ?? 0) - (updatedProduct.amount ?? 0)
        };
      }
      return p;
    });
    this._products$.next(products);
  }

  // Eliminar por id
  delete(id: number): void {
    const products = this.getAll().filter(p => p.id !== id);
    this._products$.next(products);
  }

  updateStockLocal(products: Product[]) {
    products.forEach(p => {
      const stockLocal = this.getById(p.id)!.amount;
      const newStockLocal = Number(stockLocal) + Number(p.amount_input);
      this.update({ id: p.id, amount: newStockLocal, expiration: p.expiration })
    })
  }

  getUnits(): string[] {
    const unit = this.getAll()
      .map(p => p.unit)
      .filter((unit, index, self) => self.indexOf(unit) === index);
    return unit;
  }

  getApplication(): string[] {
    const application = this.getAll()
      .map(p => p.application)
      .filter((app, index, self) => self.indexOf(app) === index);
    return application;
  }

  updateOutput(pds: OutputProduct[]) {
    pds.forEach(v => {
      const currentPd = this.getById(v.id_product);
      if (currentPd) {
        const stockC = currentPd.unit_for_product * currentPd.amount;
        const left = stockC - v.amount;
        const nuevasPresentaciones = (left / currentPd.unit_for_product);
        const valor = parseFloat(nuevasPresentaciones.toFixed(2));
        currentPd.amount = valor;
        this.update(currentPd);
      }
    })
  }

}