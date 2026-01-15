export async function analyzePageAmazon() {
  console.log("This is amazon");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const title = document.getElementById("titleSection")?.innerText?.trim() || null;

      const headings = document.querySelectorAll('h3.product-facts-title');
      const sections = {};

      headings.forEach((header) => {
        const headingText = header.innerText.trim();
        let content = "";
        let sibling = header.nextElementSibling;

        while (sibling) {
          if (sibling.tagName.startsWith("H")) {
            break;
          }
          content += sibling.innerText.trim() + "\n";
          sibling = sibling.nextElementSibling;
        }

        sections[headingText] = content.trim();
      });

      return { title, sections };
    }
  });

  const { title, sections } = results[0].result;
  const statusDiv = document.getElementById('status');

  if (!title && Object.keys(sections).length === 0) {
    statusDiv.textContent = "Could not retrieve product details.";
    return;
  }
  return { title, sections }
}
