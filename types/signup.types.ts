// 회원가입 관련 타입 정의

export type SignupTab = 'jobseeker' | 'company';

export type ModalType = 'terms' | 'privacy';

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export interface SignupFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

export interface LocalStorageSignupData {
  tab: SignupTab;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}
