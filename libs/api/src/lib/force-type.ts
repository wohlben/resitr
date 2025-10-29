export enum ForceType {
  PUSH = 'PUSH',
  PULL = 'PULL',
  STATIC = 'STATIC',
  HINGE = 'HINGE',
  ROTATION = 'ROTATION',
}

export const ForceTypeDescriptions = {
  PUSH: 'Pushing movements where you press weight away from your body',
  PULL: 'Pulling movements where you draw weight toward your body',
  STATIC: 'Isometric holds where muscles contract without movement',
  HINGE: 'Hip hinge movements with posterior chain emphasis',
  ROTATION: 'Rotational movements and anti-rotation core work',
} as const satisfies Record<ForceTypeKey, string>;

export const ForceTypeLabels = {
  PUSH: 'Push',
  PULL: 'Pull',
  STATIC: 'Static',
  HINGE: 'Hinge',
  ROTATION: 'Rotation',
} as const satisfies Record<ForceTypeKey, string>;

export type ForceTypeKey = keyof typeof ForceType;
export type ForceTypeValue = ForceType;
