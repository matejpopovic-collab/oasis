import { ShieldCheck, BadgeCheck, Zap } from "lucide-react";

export function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <section className={`border-t border-border ${className}`}>
      <div className="max-w-5xl mx-auto px-4 min-h-[320px] flex items-center">
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 text-center py-14">
          <TrustBadge
            icon={<ShieldCheck className="size-8 text-accent-blue" strokeWidth={1.75} />}
            title="Secure Payments"
            text="Your payment information is encrypted and protected"
          />
          <TrustBadge
            icon={<BadgeCheck className="size-8 text-accent-blue" strokeWidth={1.75} />}
            title="Verified Organisers"
            text="All events are from official verified sources"
          />
          <TrustBadge
            icon={<Zap className="size-8 text-accent-blue" strokeWidth={1.75} />}
            title="Instant Delivery"
            text="Receive your tickets immediately via email"
          />
        </div>
      </div>
    </section>
  );
}

function TrustBadge({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">{icon}</div>
      <h3 className="font-bold text-base mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[220px]">{text}</p>
    </div>
  );
}
