export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}
