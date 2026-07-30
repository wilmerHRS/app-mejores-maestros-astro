export interface SignInRequest {
  email?: string;
  password?: string;
}

export interface SignInResponse {
  success?: boolean;
  error?: string;
  redirectTo?: string;
}

export interface SignUpRequest {
  email?: string;
  password?: string;
}

export interface SignUpResponse {
  success?: boolean;
  error?: string;
}

export interface SignOutResponse {
  success?: boolean;
}

export interface FirebaseDecodedToken {
  uid: string;
  email?: string;
  [key: string]: any;
}
