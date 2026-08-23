import Link from 'next/link';

export function SJFooter(): React.JSX.Element {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <img src="/assets/sarangi-logo-mark.png" alt="Sarangi Jewels" />
            <p>Fine and imitation jewellery for sale, plus rentals of bridal sets, dance costumes and makeup — from our Kochi store to your doorstep.</p>
            <div className="social-row">
              <a href="#">ig</a>
              <a href="#">fb</a>
              <a href="#">wa</a>
            </div>
          </div>
          <div>
            <h5>Shop</h5>
            <ul>
              <li><Link href="/shop?category=bridal">Bridal Sets</Link></li>
              <li><Link href="/shop?category=earrings">Earrings</Link></li>
              <li><Link href="/shop?category=bangles">Bangles</Link></li>
              <li><Link href="/shop?category=new">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h5>Rentals</h5>
            <ul>
              <li><Link href="/rentals#bridal">Bridal Jewellery</Link></li>
              <li><Link href="/shop?category=dance">Dance Costumes</Link></li>
              <li><Link href="/makeup">Makeup &amp; Artists</Link></li>
              <li><Link href="/rentals#howitworks">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h5>Help</h5>
            <ul>
              <li><Link href="/account">My Account</Link></li>
              <li><Link href="/orders">Track Order</Link></li>
              <li><Link href="/support">Support Tickets</Link></li>
              <li><Link href="/about">Visit The Store</Link></li>
            </ul>
          </div>
          <div>
            <h5>Visit Us</h5>
            <ul>
              <li>Sarangi Jewels, MG Road</li>
              <li>Kochi, Kerala 682035</li>
              <li>+91 98XXX XXXXX</li>
              <li>hello@sarangijewels.com</li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Sarangi Jewels. All rights reserved.</span>
          <span>
            <Link href="/privacy">Privacy Policy</Link> · <Link href="/terms">Terms</Link> · <Link href="/account">My Account</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
