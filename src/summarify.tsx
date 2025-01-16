export function getMainContent(): string {
  const elementsToRemove = [
    "header",
    "footer",
    "nav",
    "aside",
    ".ad",
    ".advertisement",
    ".social-share",
    ".comments",
    ".navigation",
    ".menu",
    ".sidebar",
  ];

  const bodyClone = document.body.cloneNode(true) as HTMLElement;

  elementsToRemove.forEach((selector) => {
    const elements = bodyClone.querySelectorAll(selector);
    elements.forEach((el) => el.remove());
  });

  let mainContent = bodyClone.querySelector(
    'main, article, [role="main"], .content, #content, .post, .article'
  ) as HTMLElement;

  if (!mainContent || mainContent.textContent?.trim().length === 0) {
    mainContent = bodyClone;
  }

  let text = mainContent.innerText.replace(/\s+/g, " ").trim();

  const maxLength = 4000;
  if (text.length > maxLength) {
    text = text.slice(0, maxLength) + "...";
  }

  return text;
}

export async function summariseText(text: string): Promise<string> {
  const ip = "0.0.0.0"; // Replace with the actual API IP address.
  const port = 11434;
  try {
    const response = await fetch(`http://${ip}:${port}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:latest",
        prompt: `You are a helpful assistant that summarises text. Create a concise summary that captures the main points. Please summarise the following text: ${text}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response:", errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Summarization error:", error);
    throw error;
  }
}
