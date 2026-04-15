const CARD_NAME_PATTERN = /^[A-Za-z0-9 ,.'’:/-]+$/;

function cleanLine(line: string) {
  return line
    .replace(/\s+/g, ' ')
    .replace(/[|]/g, 'I')
    .replace(/[“”]/g, '"')
    .trim();
}

export function extractCandidateNames(lines: string[]): string[] {
  const seen = new Set<string>();
  const candidates: string[] = [];

  for (const line of lines.map(cleanLine)) {
    if (line.length < 3 || line.length > 36) {
      continue;
    }

    if (!CARD_NAME_PATTERN.test(line)) {
      continue;
    }

    if (/^(instant|sorcery|creature|planeswalker|land|artifact|enchantment)$/i.test(line)) {
      continue;
    }

    if (/^[0-9/]+$/.test(line)) {
      continue;
    }

    const normalized = line.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      candidates.push(line);
    }
  }

  return candidates.slice(0, 6);
}
