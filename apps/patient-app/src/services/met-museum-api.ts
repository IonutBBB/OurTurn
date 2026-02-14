/**
 * Met Museum Open Access API — free, no auth, CC0 licensed.
 * Fetches a random artwork with image for the Art Gallery activity.
 */

const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

interface ArtGalleryContent {
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  reflectionKeys: string[];
}

const REFLECTION_KEYS = [
  'patientApp.stim.artGallery.reflections.colours',
  'patientApp.stim.artGallery.reflections.remind',
  'patientApp.stim.artGallery.reflections.feel',
  'patientApp.stim.artGallery.reflections.notice',
  'patientApp.stim.artGallery.reflections.story',
];

// Departments with paintings: European Paintings (11), American Paintings (21)
const PAINTING_DEPARTMENTS = [11, 21];

export async function fetchArtGalleryContent(): Promise<ArtGalleryContent | null> {
  try {
    const deptId = PAINTING_DEPARTMENTS[Math.floor(Math.random() * PAINTING_DEPARTMENTS.length)];
    const searchRes = await fetch(
      `${BASE_URL}/search?departmentId=${deptId}&hasImages=true&q=painting`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    if (!searchData.objectIDs?.length) return null;

    // Pick a random object from first 100 results
    const pool = searchData.objectIDs.slice(0, 100);
    const objectId = pool[Math.floor(Math.random() * pool.length)];

    const objRes = await fetch(`${BASE_URL}/objects/${objectId}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!objRes.ok) return null;

    const obj = await objRes.json();
    if (!obj.primaryImageSmall) return null;

    return {
      title: obj.title || 'Untitled',
      artist: obj.artistDisplayName || 'Unknown Artist',
      year: obj.objectDate || '',
      imageUrl: obj.primaryImageSmall,
      reflectionKeys: REFLECTION_KEYS,
    };
  } catch {
    return null;
  }
}
