export type MeasurementField = {
  key: string
  label: string
}

export const femaleMeasurements: MeasurementField[] = [
    { key: 'bust', label: 'Bust' },
    { key: 'waist', label: 'Waist' },
    { key: 'hip', label: 'Hip' },
    { key: 'shoulder_width', label: 'Shoulder width' },
    { key: 'sleeve_length', label: 'Sleeve length' },
    { key: 'back_length', label: 'Back length' },
    { key: 'dress_length', label: 'Dress length' },
    { key: 'neck', label: 'Neck' },
    { key: 'blouse_length', label: 'Blouse length' },
    { key: 'under_bust', label: 'Under bust' },
    { key: 'arm_round', label: 'Arm round' },
]

export const maleMeasurements: MeasurementField[] = [
    { key: 'chest', label: 'Chest' },
    { key: 'waist', label: 'Waist' },
    { key: 'shoulder_width', label: 'Shoulder width' },
    { key: 'sleeve_length', label: 'Sleeve length' },
    { key: 'neck', label: 'Neck' },
    { key: 'trouser_length', label: 'Trouser length' },
    { key: 'shirt_length', label: 'Shirt length' },
    { key: 'arm_round', label: 'Arm round' },
    { key: 'ankle', label: 'Ankle' },
]