'use client';

import { ErrorBoundary } from '@/components/error-boundary';

export function DashboardErrorWrapper({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
