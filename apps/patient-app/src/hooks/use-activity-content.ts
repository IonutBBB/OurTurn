/**
 * Content pipeline for mind game activities.
 * Priority: API fetch (with cache) → AsyncStorage cache → bundled fallback.
 * No difficulty levels — all content is welcoming and failure-free.
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StimActivityType } from '@ourturn/shared';
import { formatDateForDb } from '../utils/time-of-day';
import { pickDaily, pickDailyMultiple } from '../utils/daily-seed';
import { BUNDLED_CONTENT } from '../data/bundled-activities';
import { fetchGentleQuizContent } from '../services/opentdb-api';

/** Games that return multiple items for multi-round sessions */
const MULTI_ROUND_COUNTS: Partial<Record<StimActivityType, number>> = {
  gentle_quiz: 5,
  word_association: 5,
  proverbs: 5,
  what_would_you_choose: 4,
};

type ContentSource = 'api' | 'local_cache' | 'bundled';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(type: StimActivityType, date: string): string {
  return `activity_content_${type}_${date}`;
}

/** Activities that can fetch from external APIs */
const API_ACTIVITIES: Partial<Record<StimActivityType, () => Promise<unknown>>> = {
  gentle_quiz: fetchGentleQuizContent,
};

export function useActivityContent(
  activityType: StimActivityType,
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
      const cacheKey = getCacheKey(activityType, today);

      // 1. Try AsyncStorage cache (from previous API fetch)
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            if (!cancelled) {
              setContent(parsed.data);
              setSource('local_cache');
              setIsLoading(false);
            }
            return;
          }
        }
      } catch {
        // Cache read failed, continue
      }

      // 2. Try API fetch for supported activities
      const apiFetcher = API_ACTIVITIES[activityType];
      if (apiFetcher) {
        try {
          const apiData = await apiFetcher();
          if (apiData && !cancelled) {
            setContent(apiData);
            setSource('api');
            setIsLoading(false);
            // Cache for offline
            await AsyncStorage.setItem(
              cacheKey,
              JSON.stringify({ data: apiData, timestamp: Date.now() })
            );
            return;
          }
        } catch {
          // API failed, fall through to bundled
        }
      }

      // 3. Fall back to bundled content
      if (!cancelled) {
        const pool = BUNDLED_CONTENT[activityType] ?? [];
        const multiCount = MULTI_ROUND_COUNTS[activityType];
        const picked = multiCount
          ? pickDailyMultiple(pool, multiCount)
          : pickDaily(pool);
        setContent(picked);
        setSource('bundled');
        setIsLoading(false);
      }
    }

    loadContent();
    return () => { cancelled = true; };
  }, [activityType, householdId]);

  return { content, isLoading, source };
}
