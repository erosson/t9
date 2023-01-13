/**
 * a single digit of a T9 word. example: `4` (representing "h")
 */
export type Digit = number;

/**
 * a T9-encoded word; the user input. example: `"43556"` (representing "hello")
 */
export type Word = string;

/**
 * given a T9-encoded string, find all possible dictionary words for it
 */
export type Index = { [code: Word]: string[] };

/**
 * build an index from a list of dictionary words
 */
export function indexFromWords(words: string[]): Index {
  const index: Index = {};
  for (let word of words) {
    if (word === "") continue;
    const t9 = fromWord(word);
    index[t9] = index[t9] || [];
    // no dupes
    if (index[t9].findIndex((w) => w === word) < 0) {
      index[t9].push(word);
    }
  }
  return index;
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
