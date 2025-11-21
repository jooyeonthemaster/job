// 로그인 폼 상태 관리 훅
// app/login/page.tsx에서 분리 (기능 변경 없음)

import { useState } from 'react';

export type LoginTab = 'jobseeker' | 'company';

export function useLoginForm() {
  const [activeTab, setActiveTab] = useState<LoginTab>('jobseeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isPerson = activeTab === 'jobseeker';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
  };

  return {
    // State
    activeTab,
    email,
    password,
    showPassword,
    rememberMe,
    isLoading,
    error,
    isPerson,
    // Setters
    setActiveTab,
    setEmail,
    setPassword,
    setShowPassword,
    setRememberMe,
    setIsLoading,
    setError,
    // Helpers
    resetForm
  };
}
