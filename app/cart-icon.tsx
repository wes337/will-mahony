"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TiShoppingCart } from "react-icons/ti";
import Cache from "./cache";
import { getCartItems } from "./shopify";

async function getCartCount() {
  const cartId = await Cache.get("cartId");
  if (!cartId) return 0;
  try {
    const items = await getCartItems(cartId);
    return items.reduce((sum, item) => sum + item.quantity, 0);
  } catch {
    return 0;
  }
}

function CartIcon({ count }: { count: number }) {
  return (
    <div className="relative">
      <TiShoppingCart
        className="w-12 h-12 md:w-16 md:h-16"
        aria-label="cart"
      />
      {count > 0 && (
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 min-w-5 h-5 px-1 bg-[#ff0000] text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
          {count}
        </div>
      )}
    </div>
  );
}

export default function Cart() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const refresh = () => {
      getCartCount().then(setCount);
    };
    refresh();
    window.addEventListener("cart-updated", refresh);

    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("cart-updated", refresh);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (count === 0 || pathname === "/cart" || !mounted) return null;

  const positionClass = scrolled
    ? "top-4 right-4 md:top-8 md:right-8"
    : "top-12 right-4 md:top-20 md:right-8";

  return createPortal(
    <Link
      href="/cart"
      aria-label="View cart"
      className={`fixed ${positionClass} z-50 cursor-pointer hover:scale-[1.05]`}
    >
      <CartIcon count={count} />
    </Link>,
    document.body,
  );
}
