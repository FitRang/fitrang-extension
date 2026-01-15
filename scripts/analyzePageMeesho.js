export async function analyzePageMeesho() {
  console.log("This is Meesho");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const titleEl = document.querySelector('h1.sc-eDvSVe.fhfLdV');
      const title = titleEl?.innerText.trim() || null;

      const detailContainer = document.querySelector('.ProductDescription__DetailsCardStyled-sc-1l1jg0i-0');
      const sections = {};

      if (detailContainer) {
        const paragraphs = detailContainer.querySelectorAll('p.sc-eDvSVe.guezwa');

        paragraphs.forEach(p => {
          const text = p.innerText.trim();
          const [labelPart, ...valueParts] = text.split(':');
          const label = labelPart.replace(/\u00A0/g, ' ').trim();
          const value = valueParts.join(':').trim();

          if (label) {
            sections[label] = value;
          }
        });
      }

      return {
        title,
        sections
      };
    }
  });

  const { title, sections } = results[0].result;

  if (!title && Object.keys(sections).length === 0) {
    console.warn("Nothing found on Meesho page.");
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
