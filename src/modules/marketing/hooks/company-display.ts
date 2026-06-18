interface CompanyLabelSource {
  name: string;
  companyCode: string;
}

/** Prefer a readable name; fall back to company code when name is missing or too short. */
export function companyDisplayName(company: CompanyLabelSource): string {
  const name = company.name?.trim() ?? '';
  const code = company.companyCode?.trim() ?? '';
  if (name.length > 1) return name;
  if (code) return code;
  return name;
}

export function companyDisplayTitle(company: CompanyLabelSource): string {
  const name = company.name?.trim() ?? '';
  const code = company.companyCode?.trim() ?? '';
  if (name && code && name !== code) return `${name} (${code})`;
  return companyDisplayName(company);
}
