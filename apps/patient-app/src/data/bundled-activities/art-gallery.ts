export interface ArtGalleryContent {
  title: string;
  artist: string;
  year: string;
  imageUrl?: string;
  descriptionKey: string;
  reflectionKeys: string[];
}

const REFLECTIONS = [
  'patientApp.stim.artGallery.reflections.colours',
  'patientApp.stim.artGallery.reflections.remind',
  'patientApp.stim.artGallery.reflections.feel',
  'patientApp.stim.artGallery.reflections.notice',
  'patientApp.stim.artGallery.reflections.story',
];

export const ART_GALLERY_CONTENT: ArtGalleryContent[] = [
  { title: 'The Starry Night', artist: 'Vincent van Gogh', year: '1889', descriptionKey: 'patientApp.stim.artGallery.works.starryNight', reflectionKeys: REFLECTIONS },
  { title: 'Water Lilies', artist: 'Claude Monet', year: '1906', descriptionKey: 'patientApp.stim.artGallery.works.waterLilies', reflectionKeys: REFLECTIONS },
  { title: 'Sunflowers', artist: 'Vincent van Gogh', year: '1888', descriptionKey: 'patientApp.stim.artGallery.works.sunflowers', reflectionKeys: REFLECTIONS },
  { title: 'Girl with a Pearl Earring', artist: 'Johannes Vermeer', year: '1665', descriptionKey: 'patientApp.stim.artGallery.works.girlPearl', reflectionKeys: REFLECTIONS },
  { title: 'The Great Wave', artist: 'Katsushika Hokusai', year: '1831', descriptionKey: 'patientApp.stim.artGallery.works.greatWave', reflectionKeys: REFLECTIONS },
  { title: 'Mona Lisa', artist: 'Leonardo da Vinci', year: '1503', descriptionKey: 'patientApp.stim.artGallery.works.monaLisa', reflectionKeys: REFLECTIONS },
  { title: 'Poppy Field', artist: 'Claude Monet', year: '1873', descriptionKey: 'patientApp.stim.artGallery.works.poppyField', reflectionKeys: REFLECTIONS },
  { title: 'The Ballet Class', artist: 'Edgar Degas', year: '1874', descriptionKey: 'patientApp.stim.artGallery.works.balletClass', reflectionKeys: REFLECTIONS },
  { title: 'Haystacks', artist: 'Claude Monet', year: '1891', descriptionKey: 'patientApp.stim.artGallery.works.haystacks', reflectionKeys: REFLECTIONS },
  { title: 'The Umbrellas', artist: 'Pierre-Auguste Renoir', year: '1886', descriptionKey: 'patientApp.stim.artGallery.works.umbrellas', reflectionKeys: REFLECTIONS },
  { title: 'The Japanese Bridge', artist: 'Claude Monet', year: '1899', descriptionKey: 'patientApp.stim.artGallery.works.japaneseBridge', reflectionKeys: REFLECTIONS },
  { title: 'Irises', artist: 'Vincent van Gogh', year: '1889', descriptionKey: 'patientApp.stim.artGallery.works.irises', reflectionKeys: REFLECTIONS },
  { title: 'Luncheon of the Boating Party', artist: 'Pierre-Auguste Renoir', year: '1881', descriptionKey: 'patientApp.stim.artGallery.works.luncheon', reflectionKeys: REFLECTIONS },
  { title: 'Impression, Sunrise', artist: 'Claude Monet', year: '1872', descriptionKey: 'patientApp.stim.artGallery.works.impression', reflectionKeys: REFLECTIONS },
  { title: 'The Magpie', artist: 'Claude Monet', year: '1869', descriptionKey: 'patientApp.stim.artGallery.works.magpie', reflectionKeys: REFLECTIONS },
];
