export type Equipment = {
  id: string;
  name: string;
  image?: string;
  description?: string;
  substitutesFor: string[]
}

export type NewEquipment = Omit<Equipment, 'id'>
