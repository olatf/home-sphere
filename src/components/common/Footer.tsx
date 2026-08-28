import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const EXPLORE_LINKS = [
  { name: 'About Us', href: '/about' },
  { name: 'Properties', href: '/properties' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

const LEGAL_LINKS = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
];

const SOCIALS = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-black text-gray-300">
      <div className="container mx-auto px-6 py-16 lg:px-16">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <Link href="/" className="mx-0 flex items-center md:mx-6">
              <Image
                src="/images/logo-black.webp"
                alt="Brand Logo"
                width={1500}
                height={30}
                className="h-auto w-full"
                priority
              />
            </Link>
            <p className="mt-4 max-w-xs font-secondary text-gray-400 text-sm leading-relaxed">
              Connecting landlords and tenants through trust, innovation, and a
              seamless rental experience.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-brand-primary hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-2 md:items-start">
            <div>
              <h3 className="mb-4 font-primary font-semibold text-sm text-white">
                Explore
              </h3>
              <ul className="space-y-3">
                {EXPLORE_LINKS.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-secondary text-gray-400 text-sm transition hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-primary font-semibold text-sm text-white">
                Get started
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/sign-up"
                    className="font-secondary text-gray-400 text-sm transition hover:text-white"
                  >
                    Create an account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sign-in"
                    className="font-secondary text-gray-400 text-sm transition hover:text-white"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties"
                    className="font-secondary text-gray-400 text-sm transition hover:text-white"
                  >
                    Browse listings
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-primary font-semibold text-sm text-white">
                Contact
              </h3>
              <ul className="space-y-3 font-secondary text-gray-400 text-sm">
                <li>Ikeja, Lagos, Nigeria</li>
                <li>
                  <a
                    href="mailto:hello@homesphere.com"
                    className="transition hover:text-white"
                  >
                    hello@homesphere.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+2348000000000"
                    className="transition hover:text-white"
                  >
                    +234 800 000 0000
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-white/10 border-t pt-8 sm:flex-row">
          <p className="font-secondary text-gray-500 text-sm">
            © {new Date().getFullYear()} Homesphere. All rights reserved.
          </p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="font-secondary text-gray-500 text-sm transition hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
