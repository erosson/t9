import * as T9 from "./t9";
import * as fs from "fs/promises";

const data = [
  { input: "43556", output: ["hello", "Hellman", "Hellman's", "43556"] },
  {
    input: "463",
    output: [
      "god",
      "inf",
      "ind",
      "imf",
      "gnd",
      "information",
      "index",
      "industry",
      "individual",
      "india",
    ],
  },
  {
    input: "4636",
    output: [
      "info",
      "indo",
      "information",
      "informed",
      "indonesia",
      "indoor",
      "inform",
      "informational",
      "informal",
      "informative",
    ],
  },
  {
    input: "6666",
    output: [
      "moon",
      "noon",
      "mono",
      "monopoly",
      "monogram",
      "moonlight",
      "monoclonal",
      "monophonic",
      "monmouth",
      "Monmouth's",
    ],
  },
  {
    input: "666666666666",
    output: ["666666666666"],
  },
];

let index: T9.Index;

beforeAll(async () => {
  const [dict, popular] = await Promise.all([
    fs
      .readFile(`${__dirname}/../data/words.txt`)
      .then((f) => f.toString().split("\n")),
    fs
      .readFile(`${__dirname}/../data/20k.txt`)
      .then((f) => f.toString().split("\n")),
  ]);
  index = T9.buildIndex({ dict, popular });
});

test.each(data)("test input: $input", ({ input, output }) => {
  expect(T9.words(index, input).slice(0, 10)).toEqual(output);
  expect(T9.ranking(index, input).slice(0, 10)).toMatchSnapshot(input);
});
