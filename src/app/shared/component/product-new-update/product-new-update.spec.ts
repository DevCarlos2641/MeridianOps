// import { ProductService } from 'src/app/core/service/data/product.service';
// import { MOCK_PRODUCTS, Product } from '../../model/Product';

// describe('ProductService', () => {
//   let service: ProductService;

//   beforeEach(() => {
//     service = new ProductService();
//   });

//   it('deberia de inicializar los productos', () => {
//     expect(service.getAll().length === 0).toBeTruthy();
//     service.setProducts(MOCK_PRODUCTS);
//     expect(service.getAll().length).toBe(MOCK_PRODUCTS.length);
//   })

//   it('debería aumentar el amount de todos los productos en 10', () => {
//     service.setProducts(MOCK_PRODUCTS);
//     // Act: aplicar aumento por lote
//     service.getAll().forEach(pd => {
//       pd.amount += 10
//       service.update(pd)
//     });

//     const names = service.getAll().map(v => v.name);

//     const updated = service.getAll();
//     expect(updated[0].amount).toBe(30);
//     expect(updated[1].amount).toBe(60);
//     expect(updated[2].amount).toBe(20);

//     expect(updated[0].name).toBe(names[0]);
//     expect(updated[1].name).toBe(names[1]);
//     expect(updated[2].name).toBe(names[2]);
//   });

//   it('deberia de agregar un producto nuevo', () => {
//     service.setProducts(MOCK_PRODUCTS);
//     const pd = new Product();
//     pd.amount = 26;
//     pd.id = 100;
//     pd.id_ranch = 2;
//     pd.name = "Producto alta";
//     pd.unit = "LTS";
//     pd.application = "Nose";
//     pd.description = "Es para las plantitas";
//     service.add(pd);

//     const product = service.getById(100);
//     expect(product).toBeTruthy();
//     expect(product?.amount).toBe(26);
//   })

//   it('deberia de eliminar un producto', () => {
//     service.setProducts(MOCK_PRODUCTS);
//     const pd = { ...service.getById(102) };
//     expect(pd).toBeTruthy();
//     service.delete(pd.id!!);
//     const product = service.getById(pd.id!!);
//     expect(product).toBeFalsy();
//   })

//   it('deberia de actualizar un solo producto', () => {
//     service.setProducts(MOCK_PRODUCTS);
//     const aux = service.getById(101);
//     const pd = service.getById(102);
//     const nameOld = pd?.name;
//     expect(pd).toBeTruthy();

//     if (pd) {

//       pd.name = "new name";
//       service.update(pd);

//       const current = service.getById(102);
//       expect(current).toBeTruthy();
//       if (current) {
//         expect(current.name).toBe("new name");
//         expect(current.name).not.toBe(nameOld);
//       }
//     }
//   })

//   it('no debería actualizar si el producto no existe', () => {
//     service.setProducts(MOCK_PRODUCTS);
//     const fakeProduct: Product = {
//       id_ranch: 999,
//       id: 999,
//       name: 'Inexistente',
//       description: 'No debería estar',
//       application: 'Nunca aplica',
//       unit: 'kg',
//       amount: 10
//     };

//     service.update(fakeProduct);
//     const found = service.getById(999);
//     expect(found).toBeFalsy();

//   });

//   it('no debería agregar un producto con ID duplicado', () => {
//     service.setProducts(MOCK_PRODUCTS);
//     const duplicate = { ...MOCK_PRODUCTS[0] }; // mismo ID

//     service.add(duplicate); // si `add` no valida, agregará uno nuevo

//     const occurrences = service.getAll().filter(p => p.id === duplicate.id).length;

//     expect(occurrences).toBe(1); // sólo debe haber uno
//   });

//   it('debería actualizar el stock local por lote', () => {
//     // Arrange
//     service.setProducts(MOCK_PRODUCTS);

//     // Tomamos algunos productos base
//     const lote: Product[] = [
//       { id: 101, id_ranch: 1, name: '', description: '', application: '', unit: '', amount: 5 },
//       { id: 102, id_ranch: 2, name: '', description: '', application: '', unit: '', amount: 10 },
//       { id: 103, id_ranch: 3, name: '', description: '', application: '', unit: '', amount: 3 }
//     ];

//     const original101 = service.getById(101)?.amount ?? 0;
//     const original102 = service.getById(102)?.amount ?? 0;
//     const original103 = service.getById(103)?.amount ?? 0;

//     // Act
//     service.updateStockLocal(lote);

//     // Assert
//     expect(service.getById(101)?.amount).toBe(original101 + 5);
//     expect(service.getById(102)?.amount).toBe(original102 + 10);
//     expect(service.getById(103)?.amount).toBe(original103 + 3);
//   });

// });