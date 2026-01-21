export function renderProfile(profiles, onSelect) {
  const hero = document.querySelector(".hero");
  hero.innerHTML = "";

  const meSection = document.createElement("section");
  meSection.className = "profile";
  meSection.style.cursor = "pointer";

  const meLabel = document.createElement("h4");
  meLabel.className = "name";
  meLabel.textContent = "Me";

  meSection.appendChild(meLabel);

  meSection.addEventListener("click", () => {
    hero.querySelectorAll(".profile").forEach(p => p.classList.remove("selected"));
    meSection.classList.add("selected");
    onSelect(null);
  });

  hero.appendChild(meSection);

  if (!profiles || profiles.length === 0) return;

  profiles.forEach(profile => {
    const section = document.createElement("section");
    section.className = "profile";
    section.style.cursor = "pointer";

    const img = document.createElement("img");
    img.className = "avatar";
    img.src = profile.profile_picture_url;
    img.alt = profile.full_name;

    const name = document.createElement("h4");
    name.className = "name";
    name.textContent = profile.full_name;

    section.appendChild(img);
    section.appendChild(name);

    section.addEventListener("click", () => {
      hero.querySelectorAll(".profile").forEach(p => p.classList.remove("selected"));
      section.classList.add("selected");
      onSelect(profile);
    });

    hero.appendChild(section);
  });
}
