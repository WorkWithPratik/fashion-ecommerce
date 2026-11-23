import { Link } from 'react-router-dom'
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react'
import { APP_VERSION } from '../version.js'

export default function Footer() {
  return (
    <footer className="bg-primary text-white/70">
      {/* Newsletter */}
      <div className="bg-accent/10 border-t border-accent/20">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-xl font-bold tracking-wide">Stay in the loop</h3>
            <p className="text-white/60 text-sm mt-1">Subscribe for exclusive deals and new arrivals.</p>
          </div>
          <form className="flex w-full md:w-auto gap-0" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 md:w-72 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-accent"
            />
            <button className="bg-accent text-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-accent-dark transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-accent font-black text-2xl tracking-[0.3em] uppercase">LUXE</span>
            <p className="text-white/50 text-sm mt-4 leading-relaxed">
              Fashion-forward clothing, shoes, and accessories for the modern individual.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="text-white/40 hover:text-accent transition-colors duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white text-xs font-semibold tracking-[0.2em] uppercase mb-5">Shop</h4>
            <ul className="space-y-3">
              {[['All Products', '/products'], ['Clothing', '/products?category=clothing'], ['Shoes', '/products?category=shoes'], ['Accessories', '/products?category=accessories']].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-sm hover:text-accent transition-colors duration-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white text-xs font-semibold tracking-[0.2em] uppercase mb-5">Account</h4>
            <ul className="space-y-3">
              {[['My Orders', '/orders'], ['Login', '/login'], ['Register', '/register']].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-sm hover:text-accent transition-colors duration-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-xs font-semibold tracking-[0.2em] uppercase mb-5">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-accent flex-shrink-0" />
                <a href="mailto:workwithpratik.in@gmail.com" className="hover:text-accent transition-colors break-all">
                  workwithpratik.in@gmail.com
                </a>
              </li>
              <li>Mon – Sat, 10am – 6pm IST</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} LUXE Fashion. All rights reserved.</span>
            <span className="bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider">
              Version: {APP_VERSION}
            </span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent transition-colors">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
