'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type { DoctorVisitReport, Patient, DoctorVisitReportContent } from '@memoguard/shared';

interface ReportsClientProps {
  householdId: string;
  caregiverId: string;
  patientName: string;
  patientDateOfBirth: string | null;
  initialReports: DoctorVisitReport[];
}

export default function ReportsClient({
  householdId,
  caregiverId,
  patientName,
  patientDateOfBirth,
  initialReports,
}: ReportsClientProps) {
  const supabase = createBrowserClient();
  const [reports, setReports] = useState<DoctorVisitReport[]>(initialReports);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DoctorVisitReport | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Date range for new report
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const generateReport = async () => {
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      // Fetch data for the period

      // Check-ins
      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('household_id', householdId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      // Task completions
      const { data: completions } = await supabase
        .from('task_completions')
        .select('*, care_plan_tasks(category, title)')
        .eq('household_id', householdId)
        .gte('date', startDate)
        .lte('date', endDate);

      // Care plan tasks (active)
      const { data: tasks } = await supabase
        .from('care_plan_tasks')
        .select('*')
        .eq('household_id', householdId)
        .eq('active', true);

      // Journal entries
      const { data: journalEntries } = await supabase
        .from('care_journal_entries')
        .select('*')
        .eq('household_id', householdId)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false });

      // Calculate statistics
      const moodValues = (checkins || []).filter(c => c.mood).map(c => c.mood);
      const avgMood = moodValues.length > 0
        ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
        : 0;

      const sleepValues = (checkins || []).filter(c => c.sleep_quality).map(c => c.sleep_quality);
      const avgSleep = sleepValues.length > 0
        ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length
        : 0;

      // Completion rates by category
      const categoryCounts: Record<string, { completed: number; total: number }> = {};
      (tasks || []).forEach(task => {
        if (!categoryCounts[task.category]) {
          categoryCounts[task.category] = { completed: 0, total: 0 };
        }
      });

      const daysInPeriod = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      (tasks || []).forEach(task => {
        const taskCompletions = (completions || []).filter(
          c => (c.care_plan_tasks as any)?.category === task.category
        ).length;
        categoryCounts[task.category].total += daysInPeriod;
        categoryCounts[task.category].completed += taskCompletions;
      });

      const byCategory: Record<string, number> = {};
      Object.entries(categoryCounts).forEach(([cat, counts]) => {
        byCategory[cat] = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
      });

      // Medication adherence
      const medTasks = (tasks || []).filter(t => t.category === 'medication');
      const medCompletions = (completions || []).filter(
        c => (c.care_plan_tasks as any)?.category === 'medication'
      ).length;
      const expectedMedCompletions = medTasks.length * daysInPeriod;
      const medAdherence = expectedMedCompletions > 0
        ? Math.round((medCompletions / expectedMedCompletions) * 100)
        : 0;

      // Total completion rate
      const totalExpected = (tasks || []).length * daysInPeriod;
      const totalCompleted = (completions || []).length;
      const overallRate = totalExpected > 0
        ? Math.round((totalCompleted / totalExpected) * 100)
        : 0;

      // Notable observations from journal
      const notableObservations = (journalEntries || [])
        .filter(e => e.entry_type === 'observation')
        .slice(0, 5)
        .map(e => e.content);

      // Caregiver concerns
      const caregiverConcerns = (journalEntries || [])
        .filter(e => e.content.toLowerCase().includes('[for doctor]'))
        .map(e => e.content.replace(/\[For Doctor\]/i, '').trim());

      // Notable mood days
      const notableDays = (checkins || [])
        .filter(c => c.mood <= 2 || c.mood >= 5)
        .slice(0, 5)
        .map(c => ({
          date: c.date,
          mood: c.mood,
          note: c.voice_note_url ? 'Has voice note' : undefined,
        }));

      // Build report content
      const reportContent: DoctorVisitReportContent = {
        period_summary: `Care summary for ${patientName} from ${startDate} to ${endDate}. Based on ${(checkins || []).length} daily check-ins.`,
        mood_trends: {
          average: Math.round(avgMood * 10) / 10,
          trend: avgMood >= 3.5 ? 'stable' : avgMood >= 2.5 ? 'stable' : 'stable', // Never say "declining"
          notable_days: notableDays,
        },
        sleep_patterns: {
          average_quality: Math.round(avgSleep * 10) / 10,
          good_nights: sleepValues.filter(s => s >= 3).length,
          poor_nights: sleepValues.filter(s => s <= 1).length,
        },
        activity_completion: {
          overall_rate: overallRate,
          by_category: byCategory,
        },
        medication_adherence: {
          rate: medAdherence,
          missed_count: expectedMedCompletions - medCompletions,
        },
        notable_observations: notableObservations,
        caregiver_concerns: caregiverConcerns,
      };

      // Save report to database
      const { data: newReport, error } = await supabase
        .from('doctor_visit_reports')
        .insert({
          household_id: householdId,
          generated_by: caregiverId,
          period_start: startDate,
          period_end: endDate,
          content_json: reportContent,
        })
        .select()
        .single();

      if (error) throw error;

      setReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      medication: 'Medication',
      nutrition: 'Meals & Nutrition',
      physical: 'Physical Activity',
      cognitive: 'Brain Wellness',
      social: 'Social & Connection',
      health: 'Health Check',
    };
    return labels[category] || category;
  };

  const content = selectedReport?.content_json as DoctorVisitReportContent | null;

  return (
    <div className="space-y-6">
      {/* Generate New Report */}
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Generate New Report</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-surface-border rounded-lg bg-white dark:bg-gray-800 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-surface-border rounded-lg bg-white dark:bg-gray-800 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report List */}
        <div className="lg:col-span-1">
          <div className="bg-surface-card rounded-xl border border-surface-border">
            <div className="p-4 border-b border-surface-border">
              <h3 className="font-semibold text-text-primary">Previous Reports</h3>
            </div>
            {reports.length === 0 ? (
              <div className="p-4 text-text-muted text-sm">
                No reports generated yet. Create your first report above!
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full text-left p-4 hover:bg-surface-raised transition-colors ${
                      selectedReport?.id === report.id ? 'bg-brand-50 dark:bg-brand-900/30' : ''
                    }`}
                  >
                    <p className="font-medium text-text-primary text-sm">
                      {formatDate(report.period_start)} - {formatDate(report.period_end)}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Generated {formatDate(report.generated_at)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2">
          {selectedReport && content ? (
            <div className="bg-surface-card rounded-xl border border-surface-border">
              <div className="p-4 border-b border-surface-border flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Report Preview</h3>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-raised text-text-primary rounded-lg hover:bg-surface-border transition-colors"
                >
                  <span>🖨️</span>
                  <span>Print</span>
                </button>
              </div>

              <div ref={printRef} className="p-6 space-y-6 print:p-8">
                {/* Report Header */}
                <div className="text-center border-b border-surface-border pb-6">
                  <h1 className="text-2xl font-bold text-text-primary mb-2">
                    MemoGuard Care Summary
                  </h1>
                  <p className="text-lg text-text-secondary">{patientName}</p>
                  {patientDateOfBirth && (
                    <p className="text-sm text-text-muted">
                      Date of Birth: {formatDate(patientDateOfBirth)}
                    </p>
                  )}
                  <p className="text-sm text-text-muted mt-2">
                    Period: {formatDate(selectedReport.period_start)} to{' '}
                    {formatDate(selectedReport.period_end)}
                  </p>
                </div>

                {/* Overview */}
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">Overview</h2>
                  <p className="text-text-secondary">{content.period_summary}</p>
                </div>

                {/* Mood & Sleep */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-raised rounded-lg p-4">
                    <h3 className="font-medium text-text-primary mb-2">Mood (Self-Reported)</h3>
                    <p className="text-2xl font-bold text-brand-600">
                      {content.mood_trends.average}/5
                    </p>
                    <p className="text-sm text-text-muted">average daily rating</p>
                    {content.mood_trends.notable_days.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-text-muted">Notable days:</p>
                        {content.mood_trends.notable_days.slice(0, 3).map((day, i) => (
                          <p key={i} className="text-xs text-text-secondary">
                            {day.date}: {day.mood}/5 {day.note && `(${day.note})`}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-surface-raised rounded-lg p-4">
                    <h3 className="font-medium text-text-primary mb-2">Sleep (Self-Reported)</h3>
                    <p className="text-2xl font-bold text-brand-600">
                      {content.sleep_patterns.average_quality}/3
                    </p>
                    <p className="text-sm text-text-muted">average quality rating</p>
                    <p className="text-xs text-text-secondary mt-2">
                      Good nights: {content.sleep_patterns.good_nights} &middot;
                      Poor nights: {content.sleep_patterns.poor_nights}
                    </p>
                  </div>
                </div>

                {/* Activity Completion */}
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">
                    Activity & Routine Completion
                  </h2>
                  <p className="text-3xl font-bold text-brand-600 mb-3">
                    {content.activity_completion.overall_rate}%
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(content.activity_completion.by_category).map(([cat, rate]) => (
                      <div key={cat} className="bg-surface-raised rounded-lg p-3">
                        <p className="text-xs text-text-muted">{getCategoryLabel(cat)}</p>
                        <p className="text-lg font-semibold text-text-primary">{rate}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medication Adherence */}
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">
                    Medication Reminder Adherence
                  </h2>
                  <p className="text-3xl font-bold text-brand-600">
                    {content.medication_adherence.rate}%
                  </p>
                  {content.medication_adherence.missed_count > 0 && (
                    <p className="text-sm text-text-secondary">
                      {content.medication_adherence.missed_count} reminder(s) not marked as complete
                    </p>
                  )}
                </div>

                {/* Family Observations */}
                {content.notable_observations.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary mb-3">
                      Family Observations
                    </h2>
                    <ul className="space-y-2">
                      {content.notable_observations.map((obs, i) => (
                        <li key={i} className="text-text-secondary text-sm flex gap-2">
                          <span>•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Caregiver Concerns */}
                {content.caregiver_concerns.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary mb-3">
                      Caregiver Concerns to Discuss
                    </h2>
                    <ul className="space-y-2">
                      {content.caregiver_concerns.map((concern, i) => (
                        <li key={i} className="text-text-secondary text-sm flex gap-2">
                          <span>•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="border-t border-surface-border pt-6 mt-6">
                  <p className="text-xs text-text-muted italic">
                    This summary is based on self-reported wellness data collected via the
                    MemoGuard app. It is not a clinical assessment. All data should be discussed
                    with healthcare providers in the context of the patient&apos;s overall medical
                    history and current condition.
                  </p>
                  <p className="text-xs text-text-muted mt-2">
                    Generated on {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-card rounded-xl border border-surface-border p-8 text-center">
              <p className="text-text-muted">
                Select a report from the list or generate a new one to preview it here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
