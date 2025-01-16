import { useState } from "react";
import summarifyLogo from "/summary_icon_48.png";
import { summariseText, getMainContent } from "./summarify.tsx";

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
    <div className="w-80 p-4 bg-white shadow-lg rounded-lg text-gray-800">
      <div className="flex justify-center mb-4">
        <img src={summarifyLogo} className="w-16 h-16" alt="Summarify logo" />
      </div>
      <h1 className="text-xl font-semibold text-center mb-3">Summarify</h1>
      <div className="flex justify-center mb-3">
        <button
          onClick={handleSummarize}
          disabled={loading}
          className={`w-full py-2 rounded-md text-white font-medium ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Summarising..." : "Summarise Page"}
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-500 text-center mb-3">{error}</div>
      )}
      {summary && (
        <div
          id="summary"
          className="text-sm p-2 bg-gray-100 rounded-md shadow-inner mb-3 h-32 overflow-y-auto"
        >
          {summary}
        </div>
      )}
      <div className="flex justify-center">
        <button
          id="copyBtn"
          title="Copy to clipboard"
          onClick={handleCopy}
          disabled={!summary}
          className={`flex items-center gap-2 p-2 rounded-md font-medium ${
            summary
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <img src="clipboard_icon.svg" alt="Copy Icon" className="w-5 h-5" />
          Copy
        </button>
      </div>
    </div>
  );
}

export default App;
