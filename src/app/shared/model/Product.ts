export class Product {
  id: number;
  id_ranch: number;
  name: string;
  description: string;
  application: string;
  unit_for_product: number;
  unit: string;
  amount: number
  amount_input: number;
  expiration: string;
  house: number
  house_name: string
  unitary_price: number
  type: string;
}

export class ProductOutput {
  id: number;
  id_ranch: number;
  name: string;
  description: string;
  application: string;
  unit_for_product: number;
  amountOutput: number;
  amount: number
  unit: string;
  left: number
}

// export const MOCK_PRODUCTS: Product[] = [
//   {
//     id: 101,
//     id_ranch: 1,
//     name: 'Herbicida Total',
//     description: 'Elimina todo tipo de maleza de forma efectiva.',
//     application: 'Aplicar en zonas con maleza intensa cada 15 días.',
//     unit: 'litros',
//     amount: 20,
//     expiration: ""
//   },
//   {
//     id: 102,
//     id_ranch: 1,
//     name: 'Fertilizante Nitrofoska',
//     description: 'Fertilizante granulado con alto contenido de nitrógeno.',
//     application: 'Usar durante la siembra y cada 30 días en cultivos.',
//     unit: 'kg',
//     amount: 50,
//     expiration: ""
//   },
//   {
//     id: 103, id_ranch: 1,
//     name: 'Fungicida Sistémico',
//     description: 'Protege contra hongos como mildiu y oídio.',
//     application: 'Aplicar foliarmente cada 7 días.',
//     unit: 'litros',
//     amount: 10,
//     expiration: ""
//   },
//   {
//     id: 104, id_ranch: 1,
//     name: 'Insecticida Orgánico',
//     description: 'Controla plagas sin afectar el medio ambiente.',
//     application: 'Aplicar cada 5 días en cultivos frutales.',
//     unit: 'litros',
//     amount: 15,
//     expiration: ""
//   },
//   {
//     id: 105, id_ranch: 1,
//     name: 'Semilla de Maíz Híbrido',
//     description: 'Alto rendimiento y resistencia a enfermedades.',
//     application: 'Sembrar en terrenos con buen drenaje.',
//     unit: 'kg',
//     amount: 100,
//     expiration: ""
//   },
//   {

//     id: 106, id_ranch: 1,
//     name: 'Acondicionador de Suelo',
//     description: 'Mejora la estructura del suelo y retención de nutrientes.',
//     application: 'Aplicar antes de la siembra.',
//     unit: 'kg',
//     amount: 30,
//     expiration: ""
//   },
//   {
//     id: 107, id_ranch: 1,
//     name: 'Abono Foliar',
//     description: 'Proporciona nutrientes directamente a las hojas.',
//     application: 'Rociar en las hojas cada 10 días.',
//     unit: 'litros',
//     amount: 8,
//     expiration: ""
//   },
//   {
//     id: 108, id_ranch: 1,
//     name: 'Controlador Biológico',
//     description: 'Contiene microorganismos benéficos para combatir plagas.',
//     application: 'Aplicar en cultivos orgánicos semanalmente.',
//     unit: 'litros',
//     amount: 12,
//     expiration: ""
//   },
//   {
//     id: 109, id_ranch: 1,
//     name: 'Trampas Cromáticas',
//     description: 'Atrapan insectos mediante colores específicos.',
//     application: 'Colocar en áreas con alta presencia de plagas.',
//     unit: 'piezas',
//     amount: 50,
//     expiration: ""
//   },
//   {
//     id: 110, id_ranch: 1,
//     name: 'Plástico para Invernadero',
//     description: 'Protege cultivos de condiciones climáticas adversas.',
//     application: 'Instalar antes de la temporada de lluvias.',
//     unit: 'metros',
//     amount: 200,
//     expiration: ""
//   }
// ];
