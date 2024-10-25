import { summariseText, getMainContent } from "../content_scripts/summarify.js";
const clipboardIcon = "../icons/clipboard_icon.svg";
const copiedIcon = "../icons/copied_icon.svg";
const copyBtn = document.getElementById("copyBtn");

document.getElementById("summarise").addEventListener("click", async () => {
  const summaryDiv = document.getElementById("summary");
  const button = document.getElementById("summarise");

  button.disabled = true;
  summaryDiv.textContent = "Extracting Text and Summarising...";
  summaryDiv.className = "loading";

  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];

    const content = await browser.tabs.executeScript(activeTab.id, {
      code: `(${getMainContent.toString()})();`,
    });

    if (!content[0] || content[0].trim().length === 0) {
      throw new Error("No content found on this page");
    }

    const summary = await summariseText(content[0]);
    summaryDiv.textContent = summary;
    summaryDiv.className = "";
  } catch (error) {
    summaryDiv.textContent = `Error: ${error.message}`;
    summaryDiv.className = "error";
  } finally {
    button.disabled = false;
  }
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const summaryDiv = document.getElementById("summary");

  if (summaryDiv.textContent) {
    navigator.clipboard
      .writeText(summaryDiv.textContent)
      .then(() => {
        // alert("Copied!");
        const img = copyBtn.querySelector("img");
        img.src = copiedIcon;
        setTimeout(() => {
          img.src = clipboardIcon;
        }, 2000);
      })
      .catch((error) => {
        console.error("Copy failed:", error);
      });
  }
});
