/**
 * Detects references to Georgian laws and official sources in message text
 * and replaces the FIRST occurrence with a markdown link (rendered as inline badge via CSS).
 */

interface SourceRule {
  /** Pattern to match — only FIRST match will be replaced */
  pattern: RegExp;
  /** The URL to link to */
  url: string;
}

const RULES: SourceRule[] = [
  // Labour Migration Portal — labourmigration.moh.gov.ge
  {
    pattern:
      /Labour\s+Migration\s+Portal|Labor\s+Migration\s+Portal|(?:www\.)?labourmigration\.moh\.gov\.ge/i,
    url: "https://labourmigration.moh.gov.ge",
  },
  // D1 visa — geoconsul.gov.ge
  {
    pattern: /D1\s+(?:immigration\s+)?visa|D1\s+category\s+visa/i,
    url: "https://geoconsul.gov.ge/en",
  },
  // Worknet / labor market test — worknet.moh.gov.ge
  {
    pattern:
      /(?:www\.)?worknet\.moh\.gov\.ge|labour\s+market\s+test|labor\s+market\s+test/i,
    url: "https://worknet.moh.gov.ge",
  },
  // Ordinance №70 — matsne.gov.ge/ka/document/view/6791218
  {
    pattern: /Ordinance\s*(?:№|No\.?\s*|#\s*)70|Resolution\s*(?:№|No\.?\s*|#\s*)70/i,
    url: "https://www.matsne.gov.ge/ka/document/view/6791218?publication=0",
  },
  // Law on Labour Migration — matsne.gov.ge/document/view/2806732
  {
    pattern:
      /Law\s+on\s+Labo(?:u)?r\s+Migration|Labo(?:u)?r\s+Migration\s+Law/i,
    url: "https://www.matsne.gov.ge/document/view/2806732?publication=6",
  },
  // Law on Legal Status of Aliens — matsne.gov.ge/en/document/view/2278806
  {
    pattern:
      /Law\s+on\s+(?:the\s+)?Legal\s+Status\s+of\s+Aliens(?:\s+and\s+Stateless\s+Persons)?/i,
    url: "https://www.matsne.gov.ge/en/document/view/2278806?publication=20",
  },
  // State Employment Promotion Agency — labourmigration.moh.gov.ge
  {
    pattern: /State\s+Employment\s+Promotion\s+Agency/i,
    url: "https://labourmigration.moh.gov.ge",
  },
  // Ministry of Internal Affairs — police.ge
  {
    pattern: /Ministry\s+of\s+Internal\s+Affairs/i,
    url: "https://police.ge/",
  },
  // geoconsul.gov.ge plain mention
  {
    pattern: /(?:www\.)?geoconsul\.gov\.ge/i,
    url: "https://geoconsul.gov.ge/en",
  },
  // matsne.gov.ge plain mention
  {
    pattern: /(?:www\.)?matsne\.gov\.ge/i,
    url: "https://www.matsne.gov.ge/ka",
  },
  // police.ge plain mention
  {
    pattern: /(?:www\.)?police\.ge/i,
    url: "https://police.ge/",
  },
  // Work residence permit — Law on Legal Status of Aliens
  {
    pattern: /(?:work|labo(?:u)?r)\s+residence\s+permit/i,
    url: "https://www.matsne.gov.ge/en/document/view/2278806?publication=20",
  },
  // Investment residence permit — Law on Legal Status of Aliens
  {
    pattern: /investment\s+residence\s+permit/i,
    url: "https://www.matsne.gov.ge/en/document/view/2278806?publication=20",
  },
  // IT residence permit — Law on Legal Status of Aliens
  {
    pattern: /IT\s+residence\s+permit/i,
    url: "https://www.matsne.gov.ge/en/document/view/2278806?publication=20",
  },
  // Subsistence minimum — Law on Legal Status of Aliens
  {
    pattern: /subsistence\s+minimum/i,
    url: "https://www.matsne.gov.ge/en/document/view/2278806?publication=20",
  },
];

/**
 * Replace only the FIRST occurrence of pattern in text with a markdown link.
 * Skips text already inside markdown links.
 */
function replaceFirst(
  text: string,
  pattern: RegExp,
  url: string,
): string {
  // Split into: markdown links vs plain text
  const linkRe = /\[([^\]]*)\]\([^)]*\)/g;
  const parts: { value: string; isLink: boolean }[] = [];
  let last = 0;

  for (const m of text.matchAll(linkRe)) {
    const start = m.index!;
    if (start > last) parts.push({ value: text.slice(last, start), isLink: false });
    parts.push({ value: m[0], isLink: true });
    last = start + m[0].length;
  }
  if (last < text.length) parts.push({ value: text.slice(last), isLink: false });

  let replaced = false;
  const result = parts
    .map((p) => {
      if (p.isLink || replaced) return p.value;
      const match = p.value.match(pattern);
      if (match) {
        replaced = true;
        // Replace only the first occurrence
        return p.value.replace(pattern, `[$&](${url})`);
      }
      return p.value;
    })
    .join("");

  return result;
}

/**
 * Inject markdown links for known law/source references.
 * Only the first occurrence of each source is linked.
 */
export function injectSourceLinks(text: string): string {
  let result = text;
  for (const rule of RULES) {
    result = replaceFirst(result, rule.pattern, rule.url);
  }
  return result;
}
