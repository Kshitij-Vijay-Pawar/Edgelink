// src/crawlers/schemaValidator.ts
export interface SchemaValidationResult {
  hasSchema: boolean;
  detectedTypes: string[];
  valid: boolean;
  errors: string[];
  warnings: string[];
  schemas: any[];
}

export function validateSchema(jsonLdList: any[]): SchemaValidationResult {
  if (!jsonLdList || jsonLdList.length === 0) {
    return {
      hasSchema: false,
      detectedTypes: [],
      valid: false,
      errors: ['No JSON-LD structured data detected on page'],
      warnings: ['Missing LocalBusiness/Dentist/Healthcare structured data'],
      schemas: [],
    };
  }

  const detectedTypes: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const item of jsonLdList) {
    const rawType = item['@type'];
    const types = Array.isArray(rawType) ? rawType : [rawType];
    detectedTypes.push(...types.filter(Boolean));

    // Validate LocalBusiness / Medical / Dentist types
    const isLocalBusiness = types.some((t) =>
      ['LocalBusiness', 'Dentist', 'MedicalBusiness', 'Physician', 'RealEstateAgent', 'Organization'].includes(t)
    );

    if (isLocalBusiness) {
      if (!item.name) errors.push(`Schema ${types.join(',')} missing 'name'`);
      if (!item.address) warnings.push(`Schema ${types.join(',')} missing 'address'`);
      if (!item.telephone) warnings.push(`Schema ${types.join(',')} missing 'telephone'`);
      if (!item.geo) warnings.push(`Schema ${types.join(',')} missing 'geo' latitude/longitude`);
    }
  }

  return {
    hasSchema: detectedTypes.length > 0,
    detectedTypes,
    valid: errors.length === 0,
    errors,
    warnings,
    schemas: jsonLdList,
  };
}

