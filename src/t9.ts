/**
 * a single digit of a T9 word. example: `4` (representing "h")
 */
export type Digit = number;

/**
 * a T9-encoded word; the user input. example: `"43556"` (representing "hello")
 */
export type Word = string;

/**
 * given a T9-encoded word, find some matching dictionary words
 */
export type Index = { [code: Word]: IndexEntry };

/**
 * Matching dictionary words for a T9 string
 */
type IndexEntry = {
  /**
   * Commonly-used exact matches for this input, ordered by popularity. Rank these first, in order
   */
  popular: IndexEntrySource;

  /**
   * Uncommonly-used exact matches for this input, unordered. Rank these last
   */
  dict: IndexEntrySource;
};
type IndexEntrySource = {
  /**
   * Exact matches
   */
  words: string[];
  /**
   * This input's a prefix of these other inputs, suggest them too
   */
  prefix: Word[];
};
function emptySource(): IndexEntrySource {
  return { words: [], prefix: [] };
}

export function buildIndex(source: {
  popular: Iterable<string>;
  dict: Iterable<string>;
}): Index {
  const popular = buildSource(source.popular, (s, w) => s !== "" && w !== "");
  const dict = buildSource(
    source.dict,
    (s, w) => s !== "" && w !== "" && !popular[w]?.words?.length
  );
  const index: Index = {};
  // merge sources, grouping by word
  const keys = Object.keys(popular).concat(Object.keys(dict));
  for (let key of Array.from(keys)) {
    if (!(key in index)) {
      index[key] = {
        popular: popular[key] ?? emptySource(),
        dict: dict[key] ?? emptySource(),
      };
    }
  }
  return index;
}
function buildSource(
  words: Iterable<string>,
  filter: (s: string, w: Word) => boolean
): { [w: Word]: IndexEntrySource } {
  const index: { [w: Word]: IndexEntrySource } = {};
  for (let word of words) {
    let t9 = fromWord(word);
    if (filter(word, t9)) {
      index[t9] = index[t9] || emptySource();
      // no dupes
      if (index[t9].words.findIndex((w) => w === word) < 0) {
        index[t9].words.push(word);
      }

      for (let prefix of prefixes(t9)) {
        index[prefix] = index[prefix] || emptySource();
        index[prefix].prefix.push(t9);
      }
    }
  }
  return index;
}

function prefixes(word: Word): Word[] {
  return range(word.length - 1).map((i) => word.slice(0, i));
}
function range(n: number): number[] {
  return Array.from(Array(n).keys());
}

/**
 * map digits to the letters each represents. `{2: "abc", 3: "def", ...}`
 */
export const letters = [
  "",
  "",
  "abc",
  "def",
  "ghi",
  "jkl",
  "mno",
  "pqrs",
  "tuv",
  "wxyz",
];

/**
 * inverted `letters` table; map letters to their digits.
 * `{a: 2, b: 2, c: 2, d: 3, e: 3, f: 3, ...}`
 */
export const byLetter: { [l: string]: number } = Object.fromEntries(
  letters.flatMap((ls, n) => ls.split("").map((l) => [l, n]))
);

/**
 * transform a string to a T9 word. `"Hello!"` => `"43556"`
 */
export function fromWord(word: string): Word {
  return word
    .toLowerCase()
    .split("")
    .map((l) => byLetter[l])
    .filter((t9) => !!t9)
    .join("");
}

type Result = { word: string; source: string };

/**
 * Given an index and some input, rank the possible words.
 */
export function ranking(index: Index, input: Word): Result[] {
  if (!input) return [];
  const numeric: Result = { word: input, source: "numeric" };
  const data = index[input];
  if (!data) return [numeric];
  const popularPrefix = data.popular.prefix.flatMap(
    (p) => index[p].popular.words
  );
  const dictPrefix = data.dict.prefix.flatMap((p) =>
    p.length >= 3 ? index[p].dict.words : []
  );
  return [
    data.popular.words.map((word) => ({ word, source: "popular-words" })),
    popularPrefix.map((word) => ({ word, source: "popular-prefix" })),
    data.dict.words.map((word) => ({ word, source: "dict-words" })),
    dictPrefix.map((word) => ({ word, source: "dict-prefix" })),
    numeric,
  ].flat();
}

export function words(index: Index, input: Word): string[] {
  return ranking(index, input).map((r) => r.word);
}
