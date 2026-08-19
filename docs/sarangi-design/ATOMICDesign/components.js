/* ============================================================
   SARANGI STOREFRONT — REUSABLE COMPONENTS
   ------------------------------------------------------------
   Atomic design implementation in light DOM.
============================================================ */

const NAV_ITEMS = [
  { key: "shop", label: "Shop", href: "shop.html" },
  { key: "bridal-jewellery", label: "Bridal Jewellery", href: "bridal-jewellery.html" },
  { key: "rentals", label: "Rentals", href: "rentals.html" },
  { key: "dance-costumes", label: "Dance Costumes", href: "dance-costumes.html" },
  { key: "makeup", label: "Makeup", href: "makeup.html" },
  { key: "about", label: "Our Story", href: "about.html" }
];

class SJUtilityBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div class="utility-bar">FREE STYLING CONSULTATION ON ORDERS ABOVE ₹15,000 &nbsp;•&nbsp; RENT A BRIDAL SET FROM ₹1,499/DAY &nbsp;•&nbsp; KOCHI STORE OPEN 10AM–8PM</div>`;
  }
}

class SJHeader extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute("active") || "";
    
    const items = NAV_ITEMS.map(item => `
      <li><a href="${item.href}" ${item.key === active ? 'class="active"' : ''}>${item.label}</a></li>
    `).join("");

    this.innerHTML = `
      <nav class="nav">
        <div class="nav-inner">
          <a href="index.html" class="nav-brand"><img src="assets/sarangi-logo-mark.png" alt="Sarangi Jewels"><span class="wordmark">Sarangi<small>Jewels For Sale &amp; Rent</small></span></a>
          <ul class="nav-links">${items}</ul>
          <div class="nav-actions">
            <button title="Search">&#128269;</button>
            <a href="my-account.html" title="Account"><button>&#128100;</button></a>
            <a href="#" title="Wishlist"><button>&#9825;</button></a>
            <a href="cart.html" title="Bag"><button>&#128092;<span class="pill">2</span></button></a>
            <button class="nav-burger" title="Menu" aria-label="Open menu" aria-expanded="false" onclick="toggleMobileNav()"><span></span><span></span><span></span></button>
          </div>
        </div>
        <div class="mobile-nav" id="mobileNav">
          <ul class="nav-links">${items}</ul>
          <div class="mobile-nav-actions">
            <a href="my-account.html">&#128100; My Account</a>
            <a href="cart.html">&#128092; My Bag</a>
            <a href="track-order.html">&#128269; Track Order</a>
            <a href="support.html">&#128172; Support</a>
          </div>
        </div>
      </nav>`;
      
    // Set up global toggler if not present
    if (!window.toggleMobileNav) {
      window.toggleMobileNav = function(){
        var m = document.getElementById('mobileNav');
        var b = document.querySelector('.nav-burger');
        if(!m || !b) return;
        var isOpen = m.classList.toggle('is-open');
        b.classList.toggle('is-open', isOpen);
        b.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };
    }
  }
}

class SJFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>
        <div class="container">
          <div class="foot-grid">
            <div class="foot-brand">
              <img src="assets/sarangi-logo-mark.png" alt="Sarangi Jewels">
              <p>Fine and imitation jewellery for sale, plus rentals of bridal sets, dance costumes and makeup — from our Kochi store to your doorstep.</p>
              <div class="social-row"><a href="#">ig</a><a href="#">fb</a><a href="#">wa</a></div>
            </div>
            <div><h5>Shop</h5><ul>
              <li><a href="bridal-jewellery.html">Bridal Sets</a></li>
              <li><a href="shop.html">Earrings</a></li>
              <li><a href="shop.html">Bangles</a></li>
              <li><a href="shop.html">New Arrivals</a></li>
            </ul></div>
            <div><h5>Rentals</h5><ul>
              <li><a href="rentals.html#bridal">Bridal Jewellery</a></li>
              <li><a href="dance-costumes.html">Dance Costumes</a></li>
              <li><a href="makeup.html">Makeup &amp; Artists</a></li>
              <li><a href="rentals.html#howitworks">How It Works</a></li>
            </ul></div>
            <div><h5>Help</h5><ul>
              <li><a href="my-account.html">My Account</a></li>
              <li><a href="track-order.html">Track Order</a></li>
              <li><a href="support.html">Support Tickets</a></li>
              <li><a href="contact.html">Visit The Store</a></li>
            </ul></div>
            <div><h5>Visit Us</h5><ul>
              <li>Sarangi Jewels, MG Road</li>
              <li>Kochi, Kerala 682035</li>
              <li>+91 98XXX XXXXX</li>
              <li>hello@sarangijewels.com</li>
            </ul></div>
          </div>
          <div class="foot-bottom">
            <span>© 2026 Sarangi Jewels. All rights reserved.</span>
            <span><a href="privacy-policy.html">Privacy Policy</a> · <a href="terms.html">Terms</a> · <a href="my-account.html">My Account</a></span>
          </div>
        </div>
      </footer>`;
  }
}

