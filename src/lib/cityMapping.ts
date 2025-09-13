// City name mapping for German/English translations
export const cityMappings: Record<string, string[]> = {
  'köln': ['köln', 'cologne', 'koeln'],
  'münchen': ['münchen', 'munich', 'muenchen'],
  'düsseldorf': ['düsseldorf', 'dusseldorf', 'duesseldorf'],
  'frankfurt': ['frankfurt', 'frankfurt am main'],
  'hamburg': ['hamburg'],
  'berlin': ['berlin'],
  'stuttgart': ['stuttgart'],
  'bremen': ['bremen'],
  'hannover': ['hannover', 'hanover'],
  'nürnberg': ['nürnberg', 'nuremberg', 'nuernberg'],
  'dresden': ['dresden'],
  'leipzig': ['leipzig'],
  'dortmund': ['dortmund'],
  'essen': ['essen'],
  'duisburg': ['duisburg'],
  'bochum': ['bochum'],
  'wuppertal': ['wuppertal'],
  'bielefeld': ['bielefeld'],
  'bonn': ['bonn'],
  'münster': ['münster', 'munster', 'muenster'],
  'karlsruhe': ['karlsruhe'],
  'mannheim': ['mannheim'],
  'augsburg': ['augsburg'],
  'wiesbaden': ['wiesbaden'],
  'gelsenkirchen': ['gelsenkirchen'],
  'mönchengladbach': ['mönchengladbach', 'monchengladbach', 'moenchengladbach'],
  'braunschweig': ['braunschweig', 'brunswick'],
  'chemnitz': ['chemnitz'],
  'kiel': ['kiel'],
  'aachen': ['aachen'],
  'halle': ['halle'],
  'magdeburg': ['magdeburg'],
  'freiburg': ['freiburg'],
  'krefeld': ['krefeld'],
  'lübeck': ['lübeck', 'lubeck', 'luebeck'],
  'oberhausen': ['oberhausen'],
  'erfurt': ['erfurt'],
  'mainz': ['mainz'],
  'rostock': ['rostock'],
  'kassel': ['kassel'],
  'hagen': ['hagen'],
  'potsdam': ['potsdam'],
  'saarbrücken': ['saarbrücken', 'saarbruecken', 'saarbrucken'],
  'hamm': ['hamm'],
  'mülheim': ['mülheim', 'muelheim', 'mulheim'],
  'ludwigshafen': ['ludwigshafen'],
  'leverkusen': ['leverkusen'],
  'oldenburg': ['oldenburg'],
  'solingen': ['solingen'],
  'heidelberg': ['heidelberg'],
  'herne': ['herne'],
  'neuss': ['neuss'],
  'darmstadt': ['darmstadt'],
  'paderborn': ['paderborn'],
  'regensburg': ['regensburg'],
  'ingolstadt': ['ingolstadt'],
  'würzburg': ['würzburg', 'wuerzburg', 'wurzburg'],
  'fürth': ['fürth', 'fuerth', 'furth'],
  'wolfsburg': ['wolfsburg'],
  'offenbach': ['offenbach'],
  'ulm': ['ulm'],
  'heilbronn': ['heilbronn'],
  'pforzheim': ['pforzheim'],
  'göttingen': ['göttingen', 'goettingen', 'gottingen'],
  'bottrop': ['bottrop'],
  'trier': ['trier'],
  'recklinghausen': ['recklinghausen'],
  'reutlingen': ['reutlingen'],
  'bremerhaven': ['bremerhaven'],
  'koblenz': ['koblenz'],
  'bergisch gladbach': ['bergisch gladbach'],
  'jena': ['jena'],
  'remscheid': ['remscheid'],
  'erlangen': ['erlangen'],
  'moers': ['moers'],
  'siegen': ['siegen'],
  'hildesheim': ['hildesheim'],
  'salzgitter': ['salzgitter']
};

// Normalize a city name by removing accents and converting to lowercase
export const normalizeCity = (city: string): string => {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .trim();
};

// Find all possible variations of a city name
export const getCityVariations = (searchTerm: string): string[] => {
  const normalized = normalizeCity(searchTerm);
  
  // Find the city mapping that includes this search term
  for (const [canonical, variations] of Object.entries(cityMappings)) {
    if (variations.some(variant => normalizeCity(variant).includes(normalized))) {
      return variations;
    }
  }
  
  // If no mapping found, return the original search term
  return [searchTerm];
};

// Check if a city matches a search term (considering all variations)
export const cityMatches = (cityInDb: string, searchTerm: string): boolean => {
  if (!cityInDb || !searchTerm) return false;
  
  const normalizedDbCity = normalizeCity(cityInDb);
  const normalizedSearch = normalizeCity(searchTerm);
  
  // Exact match first
  if (normalizedDbCity === normalizedSearch) {
    return true;
  }
  
  // Check if the search term matches any variation for this city
  const searchVariations = getCityVariations(searchTerm);
  return searchVariations.some(variation => {
    const normalizedVariation = normalizeCity(variation);
    return normalizedDbCity === normalizedVariation || 
           (normalizedVariation.length > 3 && normalizedDbCity.includes(normalizedVariation));
  });
};