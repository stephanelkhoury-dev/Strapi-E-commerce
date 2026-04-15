import Link from "next/link";
import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function TwitterIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}

function YoutubeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
      <path d="m10 15 5-3-5-3z"/>
    </svg>
  );
}

const footerLinks = {
  shop: [
    { name: "All Products", href: "/categories" },
    { name: "New Arrivals", href: "/categories?sort=createdAt:desc" },
    { name: "Featured", href: "/categories?featured=true" },
    { name: "Sale", href: "/categories?sort=price:asc" },
  ],
  support: [
    { name: "Contact Us", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Shipping Policy", href: "/shipping-policy" },
    { name: "Return Policy", href: "/return-policy" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
  ],
};

const socialLinks = [
  { name: "Facebook", href: "#", icon: FacebookIcon },
  { name: "Instagram", href: "#", icon: InstagramIcon },
  { name: "Twitter", href: "#", icon: TwitterIcon },
  { name: "YouTube", href: "#", icon: YoutubeIcon },
];

export function Footer() {
  return (
    <footer
      className="bg-gray-900 text-gray-300"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                Subscribe to our newsletter
              </h2>
              <p className="text-gray-400 mt-1">
                Get 10% off your first order and stay updated on new arrivals.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-bold text-white">
              ShopNow
            </Link>
            <p className="mt-3 text-sm text-gray-400">
              Premium products at unbeatable prices. Quality you can trust.
            </p>
            <div className="flex space-x-4 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ShopNow. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Secure payments by Stripe & PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
