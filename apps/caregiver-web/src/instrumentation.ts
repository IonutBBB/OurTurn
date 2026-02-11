import { validateEnv } from '@/lib/validate-env';

export function register() {
  validateEnv();
}
