"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export default function Toast() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    const onAdd = (e: Event) => {
      const custom = e as CustomEvent<{ checkoutUrl?: string }>;
      setCheckoutUrl(custom.detail?.checkoutUrl || null);
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 5000);
    };
    window.addEventListener("cart-item-added", onAdd);
    return () => {
      window.removeEventListener("cart-item-added", onAdd);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!mounted) return null;

  const checkout = checkoutUrl ? (
    <a
      href={checkoutUrl}
      className="block bg-[#fffb00] text-black font-serif font-bold lowercase text-lg md:text-xl px-4 py-2 text-center leading-none"
    >
      Go to Checkout
    </a>
  ) : (
    <Link
      href="/cart"
      className="block bg-[#fffb00] text-black font-serif font-bold lowercase text-lg md:text-xl px-4 py-2 text-center leading-none"
    >
      Go to Checkout
    </Link>
  );

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-4 right-4 bottom-24 md:left-auto md:right-8 md:bottom-16 md:max-w-sm z-[70] transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="border-4 border-black bg-white text-black text-center">
        <div className="px-4 py-3 text-lg md:text-xl leading-snug border-b-4 border-black">
          Item was added to your cart!
        </div>
        {checkout}
      </div>
    </div>,
    document.body,
  );
}
