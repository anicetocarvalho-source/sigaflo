export interface AgronomicInput {
  crop: string;
  province: string;
  areaHa: number;
}

export interface AgronomicRecommendation {
  expectedYield: string;
  plantingWindow: string;
  fertilization: string;
  irrigation: string;
  recommendedPackage: string;
  spacing: string;
  cycleDays: number;
  mainPests: string;
  mainDiseases: string;
}

const CROP_DATA: Record<string, AgronomicRecommendation> = {
  'Milho': {
    expectedYield: '2.0-4.5 t/ha',
    plantingWindow: 'Set-Nov (campanha principal)',
    fertilization: 'NPK 12-24-12 (200 kg/ha) + Ureia cobertura',
    irrigation: 'Sequeiro ou suplementar',
    recommendedPackage: 'Pacote Cereais A',
    spacing: '80×25 cm',
    cycleDays: 120,
    mainPests: 'Lagarta-do-cartucho, Broca do colmo',
    mainDiseases: 'Ferrugem, Mancha foliar',
  },
  'Mandioca': {
    expectedYield: '8-15 t/ha',
    plantingWindow: 'Out-Dez',
    fertilization: 'NPK 10-10-20 (150 kg/ha)',
    irrigation: 'Sequeiro',
    recommendedPackage: 'Pacote Raízes B',
    spacing: '100×100 cm',
    cycleDays: 365,
    mainPests: 'Mosca-branca, Cochonilha',
    mainDiseases: 'Mosaico, Podridão radicular',
  },
  'Feijão': {
    expectedYield: '0.8-1.5 t/ha',
    plantingWindow: 'Set-Out / Fev-Mar',
    fertilization: 'NPK 12-24-12 (150 kg/ha)',
    irrigation: 'Sequeiro',
    recommendedPackage: 'Pacote Leguminosas C',
    spacing: '50×20 cm',
    cycleDays: 90,
    mainPests: 'Caruncho, Pulgão',
    mainDiseases: 'Ferrugem, Antracnose',
  },
  'Arroz': {
    expectedYield: '3-6 t/ha',
    plantingWindow: 'Nov-Jan',
    fertilization: 'NPK 15-15-15 (250 kg/ha) + Ureia',
    irrigation: 'Alagamento controlado',
    recommendedPackage: 'Pacote Arroz D',
    spacing: '25×25 cm ou lanço',
    cycleDays: 150,
    mainPests: 'Broca do arroz, Percevejo',
    mainDiseases: 'Brusone, Bainha parda',
  },
  'Café': {
    expectedYield: '0.5-1.2 t/ha (cereja)',
    plantingWindow: 'Início das chuvas',
    fertilization: 'NPK 20-5-20 (300 kg/ha) + calcário',
    irrigation: 'Gotejamento ou aspersão',
    recommendedPackage: 'Pacote Café Premium',
    spacing: '300×200 cm',
    cycleDays: 270,
    mainPests: 'Broca-do-café, Bicho mineiro',
    mainDiseases: 'Ferrugem, Cercosporiose',
  },
  'Banana': {
    expectedYield: '15-30 t/ha',
    plantingWindow: 'Início das chuvas',
    fertilization: 'NPK 12-6-24 (400 kg/ha) + matéria orgânica',
    irrigation: 'Gotejamento',
    recommendedPackage: 'Pacote Frutícolas E',
    spacing: '300×300 cm',
    cycleDays: 300,
    mainPests: 'Broca do rizoma, Tripes',
    mainDiseases: 'Sigatoka, Panama',
  },
  'Batata-doce': {
    expectedYield: '5-12 t/ha',
    plantingWindow: 'Set-Nov',
    fertilization: 'NPK 10-10-20 (200 kg/ha)',
    irrigation: 'Sequeiro',
    recommendedPackage: 'Pacote Raízes B',
    spacing: '80×30 cm',
    cycleDays: 120,
    mainPests: 'Gorgulho, Lagarta',
    mainDiseases: 'Podridão mole, Sarna',
  },
  'Amendoim': {
    expectedYield: '0.8-1.5 t/ha',
    plantingWindow: 'Set-Nov',
    fertilization: 'NPK 6-20-20 (150 kg/ha) + gesso',
    irrigation: 'Sequeiro',
    recommendedPackage: 'Pacote Leguminosas C',
    spacing: '50×15 cm',
    cycleDays: 110,
    mainPests: 'Tripes, Afídeos',
    mainDiseases: 'Cercosporiose, Ferrugem',
  },
  'Soja': {
    expectedYield: '1.5-3.0 t/ha',
    plantingWindow: 'Out-Dez',
    fertilization: 'NPK 0-20-20 (200 kg/ha) + inoculante',
    irrigation: 'Sequeiro ou suplementar',
    recommendedPackage: 'Pacote Oleaginosas F',
    spacing: '50×5 cm',
    cycleDays: 120,
    mainPests: 'Lagarta-da-soja, Percevejo',
    mainDiseases: 'Ferrugem asiática, Oídio',
  },
  'Hortícolas': {
    expectedYield: '10-25 t/ha',
    plantingWindow: 'Todo o ano (irrigado)',
    fertilization: 'NPK 12-12-17 (300 kg/ha) + composto',
    irrigation: 'Gotejamento ou aspersão',
    recommendedPackage: 'Pacote Hortícola G',
    spacing: 'Variável por espécie',
    cycleDays: 60,
    mainPests: 'Mosca-branca, Lagarta',
    mainDiseases: 'Murchadeira, Oídio',
  },
};

const DEFAULT: AgronomicRecommendation = {
  expectedYield: '—',
  plantingWindow: 'Consultar extensionista',
  fertilization: 'Análise de solo recomendada',
  irrigation: 'Dependente da cultura',
  recommendedPackage: 'Pacote Base',
  spacing: '—',
  cycleDays: 120,
  mainPests: '—',
  mainDiseases: '—',
};

export const getAgronomicRecommendation = (input: AgronomicInput): AgronomicRecommendation => {
  return CROP_DATA[input.crop] || DEFAULT;
};
