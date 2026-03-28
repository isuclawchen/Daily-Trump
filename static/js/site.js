(() => {
  const storageKey = "dpr-theme";
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  const marketGrid = document.querySelector("[data-market-grid]");
  const marketQuotes = [...document.querySelectorAll("[data-market-symbol]")];
  const marketStatus = document.querySelector(".market-strip__status");
  const label = toggle ? toggle.querySelector(".theme-toggle__label") : null;
  let renderedMarketTheme = "";

  const emitThemeChange = (theme) => {
    document.dispatchEvent(
      new CustomEvent("dpr:themechange", {
        detail: { theme },
      }),
    );
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (toggle) {
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
    if (label) {
      label.textContent = theme === "dark" ? "切到淺色" : "切到深色";
    }
    emitThemeChange(theme);
  };

  const renderMarketQuotes = (theme) => {
    if (!marketGrid || marketQuotes.length === 0) {
      return;
    }

    if (renderedMarketTheme === theme) {
      return;
    }

    renderedMarketTheme = theme;
    if (marketStatus) {
      marketStatus.hidden = false;
    }

    let remaining = marketQuotes.length;
    const finishOne = () => {
      remaining -= 1;
      if (remaining <= 0 && marketStatus) {
        marketStatus.hidden = true;
      }
    };

    marketQuotes.forEach((quote) => {
      const symbol = quote.dataset.marketSymbol;
      quote.replaceChildren();

      if (!symbol) {
        finishOne();
        return;
      }

      const widget = document.createElement("div");
      widget.className = "tradingview-widget-container__widget";
      quote.appendChild(widget);

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js";
      script.async = true;
      script.text = JSON.stringify({
        symbol,
        width: "100%",
        isTransparent: true,
        colorTheme: theme === "light" ? "light" : "dark",
        locale: marketGrid.dataset.marketLocale || "zh_TW",
      });

      script.addEventListener("load", finishOne);
      script.addEventListener("error", () => {
        if (marketStatus) {
          marketStatus.textContent = "即時行情載入失敗，請稍後重整。";
        }
        finishOne();
      });

      quote.appendChild(script);
    });
  };

  const initialTheme = root.dataset.theme || "dark";
  applyTheme(initialTheme);

  if (toggle) {
    toggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch (error) {
        // Ignore storage failures and keep the in-memory theme state.
      }
      applyTheme(nextTheme);
    });
  }

  if (marketGrid) {
    renderMarketQuotes(initialTheme);
    document.addEventListener("dpr:themechange", (event) => {
      renderMarketQuotes(event.detail.theme);
    });
  }
})();
