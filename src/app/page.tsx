/**
 * ===========================================
 * PHOTOVAULT - Landing Page
 * ===========================================
 * Premium landing with gold mono-color accent
 */

import Link from 'next/link';
import { Shield, Zap, Key, ArrowRight, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[150px]" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="max-w-7xl mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center">
                <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold text-text-primary">PhotoVault</span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-4">
              <Link
                href="/public/albums"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors"
              >
                <Globe className="w-4 h-4" strokeWidth={2} />
                Browse Albums
              </Link>
              <Link href="/login" className="btn-primary">
                Login
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/5 border border-accent/10 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              <span className="text-xs font-medium text-accent">Invite-Only Access</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight tracking-tight">
              Your Photos.{' '}
              <span className="text-accent">Your Privacy.</span>
              <br className="hidden sm:block" />
              Our Security.
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-text-tertiary max-w-xl mx-auto mb-10 leading-relaxed">
              Enterprise-grade photo storage with military-level encryption.
              Store your precious memories in a vault only you can access.
            </p>

            {/* CTA */}
            <Link
              href="/login"
              className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2"
            >
              Access Your Vault
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4 mt-28 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-surface border border-border rounded-xl hover:border-accent/20 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-medium text-text-tertiary">PhotoVault</span>
              </div>
              <p className="text-xs text-text-muted">
                © {new Date().getFullYear()} PhotoVault. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Feature data with Lucide icons
const features = [
  {
    title: 'End-to-End Security',
    description: 'Your photos are encrypted before leaving your device and remain encrypted at rest.',
    icon: Shield,
  },
  {
    title: 'Intelligent Compression',
    description: 'Advanced algorithms reduce storage without sacrificing quality.',
    icon: Zap,
  },
  {
    title: 'Invite-Only Access',
    description: 'No public registration. Access granted only through verified invite codes.',
    icon: Key,
  },
];
