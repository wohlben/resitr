export enum EquipmentCategory {
  'accessories' = 'accessories',
  'benches' = 'benches',
  'free_weights' = 'free_weights',
  'functional' = 'functional',
  'machines' = 'machines',
  'other' = 'other',
}

export const EquipmentCategoryLabels = {
  accessories: 'Accessories',
  benches: 'Benches',
  free_weights: 'Free Weights',
  functional: 'Functional',
  machines: 'Machines',
  other: 'Other',
} as const satisfies Record<EquipmentCategory, string>;

export type EquipmentCategoryType = typeof EquipmentCategory;
