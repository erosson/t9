import React from "react";
import * as ReactDOM from "react-dom/client";
import "./main.css";
import * as T9 from "./t9";
import rawWordsUrl from "./words.txt";

/**
 * Application entry point. Load the dictionary, then display the input.
 */
function App(): JSX.Element {
  const [index, setIndex] = React.useState<T9.Index | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchDictionary().then(setIndex, setError);
  }, []);
  return index ? (
    <Ready index={index} />
  ) : error ? (
    <pre>{error}</pre>
  ) : (
    <div>loading...</div>
  );
}

/**
 * App UI and state after our dictionary has been loaded + processed
 */
function Ready(props: { index: T9.Index }): JSX.Element {
  const [text, setText] = React.useState<string>("");
  const [nextDigits, setNextDigits] = React.useState<number[]>([]);
  const [nextIndex, setNextIndex] = React.useState(0);

  const nextWord = nextDigits.join("");
  const nextStrings = nextWord
    ? [...(props.index[nextWord] ?? []), nextWord]
    : [];
  const nextString = nextStrings[nextIndex] ?? "";

  function pushNext(digit: Digit) {
    switch (digit) {
      case 0:
        console.log("spacebar");
        setText(`${text} ${nextString}`);
        setNextDigits([]);
        setNextIndex(0);
        return;
      case 1:
        console.log("clipboard copy");
        navigator.clipboard.writeText(text);
        return;
      case "*":
        if (nextWord === "") {
          console.log("backspace: text");
          setText(text.slice(0, -1));
        } else {
          console.log("backspace: digits");
          setNextDigits(nextDigits.slice(0, -1));
        }
        return;
      case "#":
        console.log("select next word", nextIndex);
        // select the next word in the list
        // `|| 0`: don't NaN on an empty list
        setNextIndex((nextIndex + 1) % nextStrings.length || 0);
        return;
      default:
        console.log("input", digit, nextDigits);
        setNextDigits([...nextDigits, digit]);
        return;
    }
  }
  return (
    <div style={style.root}>
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "1em" }}>
          <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>{" "}
          <u>
            <WordList
              words={nextStrings}
              selected={nextIndex}
              style={style.wordList}
            />
            {nextString}
          </u>
          <span style={style.cursor} />
        </div>
        {text === "" && nextString === "" ? (
          <div style={{ color: "gray", padding: "1em" }}>
            Enter some text using the T9 keyboard below...
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexFlow: "column" }}>
        {digitGrid.map((row, r) => (
          <div key={r} style={style.buttonRow}>
            {row.map((d) => (
              <Button key={d} digit={d} onClick={() => pushNext(d)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The list of words you're choosing from, with a single word selected
 */
function WordList(props: {
  words: string[];
  selected: number;
  style: React.CSSProperties;
}): JSX.Element {
  return (
    <ol style={props.style}>
      {props.words.map((w, i) => (
        <li key={w}>
          <span
            style={
              i === props.selected ? style.entrySelected : style.entryUnselected
            }
          >
            {w}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * One of the input buttons at the bottom of the screen
 */
function Button(props: { digit: Digit; onClick: () => void }): JSX.Element {
  return (
    <button style={style.button} onClick={props.onClick}>
      <h3>{digitToLabel(props.digit)}</h3>
      <div>{props.digit}</div>
    </button>
  );
}

/**
 * for TS apps, I like using a table of styles instead of css classes.
 * better autocomplete; programmable styles when needed
 */
const style: { [s: string]: React.CSSProperties } = {
  root: {
    border: "1px solid gray",
    height: "100vh",
    display: "flex",
    flexFlow: "column",
    boxSizing: "border-box",
  },
  wordList: {
    display: "inline-block",
    position: "absolute",
    padding: 0,
    paddingTop: "1em",
  },
  button: { flex: 1, padding: "2em" },
  buttonRow: { display: "flex", flex: 1 },
  entrySelected: { backgroundColor: "yellow" },
  entryUnselected: {},
  cursor: {
    // https://www.amitmerchant.com/simple-blinking-cursor-animation-using-css/
    backgroundColor: "black",
    width: "0.5em",
    height: "1em",
    display: "inline-block",
    animation: "cursor-blink 1.5s steps(2) infinite",
  },
};

/**
 * Fetch and index all dictionary words.
 *
 * `import './words.txt'` only gives us a url, not the whole file, so the app
 * loads faster. We have to manually load that url, but it lets us show a
 * "loading" screen (or maybe a partially working keyboard?!) instead of a
 * blank screen while the app loads.
 */
async function fetchDictionary() {
  const response = await fetch(rawWordsUrl);
  const text = await response.text();
  return T9.indexFromWords(text.split("\n"));
}

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"] as const;
type Digit = (typeof digits)[number];
// only those 12 digits are allowed. `const x: Digit = 10` will not typecheck

/**
 * The way digits are arranged in the UI
 */
const digitGrid: Digit[][] = digits.reduce((accum, digit, i) => {
  const rownum = Math.floor(i / 3);
  if (!accum[rownum]) accum.push([]);
  accum[rownum].push(digit);
  return accum;
}, [] as Digit[][]);

/**
 * The text shown in the UI below each digit
 */
function digitToLabel(digit: Digit): string {
  switch (digit) {
    case "#":
      return "next";
    case "*":
      return "del";
    case 0:
      return "space";
    case 1:
      return "copy";
    default:
      return T9.letters[digit].toUpperCase().split("").join(" ");
  }
}

function main() {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("no root");
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}
main();
