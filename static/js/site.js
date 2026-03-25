(() => {
  const storageKey = "dpr-theme";
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");

  if (!toggle) {
    return;
  }

  const label = toggle.querySelector(".theme-toggle__label");

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    if (label) {
      label.textContent = theme === "dark" ? "切到淺色" : "切到深色";
    }
  };

  applyTheme(root.dataset.theme || "dark");

  toggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(storageKey, nextTheme);
    } catch (error) {
      // Ignore storage failures and keep the in-memory theme state.
    }
    applyTheme(nextTheme);
  });
})();
