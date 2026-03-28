(() => {
  const storageKey = "dpr-theme";
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  const marketGrid = document.querySelector("[data-market-grid]");
  const marketQuotes = [...document.querySelectorAll("[data-market-symbol]")];
  const marketStatus = document.querySelector(".market-strip__status");
  const pageShell = document.querySelector("[data-page-shell]");
  const label = toggle ? toggle.querySelector(".theme-toggle__label") : null;
  let renderedMarketTheme = "";
  let navigationController = null;

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

  const isNavigableLink = (link) => {
    if (!link) {
      return false;
    }

    if (link.target && link.target !== "_self") {
      return false;
    }

    if (link.hasAttribute("download")) {
      return false;
    }

    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return false;
    }

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) {
      return false;
    }

    if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) {
      return false;
    }

    const lastSegment = url.pathname.split("/").pop() || "";
    if (lastSegment.includes(".") && !lastSegment.endsWith(".html")) {
      return false;
    }

    return true;
  };

  const applyFetchedPage = (doc, href, options = {}) => {
    if (!pageShell) {
      window.location.href = href;
      return;
    }

    const nextShell = doc.querySelector("[data-page-shell]");
    if (!nextShell) {
      window.location.href = href;
      return;
    }

    const currentTabs = pageShell.querySelector("[data-page-tabs]");
    const nextTabs = nextShell.querySelector("[data-page-tabs]");
    const currentContent = pageShell.querySelector("[data-page-content]");
    const nextContent = nextShell.querySelector("[data-page-content]");

    if (!currentTabs || !nextTabs || !currentContent || !nextContent) {
      window.location.href = href;
      return;
    }

    currentTabs.replaceWith(nextTabs);
    currentContent.replaceWith(nextContent);

    document.title = doc.title;

    if (!options.popstate) {
      window.history.pushState({ href }, "", href);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const navigateTo = async (href, options = {}) => {
    if (navigationController) {
      navigationController.abort();
    }

    navigationController = new AbortController();

    try {
      const response = await fetch(href, {
        signal: navigationController.signal,
        headers: {
          "X-Requested-With": "fetch",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      const doc = new DOMParser().parseFromString(text, "text/html");
      applyFetchedPage(doc, href, options);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
      window.location.href = href;
    } finally {
      navigationController = null;
    }
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

  if (pageShell) {
    window.history.replaceState({ href: window.location.href }, "", window.location.href);

    document.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = event.target.closest("a[href]");
      if (!isNavigableLink(link)) {
        return;
      }

      event.preventDefault();
      navigateTo(link.href);
    });

    window.addEventListener("popstate", () => {
      navigateTo(window.location.href, { popstate: true });
    });
  }
})();
