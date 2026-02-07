'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast';
import type { Patient, PatientBiography } from '@ourturn/shared';

interface LifeStorySectionProps {
  patient: Patient;
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return value.split(',').map((s) => s.trim());
  return [];
}

function parseImportantPeople(value: unknown): { name: string; relationship: string }[] {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'object' && item !== null && 'name' in item) {
        return { name: String(item.name), relationship: String((item as any).relationship || '') };
      }
      return { name: String(item), relationship: '' };
    });
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split('\n').filter(Boolean).map((line) => {
      const match = line.match(/^(.+?)\s*\((.+?)\)\s*$/);
      if (match) return { name: match[1].trim(), relationship: match[2].trim() };
      return { name: line.trim(), relationship: '' };
    });
  }
  return [];
}

function parseKeyEvents(value: unknown): { description: string; year?: number }[] {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'object' && item !== null && 'description' in item) {
        return { description: String(item.description), year: (item as any).year };
      }
      return { description: String(item) };
    });
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split('\n').filter(Boolean).map((line) => ({ description: line.trim() }));
  }
  return [];
}

function formatImportantPeople(people: { name: string; relationship: string }[]): string {
  return people.map((p) => p.relationship ? `${p.name} (${p.relationship})` : p.name).join('\n');
}

function formatKeyEvents(events: { description: string; year?: number }[]): string {
  return events.map((e) => e.description).join('\n');
}

export default function LifeStorySection({ patient }: LifeStorySectionProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const bio = (patient.biography || {}) as Record<string, unknown>;

  const [childhoodLocation, setChildhoodLocation] = useState(String(bio.childhood_location || ''));
  const [career, setCareer] = useState(String(bio.career || ''));
  const [hobbies, setHobbies] = useState(toArray(bio.hobbies).join(', '));
  const [favoriteMusic, setFavoriteMusic] = useState(toArray(bio.favorite_music).join(', '));
  const [favoriteFoods, setFavoriteFoods] = useState(toArray(bio.favorite_foods).join(', '));
  const [importantPeople, setImportantPeople] = useState(formatImportantPeople(parseImportantPeople(bio.important_people)));
  const [keyEvents, setKeyEvents] = useState(formatKeyEvents(parseKeyEvents(bio.key_events)));
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Fetch current biography to preserve photos and any other keys
      const { data: current } = await supabase
        .from('patients')
        .select('biography')
        .eq('id', patient.id)
        .single();

      const currentBio = (current?.biography as Record<string, unknown>) || {};

      const updatedBio: PatientBiography & Record<string, unknown> = {
        ...currentBio,
        childhood_location: childhoodLocation || undefined,
        career: career || undefined,
        hobbies: hobbies ? hobbies.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        favorite_music: favoriteMusic ? favoriteMusic.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        favorite_foods: favoriteFoods ? favoriteFoods.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        important_people: importantPeople.trim()
          ? importantPeople.split('\n').filter(Boolean).map((line) => {
              const match = line.match(/^(.+?)\s*\((.+?)\)\s*$/);
              if (match) return { name: match[1].trim(), relationship: match[2].trim() };
              return { name: line.trim(), relationship: '' };
            })
          : undefined,
        key_events: keyEvents.trim()
          ? keyEvents.split('\n').filter(Boolean).map((line) => {
              const yearMatch = line.match(/(\d{4})/);
              return { description: line.trim(), year: yearMatch ? parseInt(yearMatch[1]) : undefined };
            })
          : undefined,
      };

      const { error } = await supabase
        .from('patients')
        .update({ biography: updatedBio })
        .eq('id', patient.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card-paper p-6">
      <h2 className="text-lg font-display font-bold text-text-primary mb-2">
        {t('caregiverApp.settings.lifeStory')}
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        {t('caregiverApp.settings.lifeStoryDesc')}
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            {t('caregiverApp.settings.childhoodLocation')}
          </label>
          <input
            type="text"
            value={childhoodLocation}
            onChange={(e) => setChildhoodLocation(e.target.value)}
            className="input-warm w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            {t('caregiverApp.settings.career')}
          </label>
          <input
            type="text"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            className="input-warm w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            {t('caregiverApp.settings.hobbies')}
          </label>
          <input
            type="text"
            value={hobbies}
            onChange={(e) => setHobbies(e.target.value)}
            className="input-warm w-full"
            placeholder={t('caregiverApp.settings.hobbiesPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            {t('caregiverApp.settings.favoriteMusic')}
          </label>
          <input
            type="text"
            value={favoriteMusic}
            onChange={(e) => setFavoriteMusic(e.target.value)}
            className="input-warm w-full"
            placeholder={t('caregiverApp.settings.favoriteMusicPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            {t('caregiverApp.settings.favoriteFoods')}
          </label>
          <input
            type="text"
            value={favoriteFoods}
            onChange={(e) => setFavoriteFoods(e.target.value)}
            className="input-warm w-full"
            placeholder={t('caregiverApp.settings.favoriteFoodsPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            {t('caregiverApp.settings.importantPeople')}
          </label>
          <textarea
            value={importantPeople}
            onChange={(e) => setImportantPeople(e.target.value)}
            className="input-warm w-full min-h-[80px]"
            placeholder={t('caregiverApp.settings.importantPeoplePlaceholder')}
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            {t('caregiverApp.settings.keyEvents')}
          </label>
          <textarea
            value={keyEvents}
            onChange={(e) => setKeyEvents(e.target.value)}
            className="input-warm w-full min-h-[80px]"
            placeholder={t('caregiverApp.settings.keyEventsPlaceholder')}
            rows={3}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? t('caregiverApp.settings.savingLifeStory') : t('caregiverApp.settings.saveLifeStory')}
          </button>
          {saved && (
            <span className="text-sm text-status-success">{t('common.saved')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