class SJNewsletter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="news">
        <p class="eyebrow" style="color:var(--gold-light)">Stay In The Circle</p>
        <h2>Get first access to new arrivals &amp; rental drops</h2>
        <p>One email a week. No spam, only sparkle.</p>
        <form class="news-form" onsubmit="return false;">
          <input type="email" placeholder="Your email address">
          <button type="submit">Subscribe</button>
        </form>
      </section>`;
  }
}

class SJTrustStrip extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="trust-strip">
        <div class="trust-track">
          <span>Handcrafted Detailing</span><span>•</span><span>Nickel-Free &amp; Skin Safe</span><span>•</span><span>Free Store Trial In Kochi</span><span>•</span><span>Secure Rental Deposit</span><span>•</span><span>7-Day Easy Exchange</span><span>•</span>
          <span>Handcrafted Detailing</span><span>•</span><span>Nickel-Free &amp; Skin Safe</span><span>•</span><span>Free Store Trial In Kochi</span><span>•</span><span>Secure Rental Deposit</span><span>•</span><span>7-Day Easy Exchange</span><span>•</span>
        </div>
      </div>`;
  }
}

class SJProductCard extends HTMLElement {
  connectedCallback() {
    const href = this.getAttribute("href") || "product.html";
    const title = this.getAttribute("title") || "";
    const category = this.getAttribute("category") || "";
    const price = this.getAttribute("price") || "";
    const strike = this.getAttribute("strike") || "";
    const badge = this.getAttribute("badge") || "";
    const rentNote = this.getAttribute("rent-note") || "";
    const isRent = this.hasAttribute("is-rent");
    const glyph = this.getAttribute("glyph") || "&#128142;";
    
    this.innerHTML = `
      <div class="product-card">
        <a href="${href}">
          <div class="product-media">
            ${badge ? `<span class="badge ${isRent ? 'rent' : ''}">${badge}</span>` : ''}
            <span class="wish">&#9825;</span>
            <span class="glyph">${glyph}</span>
          </div>
          <div class="product-info">
            <div class="cat">${category}</div>
            <h4>${title}</h4>
            <div class="price-row">
              <span class="price">${price}</span>
              ${strike ? `<span class="price strike">${strike}</span>` : ''}
            </div>
            ${rentNote ? `<div class="rent-note">${rentNote}</div>` : ''}
          </div>
        </a>
      </div>`;
  }
}

customElements.define("sj-utility-bar", SJUtilityBar);
customElements.define("sj-header", SJHeader);
customElements.define("sj-footer", SJFooter);
customElements.define("sj-newsletter", SJNewsletter);
customElements.define("sj-trust-strip", SJTrustStrip);
customElements.define("sj-product-card", SJProductCard);

class SJCatCard extends HTMLElement {
  connectedCallback() {
    const href = this.getAttribute("href") || "#";
    const icon = this.getAttribute("icon") || "";
    const title = this.getAttribute("title") || "";
    const subtitle = this.getAttribute("subtitle") || "";
    
    this.innerHTML = `
      <a href="${href}" class="cat-card">
        <div class="cat-icon">${icon}</div>
        <h4>${title}</h4>
        <span>${subtitle}</span>
      </a>`;
  }
}
customElements.define("sj-cat-card", SJCatCard);

class SJTestiCard extends HTMLElement {
  connectedCallback() {
    const stars = this.getAttribute("stars") || "★★★★★";
    const quote = this.getAttribute("quote") || "";
    const who = this.getAttribute("who") || "";
    
    this.innerHTML = `
      <div class="testi-card">
        <div class="stars">${stars}</div>
        <p>${quote}</p>
        <div class="who">${who}</div>
      </div>`;
  }
}
customElements.define("sj-testi-card", SJTestiCard);

class SJRentStep extends HTMLElement {
  connectedCallback() {
    const num = this.getAttribute("num") || "";
    const title = this.getAttribute("title") || "";
    const desc = this.getAttribute("desc") || "";
    
    this.innerHTML = `
      <div class="rent-step">
        <div class="num">${num}</div>
        <h4 style="color:var(--ivory)">${title}</h4>
        <p style="color:var(--ivory-deep); font-size:.85rem;">${desc}</p>
      </div>`;
  }
}
customElements.define("sj-rent-step", SJRentStep);

