"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-8 h-8 md:w-16 md:h-16"
      aria-label="cart"
    >
      <path d="M2 3h2.2l2.5 12.3a2 2 0 0 0 2 1.7h9.2a2 2 0 0 0 2-1.6L21.5 7H6" />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default function Cart() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const portalClassName = scrolled
    ? "fixed top-4 right-4 md:top-8 md:right-8 z-50"
    : "fixed top-12 right-4 z-50 md:hidden";

  return (
    <>
      {!scrolled && (
        <div className="hidden md:flex items-center self-center md:ml-8">
          <CartIcon />
        </div>
      )}
      {mounted &&
        createPortal(
          <div className={portalClassName}>
            <CartIcon />
          </div>,
          document.body,
        )}
    </>
  );
}
