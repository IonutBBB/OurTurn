/**
 * Pexels API — for nature and animal images.
 * Requires API key, but fallback to bundled content if unavailable.
 *
 * Note: Since this is a patient-facing app and we don't want to expose
 * API keys in the bundle, this service returns null and the app falls
 * back to bundled content. Can be enabled with an Edge Function proxy later.
 */

interface AnimalContent {
  factKey: string;
  emoji: string;
  imageUrl?: string;
}

export async function fetchAnimalContent(): Promise<AnimalContent | null> {
  // Pexels requires API key — return null to use bundled fallback.
  // In future, route through a Supabase Edge Function proxy.
  return null;
}