class SJSplitCard extends HTMLElement {
  connectedCallback() {
    const type = this.getAttribute("type") || "buy";
    const tag = this.getAttribute("tag") || "";
    const title = this.getAttribute("title") || "";
    const desc = this.getAttribute("desc") || "";
    const link = this.getAttribute("link") || "#";
    const linkText = this.getAttribute("link-text") || "";
    
    this.innerHTML = `
      <a href="${link}" class="split-card ${type}">
        <span class="tag">${tag}</span>
        <h2>${title}</h2>
        <p>${desc}</p>
        <span class="btn btn-ghost-light">${linkText}</span>
      </a>`;
  }
}
customElements.define("sj-split-card", SJSplitCard);

class SJJewelDrip extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="jewel-drip">
        <svg viewBox="0 0 220 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 2 Q110 26 220 2" stroke="#c9993d" stroke-width="1"/>
          <circle cx="40" cy="14" r="3" fill="#c9993d"/>
          <circle cx="80" cy="22" r="3.5" fill="#c9993d"/>
          <circle cx="110" cy="25" r="4" fill="#e7c77e"/>
          <circle cx="140" cy="22" r="3.5" fill="#c9993d"/>
          <circle cx="180" cy="14" r="3" fill="#c9993d"/>
        </svg>
      </div>`;
  }
}
customElements.define("sj-jewel-drip", SJJewelDrip);

class SJStat extends HTMLElement {
  connectedCallback() {
    const num = this.getAttribute("num") || "";
    const text = this.getAttribute("text") || "";
    
    this.innerHTML = `
      <div class="stat">
        <h3>${num}</h3>
        <span>${text}</span>
      </div>`;
  }
}
customElements.define("sj-stat", SJStat);

class SJSectionHead extends HTMLElement {
  connectedCallback() {
    const eyebrow = this.getAttribute("eyebrow") || "";
    const title = this.getAttribute("title") || "";
    const desc = this.getAttribute("desc") || "";
    
    this.innerHTML = `
      <div class="section-head">
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
        <h2>${title}</h2>
        ${desc ? `<p>${desc}</p>` : ''}
      </div>`;
  }
}
customElements.define("sj-section-head", SJSectionHead);

class SJHomeHero extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="hero-carousel" id="heroCarousel">
        <div class="hero-slide tone-wine is-active" data-slide="0">
          <span class="hero-slide-caption">01 / 04 — Bridal Collection</span>
          <div class="hero-inner">
            <p class="eyebrow">Kochi's House of Heirlooms</p>
            <h1>Adorn every story <em>in gold</em>, borrow every occasion <em>in grace</em></h1>
            <p class="sub">Sarangi curates fine ornaments and bridal jewellery for those who wish to own a legacy — and rents exquisite sets, dance costumes and makeup for those who wish to shine, just for a day.</p>
            <div class="hero-ctas">
              <a href="shop.html" class="btn btn-gold">Shop Fine Jewellery</a>
              <a href="rentals.html" class="btn btn-ghost-light">Rent For An Occasion</a>
            </div>
            <div class="hero-divider"><span class="line"></span>WHERE TRADITION MEETS TIMELESS GRACE<span class="line"></span></div>
          </div>
        </div>

        <div class="hero-slide tone-peacock" data-slide="1">
          <span class="hero-slide-caption">02 / 04 — Dance &amp; Performance</span>
          <div class="hero-inner">
            <p class="eyebrow">For The Arangetram &amp; Beyond</p>
            <h1>Classical costumes <em>and jewellery</em>, rented as one complete look</h1>
            <p class="sub">Bharatanatyam, Mohiniyattam, Kathak and Kuchipudi sets — costume, temple jewellery and hair accessories, delivered ready for the stage.</p>
            <div class="hero-ctas">
              <a href="dance-costumes.html" class="btn btn-gold">Browse Dance Costumes</a>
              <a href="makeup.html" class="btn btn-ghost-light">Add Stage Makeup</a>
            </div>
            <div class="hero-divider"><span class="line"></span>EVERY DETAIL, TAKEN CARE OF<span class="line"></span></div>
          </div>
        </div>

        <div class="hero-slide tone-ink" data-slide="2">
          <span class="hero-slide-caption">03 / 04 — New Arrivals</span>
          <div class="hero-inner">
            <p class="eyebrow">Fresh From The Atelier</p>
            <h1>This season's <em>kemp &amp; temple</em> pieces have just landed</h1>
            <p class="sub">Handcrafted in antique gold-tone finish, inspired by carvings from Kerala's temple architecture — nickel-free and made to be worn often.</p>
            <div class="hero-ctas">
              <a href="shop.html" class="btn btn-gold">Shop New Arrivals</a>
              <a href="bridal-jewellery.html" class="btn btn-ghost-light">Shop Bridal Sets</a>
            </div>
            <div class="hero-divider"><span class="line"></span>HANDCRAFTED IN KOCHI<span class="line"></span></div>
          </div>
        </div>

        <div class="hero-slide tone-wine" data-slide="3">
          <span class="hero-slide-caption">04 / 04 — Complete The Look</span>
          <div class="hero-inner">
            <p class="eyebrow">Makeup &amp; Styling</p>
            <h1>Book the <em>jewellery, the outfit</em> and the artist — all in one place</h1>
            <p class="sub">Bridal and party makeup sessions, in-store or at your doorstep, paired seamlessly with your rented or purchased pieces.</p>
            <div class="hero-ctas">
              <a href="makeup.html" class="btn btn-gold">Book A Makeup Session</a>
              <a href="rentals.html" class="btn btn-ghost-light">See All Rentals</a>
            </div>
            <div class="hero-divider"><span class="line"></span>WHERE TRADITION MEETS TIMELESS GRACE<span class="line"></span></div>
          </div>
        </div>

        <button class="hero-arrow prev" aria-label="Previous slide" onclick="heroGo(-1)">&#10094;</button>
        <button class="hero-arrow next" aria-label="Next slide" onclick="heroGo(1)">&#10095;</button>

        <div class="hero-indicators">
          <button class="is-active" aria-label="Go to slide 1" onclick="heroGoTo(0)"></button>
          <button aria-label="Go to slide 2" onclick="heroGoTo(1)"></button>
          <button aria-label="Go to slide 3" onclick="heroGoTo(2)"></button>
          <button aria-label="Go to slide 4" onclick="heroGoTo(3)"></button>
        </div>
      </header>`;
      
    // Timer script
    const slides = this.querySelectorAll('.hero-slide');
    const dots = this.querySelectorAll('.hero-indicators button');
    if (!slides.length || !dots.length) return;
    
    let current = 0;
    const total = slides.length;
    let timer;

    const show = (idx) => {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = (idx + total) % total;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    };
    window.heroGo = (dir) => { show(current + dir); resetTimer(); };
    window.heroGoTo = (idx) => { show(idx); resetTimer(); };

    const resetTimer = () => {
      clearInterval(timer);
      timer = setInterval(() => { show(current + 1); }, 6000);
    };
    resetTimer();
  }
}
customElements.define("sj-home-hero", SJHomeHero);

