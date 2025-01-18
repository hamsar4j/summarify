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
    <div className="h-76 w-96 rounded-xl bg-[#202733] p-4 font-dm-sans text-white shadow-lg">
      <h1 className="mb-4 flex justify-center">
        <SummarizeRoundedIcon className="mr-2 mt-2 rounded-3xl" />
        <div className="mb-3 text-center text-3xl font-semibold">summarify</div>
      </h1>
      <div className="mb-3 flex justify-center pt-3 text-lg">
        <button
          onClick={handleSummarize}
          disabled={loading}
          className={`w-full rounded-md py-2 text-white ${
            loading
              ? "cursor-not-allowed bg-gray-400"
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
        <div className="mb-3 text-center text-sm text-red-500">{error}</div>
      )}
      {summary && (
        <div
          id="summary"
          className="mb-3 h-32 overflow-y-auto rounded-md bg-[#121a28] p-2 text-sm shadow-inner"
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
          className={`flex items-center gap-2 rounded-md p-2 font-medium ${
            summary
              ? "bg-[#ce93d9] text-white hover:bg-[#ce93d9]"
              : "cursor-not-allowed bg-[#121a28] text-gray-500"
          }`}
        >
          {copied ? (
            <CheckCircleRoundedIcon className="h-5 w-5" />
          ) : (
            <ContentCopyRoundedIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default App;
