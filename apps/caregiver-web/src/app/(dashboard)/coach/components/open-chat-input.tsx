'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface OpenChatInputProps {
  patientName: string;
  disabled?: boolean;
  onSubmit: (message: string) => void;
}

export default function OpenChatInput({
  patientName,
  disabled = false,
  onSubmit,
}: OpenChatInputProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  return (
    <section>
      <div className="mb-3">
        <h2 className="section-label">{t('caregiverApp.coach.hub.askAnything.title')}</h2>
      </div>
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('caregiverApp.coach.hub.askAnything.placeholder', { name: patientName })}
          className="input-warm flex-1"
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="btn-primary px-5 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('common.send')}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-text-muted text-center">
        {t('caregiverApp.coach.disclaimer')}
      </p>
    </section>
  );
}
