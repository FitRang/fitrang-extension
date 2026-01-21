import { analyzePageAmazon } from "./scripts/analyzePageAmazon.js";
import { analyzePageMeesho } from "./scripts/analyzePageMeesho.js";
import { analyzePageMyntra } from "./scripts/analyzePageMyntra.js";
import { analyzePageFlipkart } from "./scripts/analyzePageFlipkart.js";
import { getProfiles } from "./services/getProfiles.js";
import { sendData } from "./services/sendData.js";
import { renderProfile } from "./scripts/renderProfile.js";
import { renderLoginComponent } from "./scripts/renderLoginComponent.js";

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  const token = localStorage.getItem("access_token");

  const loadingEl = document.getElementById("loading");
  const resultSection = document.querySelector(".result");

  console.log(token);

  if (!token) {
    await renderLoginComponent();
    return;
  }

  const hostname = url.hostname;
  let scrapeFn;

  switch (hostname) {
    case "www.amazon.com":
      scrapeFn = analyzePageAmazon;
      break;
    case "www.flipkart.com":
      scrapeFn = analyzePageFlipkart;
      break;
    case "www.meesho.com":
      scrapeFn = analyzePageMeesho;
      break;
    case "www.myntra.com":
      scrapeFn = analyzePageMyntra;
      break;
    default:
      console.warn("Unsupported site:", hostname);
      document.getElementById("status").textContent = "This site is not supported.";
      return;
  }

  loadingEl.classList.remove("hidden");
  resultSection.classList.add("hidden");

  const profiles = await getProfiles();

  loadingEl.classList.add("hidden");

  renderProfile(profiles, async (selectedProfile) => {
    loadingEl.classList.remove("hidden");
    resultSection.classList.add("hidden");

    const scraped = await scrapeFn();

    const payload = {
      profile: selectedProfile,
      product: {
        title: scraped?.title,
        details: scraped?.sections,
      },
    };

    sendData(payload)
      .then(data => {
        document.getElementById("verdict").textContent = data?.verdict.analysis || "No verdict received.";

        const scoreEl = document.getElementById("score");
        const scoreValue = parseInt(data?.verdict.score) || 0;
        scoreEl.textContent = `${scoreValue}/10`;

        scoreEl.classList.remove("score-red", "score-yellow", "score-green");

        if (scoreValue <= 4) {
          scoreEl.classList.add("score-red");
        } else if (scoreValue <= 8) {
          scoreEl.classList.add("score-yellow");
        } else {
          scoreEl.classList.add("score-green");
        }

        document.getElementById("detail").textContent = data?.verdict.details || "No verdict received.";
      })
      .catch(err => {
        document.getElementById("verdict").textContent = "An error occurred.";
        document.getElementById("score").textContent = "—";
        document.getElementById("detail").textContent = "Please try again.";
      })
      .finally(() => {
        loadingEl.classList.add("hidden");
        resultSection.classList.remove("hidden");
      });
  });
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("access_token_expiry");
  localStorage.removeItem("refresh_token_expiry");
  localStorage.removeItem("token_type");
  location.reload();
});

