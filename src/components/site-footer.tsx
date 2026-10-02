import { Wordmark } from "@/components/site-header";

export function SiteFooter({
  containerClassName = "max-w-6xl px-6",
}: {
  /** Tailwind container classes for the footer content, to align with page grid. */
  containerClassName?: string;
} = {}) {
  return (
    <footer className="py-12 mt-20 bg-black">
      <div className={`${containerClassName} mx-auto flex flex-col sm:flex-row justify-between gap-8`}>
        <div>
          <div className="mb-4">
            <Wordmark small />
          </div>
          <p className="text-sm text-white/60 max-w-xs">
            Official pre-booked parking and Pick Up / Drop Off for Oasis Live &apos;27 at Knebworth Park.
          </p>
        </div>
        <div className="flex gap-16">
          <div>
            <h4 className="font-bold text-sm mb-4 text-white">Travel</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Travel &amp; Transport Plan</li>
              <li>Walking routes</li>
              <li>Accessibility</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 text-white">Support</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Help Centre</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
      </div>
      <div className={`${containerClassName} mx-auto pt-8 mt-8 border-t border-white/10 text-xs text-white/40`}>
        © 2026 Tickets Live. All rights reserved.
      </div>
    </footer>
  );
}
