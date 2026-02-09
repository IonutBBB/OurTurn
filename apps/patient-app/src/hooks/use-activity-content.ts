/**
 * Content pipeline for brain stimulation activities.
 * Priority: Supabase AI cache → AsyncStorage → bundled fallback.
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCachedContent } from '@ourturn/supabase';
import type { DifficultyLevel, StimActivityType } from '@ourturn/shared';
import { formatDateForDb } from '../utils/time-of-day';
import { pickDaily } from '../utils/daily-seed';
import {
  WORD_ASSOCIATION_CONTENT,
  ODD_WORD_OUT_CONTENT,
  PRICE_GUESSING_CONTENT,
  SORTING_CONTENT,
  PUT_IN_ORDER_CONTENT,
  PAIR_MATCHING_CONTENT,
  SOUND_ID_CONTENT,
  ART_DISCUSSION_CONTENT,
  TRUE_OR_FALSE_CONTENT,
  getHistoryFactForDate,
} from '../data/bundled-activities';

type ContentSource = 'ai_cache' | 'local_cache' | 'bundled';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BUNDLED_CONTENT_MAP: Record<StimActivityType, Record<DifficultyLevel, any[]>> = {
  word_association: WORD_ASSOCIATION_CONTENT,
  odd_word_out: ODD_WORD_OUT_CONTENT,
  price_guessing: PRICE_GUESSING_CONTENT,
  sorting_categorizing: SORTING_CONTENT,
  put_in_order: PUT_IN_ORDER_CONTENT,
  pair_matching: PAIR_MATCHING_CONTENT,
  sound_identification: SOUND_ID_CONTENT,
  this_day_in_history: { gentle: [], moderate: [], challenging: [] }, // special handling
  art_discussion: ART_DISCUSSION_CONTENT,
  true_or_false: TRUE_OR_FALSE_CONTENT,
};

function getLocalCacheKey(type: StimActivityType, date: string): string {
  return `stim_content_${type}_${date}`;
}

export function useActivityContent(
  activityType: StimActivityType,
  difficulty: DifficultyLevel,
  householdId: string | null | undefined
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<ContentSource>('bundled');

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      const today = formatDateForDb();

      // 1. Try Supabase AI cache
      if (householdId) {
        try {
          const cached = await getCachedContent(householdId, activityType, today);
          if (cached && !cancelled) {
            setContent(cached.content_json);
            setSource('ai_cache');
            setIsLoading(false);
            // Also save to AsyncStorage for offline
            await AsyncStorage.setItem(
              getLocalCacheKey(activityType, today),
              JSON.stringify(cached.content_json)
            );
            return;
          }
        } catch {
          // Supabase unavailable, continue
        }
      }

      // 2. Try AsyncStorage local cache
      try {
        const localStr = await AsyncStorage.getItem(getLocalCacheKey(activityType, today));
        if (localStr && !cancelled) {
          setContent(JSON.parse(localStr));
          setSource('local_cache');
          setIsLoading(false);
          return;
        }
      } catch {
        // AsyncStorage error, continue
      }

      // 3. Fall back to bundled content
      if (!cancelled) {
        if (activityType === 'this_day_in_history') {
          setContent(getHistoryFactForDate(new Date(), difficulty));
        } else {
          const pool = BUNDLED_CONTENT_MAP[activityType]?.[difficulty] ?? [];
          setContent(pickDaily(pool));
        }
        setSource('bundled');
        setIsLoading(false);
      }
    }

    loadContent();
    return () => { cancelled = true; };
  }, [activityType, difficulty, householdId]);

  return { content, isLoading, source };
}
