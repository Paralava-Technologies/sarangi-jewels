/* ============================================================
   SARANGI ADMIN — REUSABLE COMPONENTS (single source of truth)
   ------------------------------------------------------------
   These are true custom elements: defined once here, dropped
   into every admin page as a plain HTML tag. Change the markup
   or logic in ONE place and every page that uses the tag picks
   it up automatically — nothing is copy-pasted across pages.

   Rendered in light DOM (no shadow root) on purpose, so the
   single shared admin-styles.css keeps styling every instance —
   no per-component style duplication, no shadow-DOM CSS forking.

   Components shipped here:
     <sj-sidebar active="dashboard">        organism
     <sj-topbar title="..." subtitle="...">  organism
     <sj-footer></sj-footer>                 organism
     <sj-stat-card icon label value trend trend-dir> molecule
     <sj-badge status>Label</sj-badge>       atom (dynamic)
     <sj-panel heading subtext>...content...</sj-panel> molecule
   ============================================================ */

const NAV_ITEMS = [
  { key: "dashboard",  label: "Dashboard",           href: "dashboard.html",       icon: "&#128202;" },
  { key: "catalog",    label: "Catalog Manager",     href: "products.html",        icon: "&#128142;" },
  { key: "calendar",   label: "Rental Calendar",     href: "rental-calendar.html", icon: "&#128197;" },
  { key: "orders",     label: "Orders & Bookings",   href: "orders.html",          icon: "&#128230;" },
  { key: "customers",  label: "Customers",           href: "customers.html",       icon: "&#128101;" },
  { key: "staff",      label: "Makeup & Staff",      href: "staff.html",           icon: "&#128132;" },
  { key: "payments",   label: "Payments & Deposits", href: "payments.html",        icon: "&#128179;" },
  { key: "coupons",    label: "Coupons & Campaigns", href: "coupons.html",         icon: "&#127991;" },
  { key: "reports",    label: "Reports",             href: "reports.html",         icon: "&#128200;" },
  { key: "settings",   label: "Roles & Settings",    href: "settings.html",        icon: "&#9881;" },
];

class SJSidebar extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute("active") || "";
    const items = NAV_ITEMS.map(item => `
      <a href="${item.href}" class="admin-nav-link ${item.key === active ? 'is-active' : ''}">
        <span class="nav-icon">${item.icon}</span>${item.label}
      </a>`).join("");

    this.innerHTML = `
      <aside class="admin-sidebar">
        <a href="dashboard.html" class="admin-sidebar-brand">
          <img src="assets/sarangi-logo-mark.png" alt="Sarangi Jewels">
          <span>Sarangi<small>Admin Console</small></span>
        </a>
        <nav class="admin-sidebar-nav">${items}</nav>
        <div class="admin-sidebar-foot">
          <div class="avatar">AN</div>
          <div class="who"><strong>Anu Menon</strong><span>Store Manager</span></div>
        </div>
      </aside>
      <div class="admin-sidebar-backdrop" onclick="document.querySelector('.admin-sidebar').classList.remove('is-open'); document.querySelector('.admin-sidebar-backdrop').classList.remove('is-open');"></div>`;
  }
}

class SJTopbar extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") || "";
    const subtitle = this.getAttribute("subtitle") || "";
    // capture any light-dom children passed in as the "actions" slot
    const actionsHTML = this.innerHTML.trim();

    this.innerHTML = `
      <header class="admin-topbar">
        <button class="admin-topbar-burger" aria-label="Toggle menu" onclick="document.querySelector('.admin-sidebar').classList.toggle('is-open'); document.querySelector('.admin-sidebar-backdrop').classList.toggle('is-open');">&#9776;</button>
        <div class="admin-topbar-title">
          <h1>${title}</h1>
          ${subtitle ? `<span class="sub">${subtitle}</span>` : ""}
        </div>
        <div class="admin-topbar-actions">${actionsHTML}</div>
      </header>`;
  }
}

class SJFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="admin-footer">
        <span>© 2026 Sarangi Jewels — Admin Console</span>
        <span>v1.0.0 &nbsp;·&nbsp; <a href="../index.html">View Storefront ↗</a></span>
      </footer>`;
  }
}

class SJStatCard extends HTMLElement {
  connectedCallback() {
    const icon = this.getAttribute("icon") || "&#8226;";
    const label = this.getAttribute("label") || "";
    const value = this.getAttribute("value") || "";
    const trend = this.getAttribute("trend");
    const dir = this.getAttribute("trend-dir") || "up";
    this.innerHTML = `
      <div class="stat-card">
        <div class="icon-chip">${icon}</div>
        <div class="body">
          <div class="value">${value}</div>
          <div class="label">${label}</div>
          ${trend ? `<div class="trend ${dir}">${dir === 'up' ? '&#8599;' : '&#8600;'} ${trend}</div>` : ""}
        </div>
      </div>`;
  }
}

const STATUS_LABELS = {
  pending: "Pending", confirmed: "Confirmed", active: "Active",
  out: "Out With Customer", returned: "Returned", closed: "Closed",
  cancelled: "Cancelled", low: "Low Stock", neutral: "—",
};

class SJBadge extends HTMLElement {
  connectedCallback() {
    const status = this.getAttribute("status") || "neutral";
    const label = this.textContent.trim() || STATUS_LABELS[status] || status;
    this.innerHTML = `<span class="badge badge-${status}">${label}</span>`;
  }
}

class SJPanel extends HTMLElement {
  connectedCallback() {
    const heading = this.getAttribute("heading");
    const subtext = this.getAttribute("subtext");
    const flush = this.hasAttribute("flush");
    const inner = this.innerHTML; // preserve original light-dom content
    this.innerHTML = `
      <div class="panel">
        ${heading ? `
        <div class="panel-head">
          <div><h3>${heading}</h3>${subtext ? `<div class="sub">${subtext}</div>` : ""}</div>
        </div>` : ""}
        <div class="${flush ? 'panel-body-flush' : 'panel-body'}">${inner}</div>
      </div>`;
  }
}

customElements.define("sj-sidebar", SJSidebar);
customElements.define("sj-topbar", SJTopbar);
customElements.define("sj-footer", SJFooter);
customElements.define("sj-stat-card", SJStatCard);
customElements.define("sj-badge", SJBadge);
customElements.define("sj-panel", SJPanel);
