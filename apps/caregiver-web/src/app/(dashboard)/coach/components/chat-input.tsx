'use client';

import { useRef, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  onSubmit: (e?: FormEvent) => void;
}

export default function ChatInput({
  input,
  setInput,
  isLoading,
  disabled = false,
  placeholder,
  onSubmit,
}: ChatInputProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex gap-3 items-end pt-3 border-t border-surface-border">
      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('caregiverApp.coach.placeholder')}
          rows={1}
          className="input-warm w-full pr-12 resize-none"
          style={{ minHeight: '48px', maxHeight: '120px' }}
          disabled={isLoading || disabled}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !input.trim() || disabled}
        className="btn-primary px-5 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
          </span>
        ) : (
          t('common.send')
        )}
      </button>
    </form>
  );
}
