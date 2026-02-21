/**
 * Geocode an address string to lat/lng coordinates using Google Geocoding API.
 * Returns null on any failure — callers should treat coordinates as optional.
 */
export async function geocodeAddress(
  address: string,
  apiKey: string | undefined,
): Promise<{ lat: number; lng: number } | null> {
  if (!address || !apiKey) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 'OK' || !data.results?.[0]) return null;

    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } catch {
    return null;
  }
}
