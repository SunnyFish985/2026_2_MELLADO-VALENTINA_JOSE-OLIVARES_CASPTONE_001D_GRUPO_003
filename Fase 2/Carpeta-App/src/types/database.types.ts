export type Gender = 'female' | 'male' | 'other' | 'prefer_not_to_say';
export type Sex = 'M' | 'F' | 'Other';
export type UserRole = 'admin' | 'caregiver';
export type PermissionLevel = 'full' | 'read_only';
export type InviteStatus = 'pending' | 'accepted' | 'rejected';
export type FoodType = 'breast' | 'formula' | 'homemade' | 'commercial';
export type BreastSide = 'left' | 'right' | 'both';

export interface UserRow {
  id: string;
  username: string;
  first_name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  birth_date: string; // YYYY-MM-DD
  gender: Gender;
  created_at: string;
}

export interface BabyRow {
  id: string;
  first_name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  birth_date: string; // YYYY-MM-DD
  birth_time: string; // HH:MM
  birth_weight_g: number;
  birth_height_cm: number;
  gestation_weeks: number;
  sex: Sex;
}

export interface UserBabyRow {
  id: string;
  user_id: string;
  baby_id: string;
  role: UserRole;
  permission_level: PermissionLevel;
  invite_code: string | null;
  invite_status: InviteStatus;
}

export interface FoodRecordRow {
  id: string;
  baby_id: string;
  user_id: string;
  food_type: FoodType;
  recorded_at: string;
  amount: number | null;
  breast_side: BreastSide | null;
  ingredients: string | null;
  brand: string | null;
  batch_number: string | null;
}


export interface User {
  id: string;
  username: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  birthDate: string;
  gender: Gender;
  createdAt: string;
}

export interface Baby {
  id: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  birthDate: string;
  birthTime: string;
  birthWeightG: number;
  birthHeightCm: number;
  gestationWeeks: number;
  sex: Sex;
}

export interface UserBaby {
  id: string;
  userId: string;
  babyId: string;
  role: UserRole;
  permissionLevel: PermissionLevel;
  inviteCode: string | null;
  inviteStatus: InviteStatus;
}

export interface FoodRecord {
  id: string;
  babyId: string;
  userId: string;
  foodType: FoodType;
  recordedAt: string;
  amount: number | null;
  breastSide: BreastSide | null;
  ingredients: string | null;
  brand: string | null;
  batchNumber: string | null;
}
