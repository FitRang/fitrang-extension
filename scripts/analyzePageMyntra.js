export async function analyzePageMyntra() {
  console.log("This is Myntra");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const titleBrand = document.querySelector('h1.pdp-title')?.innerText.trim() || "";
      const titleName = document.querySelector('h1.pdp-name')?.innerText.trim() || "";
      const title = `${titleBrand} ${titleName}`.trim();

      const sections = {};

      const productDetails = [];
      const ulItems = document.querySelectorAll(
        '.pdp-productDescriptorsContainer ul li'
      );
      ulItems.forEach(li => {
        productDetails.push(li.innerText.trim());
      });
      if (productDetails.length > 0) {
        sections["Product Details"] = productDetails.join(", ");
      }

      const sizeFitEl = document.querySelector(
        '.pdp-sizeFitDescContent'
      );
      if (sizeFitEl) {
        const text = sizeFitEl.innerText.trim().replace(/\n/g, ", ");
        sections["Size & Fit"] = text;
      }

      const matCareEl = document.querySelector(
        '.pdp-sizeFitDescContent p'
      );
      if (matCareEl) {
        sections["Material & Care"] = matCareEl.innerText.trim();
      }

      const specRows = document.querySelectorAll(
        '.index-tableContainer .index-row'
      );
      specRows.forEach(row => {
        const key = row.querySelector('.index-rowKey')?.innerText.trim();
        const value = row.querySelector('.index-rowValue')?.innerText.trim();
        if (key && value) {
          sections[key] = value;
        }
      });

      return { title, sections };
    }
  });

  const { title, sections } = results[0].result;

  if (!title && Object.keys(sections).length === 0) {
    console.warn("Nothing scraped from Myntra.");
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
