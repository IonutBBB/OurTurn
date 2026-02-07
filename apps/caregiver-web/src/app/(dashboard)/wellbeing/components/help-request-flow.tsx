'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from '@/components/toast';
import type { HelpRequest, CareTeamMember } from '@ourturn/shared';
import { HELP_REQUEST_TEMPLATES } from '@ourturn/shared';

interface HelpRequestFlowProps {
  caregiverId: string;
  householdId: string;
  initialRequests: HelpRequest[];
  teamMembers: CareTeamMember[];
  autoOpenBreak?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-status-amber-bg text-status-amber',
  accepted: 'bg-brand-50 text-brand-700',
  completed: 'bg-status-success-bg text-status-success',
  expired: 'bg-surface-border text-text-muted',
};

export function HelpRequestFlow({
  caregiverId,
  householdId,
  initialRequests,
  teamMembers,
  autoOpenBreak = false,
}: HelpRequestFlowProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const [requests, setRequests] = useState<HelpRequest[]>(initialRequests);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    autoOpenBreak ? 'need_break' : null
  );
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Auto-set message if auto-opening break
  useEffect(() => {
    if (autoOpenBreak) {
      const tpl = HELP_REQUEST_TEMPLATES.find((t) => t.key === 'need_break');
      if (tpl) setCustomMessage(tpl.message);
    }
  }, [autoOpenBreak]);

  const sendRequest = async (message: string, templateKey?: string) => {
    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast(t('common.error'), 'error');
        return;
      }

      const { data, error } = await supabase
        .from('caregiver_help_requests')
        .insert({
          requester_id: caregiverId,
          household_id: householdId,
          message,
          template_key: templateKey || null,
        })
        .select()
        .single();

      if (error) throw error;

      setRequests((prev) => [data, ...prev]);
      setCustomMessage('');
      setSelectedTemplate(null);
      showToast(t('caregiverApp.toolkit.help.sent'), 'success');
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateClick = (key: string, message: string) => {
    if (key === 'custom') {
      setSelectedTemplate('custom');
      setCustomMessage('');
    } else {
      setSelectedTemplate(key);
      setCustomMessage(message);
    }
  };

  const handleSend = () => {
    if (!customMessage.trim()) return;
    sendRequest(customMessage.trim(), selectedTemplate || undefined);
  };

  const handleAccept = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('caregiver_help_requests')
        .update({
          status: 'accepted',
          responded_by: caregiverId,
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();
      if (error) throw error;
      setRequests((prev) => prev.map((r) => (r.id === requestId ? data : r)));
    } catch {
      showToast(t('common.error'), 'error');
    }
  };

  const handleComplete = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('caregiver_help_requests')
        .update({ status: 'completed' })
        .eq('id', requestId)
        .select()
        .single();
      if (error) throw error;
      setRequests((prev) => prev.map((r) => (r.id === requestId ? data : r)));
    } catch {
      showToast(t('common.error'), 'error');
    }
  };

  const getStatusLabel = (status: string) => {
    const key = `caregiverApp.toolkit.help.status${status.charAt(0).toUpperCase() + status.slice(1)}`;
    return t(key);
  };

  return (
    <div className="card-paper p-6">
      <h2 className="text-lg font-display font-bold text-text-primary mb-2">
        {t('caregiverApp.toolkit.network.help.title')}
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        {t('caregiverApp.toolkit.network.help.subtitle')}
      </p>

      {/* Quick Templates */}
      <div className="flex flex-wrap gap-2 mb-4">
        {HELP_REQUEST_TEMPLATES.map((tpl) => (
          <button
            key={tpl.key}
            onClick={() => handleTemplateClick(tpl.key, tpl.message)}
            disabled={isSending}
            className={`px-3 py-2 text-sm rounded-full border transition-colors disabled:opacity-50 ${
              selectedTemplate === tpl.key
                ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30 text-brand-700'
                : 'border-brand-200 dark:border-brand-800 bg-surface-elevated/50 text-text-secondary hover:bg-brand-100 dark:hover:bg-brand-900/40'
            }`}
          >
            {tpl.label}
          </button>
        ))}
      </div>

      {/* Message Input */}
      {selectedTemplate && (
        <div className="mb-4 space-y-3">
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={t('caregiverApp.toolkit.help.customPlaceholder')}
            className="input-warm w-full resize-none text-sm"
            rows={3}
          />

          {/* Team members who can help */}
          {teamMembers.length > 0 && (
            <div>
              <p className="text-xs text-text-muted mb-2">
                {t('caregiverApp.toolkit.network.help.teamCanHelp')}
              </p>
              <div className="flex flex-wrap gap-1">
                {teamMembers.slice(0, 5).map((m) => (
                  <span key={m.id} className="text-xs px-2 py-1 rounded-full bg-surface-elevated border border-surface-border text-text-secondary">
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!customMessage.trim() || isSending}
            className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
          >
            {isSending ? t('common.saving') : t('caregiverApp.toolkit.help.sendRequest')}
          </button>
        </div>
      )}

      {/* Recent Requests */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-secondary">
            {t('caregiverApp.toolkit.help.recentRequests')}
          </h3>
          {requests.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              {showAll ? t('caregiverApp.toolkit.help.showLess') : t('caregiverApp.toolkit.help.viewAll')}
            </button>
          )}
        </div>
        {requests.length === 0 ? (
          <p className="text-sm text-text-muted">{t('caregiverApp.toolkit.help.noRequests')}</p>
        ) : (
          <div className="space-y-2">
            {(showAll ? requests : requests.slice(0, 5)).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/50 border border-surface-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{req.message}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(req.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[req.status] || ''}`}>
                    {getStatusLabel(req.status)}
                  </span>
                  {req.status === 'pending' && req.requester_id !== caregiverId && (
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      {t('caregiverApp.toolkit.help.accept')}
                    </button>
                  )}
                  {req.status === 'accepted' && (
                    <button
                      onClick={() => handleComplete(req.id)}
                      className="text-xs text-status-success hover:text-status-success/80 font-medium"
                    >
                      {t('caregiverApp.toolkit.help.complete')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
