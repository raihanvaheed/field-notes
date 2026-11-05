// Parsing for ```formula blocks. Pure functions.
//
//   L(N, D) = E + A / N^α + B / D^β     <- line 1 is the formula
//   L: the model's loss                 <- every other line is "symbol: meaning"
//   N: number of model parameters
//   A / N^α: the penalty for a model that is too small

export type FormulaSymbol = { symbol: string; meaning: string };

/** A run of the formula: plain text (`symbol: null`) or one of the listed symbols. */
export type FormulaToken = { text: string; symbol: number | null };

export function parseFormula(source: string): { tokens: FormulaToken[]; symbols: FormulaSymbol[] } {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "");
  if (lines.length === 0) throw new Error("A formula block is empty");

  const [formula, ...definitions] = lines;

  const symbols = definitions.map((line): FormulaSymbol => {
    const colon = line.indexOf(":");
    const symbol = colon > 0 ? line.slice(0, colon).trim() : "";
    const meaning = colon > 0 ? line.slice(colon + 1).trim() : "";
    if (!symbol || !meaning) {
      throw new Error(`Formula line "${line}" must be written as "symbol: meaning"`);
    }
    return { symbol, meaning };
  });

  const seen = new Set<string>();
  for (const { symbol } of symbols) {
    if (seen.has(symbol)) throw new Error(`Formula symbol "${symbol}" is listed twice`);
    seen.add(symbol);
  }

  // Longest first, so that "N_call" wins over "N".
  const longestFirst = symbols
    .map((_, index) => index)
    .sort((a, b) => symbols[b].symbol.length - symbols[a].symbol.length);

  const tokens: FormulaToken[] = [];
  let plain = "";
  let i = 0;
  while (i < formula.length) {
    const hit = longestFirst.find((k) => formula.startsWith(symbols[k].symbol, i));
    if (hit === undefined) {
      plain += formula[i];
      i += 1;
      continue;
    }
    if (plain) tokens.push({ text: plain, symbol: null });
    plain = "";
    tokens.push({ text: symbols[hit].symbol, symbol: hit });
    i += symbols[hit].symbol.length;
  }
  if (plain) tokens.push({ text: plain, symbol: null });

  return { tokens, symbols };
}
