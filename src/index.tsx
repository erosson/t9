import React from "react";
import * as ReactDOM from "react-dom/client";
import "./main.css";
import * as T9 from "./t9";
// @ts-ignore typescript doesn't understand this, but webpack does
import rawWords from "raw-loader!/usr/share/dict/words";

const style = {
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

function App(props: { index: T9.Index }): JSX.Element {
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
    <div
      style={{
        border: "1px solid gray",
        height: "100vh",
        display: "flex",
        flexFlow: "column",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "1em" }}>
          <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>{" "}
          <u>
            <ol
              style={{
                display: "inline-block",
                position: "absolute",
                padding: 0,
                paddingTop: "1em",
              }}
            >
              {nextStrings.map((w, i) => (
                <li key={w}>
                  <span
                    style={
                      i === nextIndex
                        ? style.entrySelected
                        : style.entryUnselected
                    }
                  >
                    {w}
                  </span>
                </li>
              ))}
            </ol>
            {nextString}
          </u>
          <span style={style.cursor} />
        </div>
        {/* <div>{JSON.stringify(props.index[nextWord] ?? null)}</div> */}
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

const digitGrid: Digit[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  ["*", 0, "#"],
];

type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 | "#" | "*";

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

function Button(props: { digit: Digit; onClick: () => void }): JSX.Element {
  return (
    <button style={style.button} onClick={props.onClick}>
      <h3>{digitToLabel(props.digit)}</h3>
      <div>{props.digit}</div>
    </button>
  );
}

function main() {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("no root");
  const root = ReactDOM.createRoot(rootEl);
  const index = T9.indexFromWords(rawWords.split("\n"));
  root.render(<App index={index} />);
}
main();
