export interface ActivityRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  onComplete: (responseData?: Record<string, unknown>) => void;
  onSkip: () => void;
  patientName: string;
}
