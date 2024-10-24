import { summariseText, getMainContent } from "../content_scripts/summarify.js";

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