class SJPageBanner extends HTMLElement {
  connectedCallback() {
    const crumbs = this.getAttribute("crumbs") || "";
    const title = this.getAttribute("title") || "";
    const desc = this.getAttribute("desc") || "";
    
    this.innerHTML = `
      <div class="page-banner">
        ${crumbs ? `<div class="crumbs">${crumbs}</div>` : ''}
        <h1>${title}</h1>
        ${desc ? `<p style="color:var(--ivory-deep); font-size:.9rem;">${desc}</p>` : ''}
      </div>`;
  }
}
customElements.define("sj-page-banner", SJPageBanner);

class SJAccordionItem extends HTMLElement {
  connectedCallback() {
    const summary = this.getAttribute("summary") || "";
    const open = this.hasAttribute("open") ? "open" : "";
    const content = this.innerHTML;
    
    this.innerHTML = `
      <details class="accordion-item" ${open}>
        <summary>${summary}</summary>
        <p>${content}</p>
      </details>`;
  }
}
customElements.define("sj-accordion-item", SJAccordionItem);

class SJCartRow extends HTMLElement {
  connectedCallback() {
    const thumb = this.getAttribute("thumb") || "";
    const title = this.getAttribute("title") || "";
    const meta = this.getAttribute("meta") || "";
    const qty = this.getAttribute("qty") || "1";
    const price = this.getAttribute("price") || "";
    const actions = this.innerHTML;
    
    this.innerHTML = `
      <div class="cart-row">
        <div class="thumb">${thumb}</div>
        <div><h5>${title}</h5><div class="meta">${meta}</div></div>
        <div class="qty-stepper"><button>−</button><span>${qty}</span><button>+</button></div>
        <div class="price" style="font-size:1rem;">${price}</div>
        <div>${actions}</div>
        <div><a href="#" class="remove-link">Remove</a></div>
      </div>`;
  }
}
customElements.define("sj-cart-row", SJCartRow);

class SJMinimalHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="nav" style="display: flex; align-items: center; justify-content: center; height: 80px;">
        <a href="index.html" class="nav-brand" style="text-decoration:none;"><img src="assets/sarangi-logo-mark.png" alt="Sarangi Jewels" style="height:40px;"></a>
      </nav>
    `;
  }
}
customElements.define("sj-minimal-header", SJMinimalHeader);


class SJProductDetail extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="pd-layout">
        <div>
          <div class="pd-gallery-main frame"><span style="font-size:5rem; color:rgba(74,14,30,.3)">&#128142;</span></div>
          <div class="pd-thumbs"><div></div><div></div><div></div><div></div></div>
        </div>
        <div>
          <p class="eyebrow">Bridal Necklace · Kemp &amp; Temple</p>
          <h1 style="font-size:2.3rem; margin:12px 0 10px;">Lotus Kemp Choker Set</h1>
          <div class="stars" style="color:var(--gold); margin-bottom:16px;">★★★★★ <span style="color:#8a7a6a; font-size:.8rem; font-family:'Jost';">(214 reviews)</span></div>

          <div class="pd-mode-toggle">
            <button class="active" id="buyBtn">Buy — Own It</button>
            <button id="rentBtn">Rent — Wear It</button>
          </div>

          <div id="buyPanel">
            <div class="price-row"><span class="price" style="font-size:2rem;">₹6,499</span><span class="price strike" style="font-size:1.2rem;">₹8,900</span></div>
            <p style="color:#6b5a4d; margin:16px 0; line-height:1.8; font-size:.92rem;">A lotus-motif kemp choker inspired by temple carvings, finished in antique gold-tone with hand-set stones. Comes with matching jhumkas and a maang tikka. Nickel-free, skin-safe base.</p>
            <a href="#" class="btn btn-gold" style="width:100%; justify-content:center;">Add To Bag</a>
          </div>

          <div id="rentPanel" style="display:none;">
            <div class="price-row"><span class="price" style="font-size:2rem;">₹1,899</span><span style="color:#8a7a6a; font-size:.9rem;">/ day</span></div>
            <div class="pd-meta">
              <div><strong>Deposit</strong><br>₹5,000 (refundable)</div>
              <div><strong>Min. Rental</strong><br>2 days</div>
              <div><strong>Cleaning</strong><br>Included</div>
            </div>
            <label style="font-size:.8rem; color:#6b5a4d; display:block; margin-bottom:6px;">Select your dates</label>
            <div style="display:flex; gap:10px; margin-bottom:18px;">
              <input type="date" style="flex:1; padding:12px; border:1px solid var(--line); font-family:'Jost';">
              <input type="date" style="flex:1; padding:12px; border:1px solid var(--line); font-family:'Jost';">
            </div>
            <a href="#" class="btn btn-peacock" style="width:100%; justify-content:center;">Reserve This Set</a>
          </div>

          <div class="accordion" style="margin-top:34px;">
            <sj-accordion-item summary="Details &amp; Care" open>Antique gold-tone alloy, hand-set kemp stones, nickel-free coating. Store in a dry pouch, avoid perfume contact.</sj-accordion-item>
            <sj-accordion-item summary="Size &amp; Fit">Adjustable thread closure, fits neck sizes 12"–16". Comes with matching jhumka and maang tikka.</sj-accordion-item>
            <sj-accordion-item summary="Delivery &amp; Rental Terms">Free store pickup in Kochi. Delivery across Kerala in 2–4 days. Rental deposit refunded within 48 hours of return, subject to condition check.</sj-accordion-item>
          </div>
        </div>
      </div>
    `;
    
    const buyBtn = this.querySelector("#buyBtn");
    const rentBtn = this.querySelector("#rentBtn");
    const buyPanel = this.querySelector("#buyPanel");
    const rentPanel = this.querySelector("#rentPanel");
    
    if (buyBtn && rentBtn && buyPanel && rentPanel) {
      const setMode = (mode) => {
        buyPanel.style.display = mode === "buy" ? "block" : "none";
        rentPanel.style.display = mode === "rent" ? "block" : "none";
        buyBtn.classList.toggle("active", mode === "buy");
        rentBtn.classList.toggle("active", mode === "rent");
      };
      
      buyBtn.addEventListener("click", () => setMode("buy"));
      rentBtn.addEventListener("click", () => setMode("rent"));
    }
  }
}
customElements.define("sj-product-detail", SJProductDetail);
