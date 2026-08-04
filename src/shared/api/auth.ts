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

export async function loginClient(data: SignInRequest): Promise<SignInResponse> {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json() as SignInResponse;
  if (!res.ok) {
    throw new Error(result.error || 'Error al iniciar sesión');
  }
  return result;
}
