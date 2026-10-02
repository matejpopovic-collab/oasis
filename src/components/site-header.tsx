import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

type Props = {
  back?: React.ReactNode;
  cartCount?: number;
  /** Tailwind container classes for the inner bar, to align with page content. */
  containerClassName?: string;
};

export function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`grid place-items-center rounded-md bg-white text-black font-black ${small ? "size-7 text-sm" : "size-9 text-lg"}`}
        aria-hidden
      >
        P
      </span>
      <span className="leading-none">
        <span className={`block font-extrabold tracking-tight text-white ${small ? "text-sm" : "text-base"}`}>
          Knebworth &apos;27
        </span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 mt-0.5">
          Parking &amp; PUDO
        </span>
      </span>
    </span>
  );
}

export function SiteHeader({ back, cartCount = 0, containerClassName = "max-w-6xl px-6" }: Props) {
  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-white/10">
      <div className={`${containerClassName} mx-auto h-16 sm:h-20 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3 sm:gap-6 whitespace-nowrap min-w-0">
          <Link to="/" aria-label="Home" className="shrink-0">
            <Wordmark />
          </Link>
          {back}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-white whitespace-nowrap shrink-0">
          <ShoppingCart className="size-4" />
          Passes ({cartCount})
        </div>
      </div>
    </nav>
  );
}
