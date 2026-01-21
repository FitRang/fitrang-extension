import { logIn } from "../services/logIn.js";

export async function renderLoginComponent() {
  const res = await fetch(chrome.runtime.getURL("loginComponent.html"));
  const html = await res.text();

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  document.body.innerHTML = "";
  document.body.appendChild(wrapper);

  const form = document.getElementById("login-form");

  const loadingEl = document.getElementById("loading");
  const button = document.getElementById("login-button");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    const loginError = document.getElementById("login-error");

    try {
      button.classList.add("hidden");
      loadingEl.classList.remove("hidden");
      await logIn({ email, password });
      window.location.reload();
    } catch (err) {
      loginError.textContent = err.message;
      console.error("Login error:", err);
    } finally {
      loadingEl.classList.add("hidden");
      button.classList.remove("hidden");
    }
  });
}
