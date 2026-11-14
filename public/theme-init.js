// Apply the saved theme before the app and styles load. Keep the key and
// default in sync with ThemeContext; unavailable/invalid storage defaults dark.
(() => {
  let theme = "dark";
  try {
    if (localStorage.getItem("moneyminds-theme") === "light") theme = "light";
  } catch {
    // Storage can be disabled by browser privacy settings.
  }
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
})();
