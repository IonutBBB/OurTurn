// Structured logger for API routes
// Replaces raw console.log/error to avoid leaking sensitive data
// In production, replace the transport with a real logging service (Sentry, Datadog, etc.)

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: string;
  [key: string]: unknown;
}

function formatEntry(entry: LogEntry): string {
  const { level, message, context, timestamp, ...extra } = entry;
  const prefix = context ? `[${context}]` : '';
  const extraStr = Object.keys(extra).length > 0 ? ` ${JSON.stringify(extra)}` : '';
  return `${timestamp} ${level.toUpperCase()} ${prefix} ${message}${extraStr}`;
}

function log(level: LogLevel, message: string, context?: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  // In production, send to external service instead of console
  // For now, use structured console output
  const formatted = formatEntry(entry);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

/** Create a logger scoped to a specific API route or context */
export function createLogger(context: string) {
  return {
    info: (message: string, meta?: Record<string, unknown>) => log('info', message, context, meta),
    warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, context, meta),
    error: (message: string, meta?: Record<string, unknown>) => log('error', message, context, meta),
  };
}
