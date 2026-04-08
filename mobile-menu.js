/**
 * GiftCardsHub — Mobile Menu (full-screen overlay)
 * Matches the reference site design: hamburger opens a slide-down overlay
 * with nav links and an orange "Get Started" CTA.
 */
(function () {
  "use strict";

  // Build the overlay HTML
  const overlay = document.createElement("div");
  overlay.id = "mobile-menu-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="mobile-menu-backdrop"></div>
    <div class="mobile-menu-panel">
      <div class="mobile-menu-header">
        <div class="mobile-menu-brand">
          <div class="mobile-menu-logo">
            <span class="material-symbols-outlined" style="color:#fff;font-size:20px;font-variation-settings:'FILL' 1">redeem</span>
          </div>
          <span class="mobile-menu-title">GiftCardsHub</span>
        </div>
        <button class="mobile-menu-close" aria-label="Close menu">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <nav class="mobile-menu-nav">
        <a href="home.html" class="mobile-menu-link">Home</a>
        <a href="checkbalance.html" class="mobile-menu-link">Verify</a>
        <a href="buy.html" class="mobile-menu-link">Buy</a>
        <a href="sell.html" class="mobile-menu-link">Sell</a>
        <a href="home.html#reviews" class="mobile-menu-link">Reviews</a>
      </nav>
      <div class="mobile-menu-footer">
        <a href="signin.html" class="mobile-menu-cta">Get Started</a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Highlight current page link
  const currentPage = location.pathname.split("/").pop() || "home.html";
  overlay.querySelectorAll(".mobile-menu-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "home.html")) {
      link.classList.add("active");
    }
  });

  // Manage open/close
  function openMenu() {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Bind hamburger buttons (works with both <span> and <button> hamburger icons)
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-icon='menu'], .hamburger-trigger");
    if (
      trigger ||
      (e.target.classList.contains("material-symbols-outlined") &&
        e.target.textContent.trim() === "menu")
    ) {
      e.preventDefault();
      openMenu();
    }
  });

  // Close button
  overlay
    .querySelector(".mobile-menu-close")
    .addEventListener("click", closeMenu);
  // Backdrop click
  overlay
    .querySelector(".mobile-menu-backdrop")
    .addEventListener("click", closeMenu);
  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
})();
