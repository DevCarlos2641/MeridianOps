import { BehaviorSubject, Observable } from 'rxjs';

export class BehaviorSubjectGeneric<T extends { id: number | string }> {
    
  private store$: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);

  constructor(initialData: T[] = []) {
    this.store$.next(initialData);
  }

  /** Obtener todos los datos como observable */
  asObservable(): Observable<T[]> {
    return this.store$.asObservable();
  }

  /** Obtener el valor actual */
  get(): T[] {
    return this.store$.getValue();
  }

  /** Establecer nuevo arreglo completo */
  set(data: T[]): void {
    this.store$.next(data);
  }

  /** Agregar un nuevo elemento */
  add(item: T): void {
    const current = this.get();
    this.store$.next([...current, item]);
  }

  addBegin(item: T): void{
    const current = this.get();
    this.store$.next([item, ...current]);
  }

  /** Actualizar un elemento por id */
  update(id: T['id'], partial: Partial<T>): void {
    const current = this.get();
    const updated = current.map(item =>
      item.id === id ? { ...item, ...partial } : item
    );
    this.store$.next(updated);
  }

  /** Eliminar un elemento por id */
  delete(id: T['id']): void {
    const current = this.get();
    const filtered = current.filter(item => item.id !== id);
    this.store$.next(filtered);
  }

  /** Vaciar el store */
  clear(): void {
    this.store$.next([]);
  }

  /** Buscar uno por id */
  find(id: T['id']): T | undefined {
    return this.get().find(item => item.id === id);
  }
}
