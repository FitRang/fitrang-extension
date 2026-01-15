export async function analyzePageFlipkart() {
  console.log("This is Flipkart");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const titles = Array.from(document.querySelectorAll('.VU-ZEz'))
        .map(el => el.innerText.trim());

      const detailRows = document.querySelectorAll('.sBVJqn .row');
      const sections = {};

      detailRows.forEach(row => {
        const label = row.querySelector('.col-3-12')?.innerText.trim();
        const value = row.querySelector('.col-9-12')?.innerText.trim();
        if (label && value) {
          sections[label] = value;
        }
      });

      const description = document.querySelector('._4aGEkW')?.innerText.trim();
      if (description) {
        sections["Description"] = description;
      }

      return {
        title: titles.join(" | "),
        sections
      };
    }
  });

  const { title, sections } = results[0].result;

  if (!title && Object.keys(sections).length === 0) {
    console.warn("Nothing found on Flipkart page.");
    return {
      title: null,
      sections: {}
    };
  }

  return {
    title,
    sections
  };
}
