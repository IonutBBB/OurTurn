'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JOURNEY_STEPS, ARTICLES } from '@ourturn/shared';
import type { JourneyStepDefinition, JourneyProgress, ArticleDefinition, LocalSupportOrganization } from '@ourturn/shared';
import { JourneyProgressBar } from './components/journey-progress-bar';
import { JourneySection } from './components/journey-section';
import { JourneyStepDetail } from './components/journey-step-detail';
import { WhoIsupportSection } from './components/who-isupport-section';
import { ArticleSection } from './components/article-section';
import { ArticleDetail } from './components/article-detail';
import { LocalSupportSection } from './components/local-support-section';
import { createBrowserClient } from '@/lib/supabase';

interface ResourcesTabProps {
  caregiverId: string;
  householdId: string;
  progressRows: JourneyProgress[];
  localSupport: LocalSupportOrganization[];
  hasLocalSupport: boolean;
}

export function ResourcesTab({
  caregiverId,
  householdId,
  progressRows: initialProgressRows,
  localSupport,
  hasLocalSupport,
}: ResourcesTabProps) {
  const { t } = useTranslation('resources');
  const supabase = createBrowserClient();

  // Build progress map from server-fetched rows
  const [progressMap, setProgressMap] = useState<Record<string, JourneyProgress>>(() => {
    const map: Record<string, JourneyProgress> = {};
    for (const row of initialProgressRows) {
      map[row.step_slug] = row;
    }
    return map;
  });

  const [selectedStep, setSelectedStep] = useState<JourneyStepDefinition | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleDefinition | null>(null);

  const completedCount = Object.values(progressMap).filter((p) => p.status === 'completed').length;
  const stepStatuses = JOURNEY_STEPS.map((s) => progressMap[s.slug]?.status ?? 'not_started');

  // Group local support by category
  const supportByCategory: Record<string, LocalSupportOrganization[]> = {};
  for (const org of localSupport) {
    if (!supportByCategory[org.category]) {
      supportByCategory[org.category] = [];
    }
    supportByCategory[org.category].push(org);
  }

  const buildOptimisticProgress = (
    slug: string,
    status: 'not_started' | 'in_progress' | 'completed',
    checklistState: boolean[],
  ): JourneyProgress => {
    const existing = progressMap[slug];
    return {
      id: existing?.id ?? slug,
      caregiver_id: caregiverId,
      household_id: householdId,
      step_slug: slug,
      status,
      checklist_state: checklistState,
      notes: existing?.notes ?? null,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
      created_at: existing?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const updateStepStatus = async (slug: string, status: 'not_started' | 'in_progress' | 'completed') => {
    const existing = progressMap[slug];
    const checklistState = existing?.checklist_state ?? [];

    // Optimistic update
    setProgressMap((prev) => ({
      ...prev,
      [slug]: buildOptimisticProgress(slug, status, checklistState),
    }));

    // Persist to DB
    supabase
      .from('resource_journey_progress')
      .upsert(
        {
          caregiver_id: caregiverId,
          household_id: householdId,
          step_slug: slug,
          status,
          checklist_state: checklistState,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        },
        { onConflict: 'caregiver_id,step_slug' }
      )
      .select()
      .single()
      .then(({ data }) => {
        if (data) {
          setProgressMap((prev) => ({ ...prev, [slug]: data as JourneyProgress }));
        }
      });
  };

  const toggleChecklistItem = async (slug: string, index: number) => {
    const step = JOURNEY_STEPS.find((s) => s.slug === slug);
    if (!step) return;

    const existing = progressMap[slug];
    const currentState: boolean[] = existing?.checklist_state ??
      new Array(step.checklistKeys.length).fill(false);

    const newState = [...currentState];
    newState[index] = !newState[index];

    const allChecked = newState.every(Boolean);
    const anyChecked = newState.some(Boolean);
    let status = existing?.status ?? 'not_started';
    if (allChecked) {
      status = 'completed';
    } else if (anyChecked && status === 'not_started') {
      status = 'in_progress';
    }

    // Optimistic update
    setProgressMap((prev) => ({
      ...prev,
      [slug]: buildOptimisticProgress(slug, status, newState),
    }));

    // Persist to DB
    supabase
      .from('resource_journey_progress')
      .upsert(
        {
          caregiver_id: caregiverId,
          household_id: householdId,
          step_slug: slug,
          status,
          checklist_state: newState,
          completed_at: allChecked ? new Date().toISOString() : null,
        },
        { onConflict: 'caregiver_id,step_slug' }
      )
      .select()
      .single()
      .then(({ data }) => {
        if (data) {
          setProgressMap((prev) => ({ ...prev, [slug]: data as JourneyProgress }));
        }
      });
  };

  // If a step or article is selected, show detail view inline (no modal)
  if (selectedStep) {
    return (
      <JourneyStepDetail
        step={selectedStep}
        progress={progressMap[selectedStep.slug]}
        onClose={() => setSelectedStep(null)}
        onToggleChecklist={toggleChecklistItem}
        onUpdateStatus={updateStepStatus}
      />
    );
  }

  if (selectedArticle) {
    return (
      <ArticleDetail
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    );
  }

  return (
    <div className="space-y-10">
      {/* Journey Progress Bar */}
      <JourneyProgressBar
        completedCount={completedCount}
        totalCount={JOURNEY_STEPS.length}
        stepStatuses={stepStatuses}
      />

      {/* Journey Section */}
      <JourneySection
        progressMap={progressMap}
        onSelectStep={setSelectedStep}
      />

      {/* WHO iSupport Featured Section */}
      <WhoIsupportSection onSelectArticle={setSelectedArticle} />

      {/* Knowledge Library */}
      <ArticleSection onSelectArticle={setSelectedArticle} />

      {/* Local Support */}
      <LocalSupportSection
        supportByCategory={supportByCategory}
        isEmpty={!hasLocalSupport}
      />
    </div>
  );
}
