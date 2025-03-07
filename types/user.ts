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
