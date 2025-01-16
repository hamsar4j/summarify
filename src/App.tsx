import { useState } from "react";
import summarifyLogo from "/summary_icon_48.png";
import { summariseText, getMainContent } from "./summarify.tsx";
import "./App.css";

function App() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setLoading(true);
    setSummary(null);
    setError(null);

    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tabs.length === 0) {
        throw new Error("No active tab found");
      }

      const activeTab = tabs[0];

      // Ensure activeTab.id is valid and a number
      if (typeof activeTab.id !== "number") {
        throw new Error("Invalid tab id");
      }

      // Use browser.scripting.executeScript to execute the function and return the result
      const content = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: getMainContent, // Execute the function in the context of the page
      });

      if (
        !content[0] ||
        !content[0].result ||
        content[0].result.trim().length === 0
      ) {
        throw new Error("No content found on this page");
      }

      const summaryText = await summariseText(content[0].result);
      setSummary(summaryText);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard
        .writeText(summary)
        .then(() => {
          alert("Copied!");
        })
        .catch((error) => {
          console.error("Copy failed:", error);
        });
    }
  };

  return (
    <>
      <div>
        <a>
          <img src={summarifyLogo} className="logo" alt="Summarify logo" />
        </a>
      </div>
      <h1>Summarify</h1>
      <div className="card">
        <button onClick={handleSummarize} disabled={loading}>
          {loading ? "Summarising..." : "Summarise Page"}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {summary && <div id="summary">{summary}</div>}
      <button
        id="copyBtn"
        title="Copy to clipboard"
        onClick={handleCopy}
        disabled={!summary}
      >
        <img src="clipboard_icon.svg" alt="Copy Icon" width="16" height="16" />
      </button>
    </>
  );
}

export default App;
