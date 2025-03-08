export interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  password: string | null;
  profile_image?: string | null;
  address?: string | null;
}

export interface UserProfile {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string | null;
  profile_image: string;
  tempImageUri?: string;
  imageFile?: {
    uri: string;
    name: string;
    type: string;
  };
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}
