export interface PasswordStrength {
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
  strength: number;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;
  return { checks, strength };
};

export const getStrengthColor = (strength: number): string => {
  if (strength <= 2) return "text-red-500";
  if (strength <= 4) return "text-yellow-500";
  return "text-green-500";
};

export const getStrengthText = (strength: number): string => {
  if (strength <= 2) return "Weak";
  if (strength <= 4) return "Medium";
  return "Strong";
};
