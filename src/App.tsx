import { useState } from "react";
import { summariseText, getMainContent } from "./summarify.tsx";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import CircularProgress from "@mui/material/CircularProgress";

function App() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
          setCopied(true);
          console.log("Copied!");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((error) => {
          console.error("Copy failed:", error);
        });
    }
  };

  return (
    <div className="font-dm-sans w-96 h-76 p-4 bg-[#202733] shadow-lg rounded-xl text-white">
      <h1 className="flex justify-center mb-4">
        <SummarizeRoundedIcon className="rounded-3xl mt-2 mr-2" />
        <div className="text-3xl font-semibold text-center mb-3">summarify</div>
      </h1>
      <div className="flex justify-center pt-3 mb-3 text-lg">
        <button
          onClick={handleSummarize}
          disabled={loading}
          className={`w-full py-2 rounded-md text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#175cdc] hover:bg-[#175cdc]"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <CircularProgress size={20} className="text-white" />
              Summarising...
            </div>
          ) : (
            "Summarise Page"
          )}
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-500 text-center mb-3">{error}</div>
      )}
      {summary && (
        <div
          id="summary"
          className="text-sm p-2 bg-[#121a28] rounded-md shadow-inner mb-3 h-32 overflow-y-auto"
        >
          {summary}
        </div>
      )}
      <div className="flex justify-center pt-3">
        <button
          id="copyBtn"
          title="Copy to clipboard"
          onClick={handleCopy}
          disabled={!summary}
          className={`flex items-center gap-2 p-2 rounded-md font-medium ${
            summary
              ? "bg-[#ce93d9] text-white hover:bg-[#ce93d9]"
              : "bg-[#121a28] text-gray-500 cursor-not-allowed"
          }`}
        >
          {copied ? (
            <CheckCircleRoundedIcon className="w-5 h-5" />
          ) : (
            <ContentCopyRoundedIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default App;
