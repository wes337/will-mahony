"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TiTimes } from "react-icons/ti";
import Cache from "../cache";
import {
  getCart,
  getCartItems,
  removeFromCart,
  type CartItem,
} from "../shopify";

function formatPrice(amount: string | number, currencyCode = "USD") {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(value);
}

export default function CartView() {
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState<{
    amount: string;
    currencyCode: string;
  } | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  async function loadCart() {
    const cartId = await Cache.get("cartId");
    if (!cartId) {
      setItems([]);
      setCheckoutUrl(null);
      setSubtotal(null);
      return;
    }
    try {
      const [cart, cartItems] = await Promise.all([
        getCart(cartId),
        getCartItems(cartId),
      ]);
      setItems(cartItems);
      setCheckoutUrl(cart?.checkoutUrl || null);
      setSubtotal(cart?.estimatedCost?.subtotalAmount || null);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleRemove(lineId: string) {
    if (removing) return;
    const cartId = await Cache.get("cartId");
    if (!cartId) return;
    setRemoving(lineId);
    try {
      await removeFromCart(cartId, [lineId]);
      await loadCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Remove from cart failed", err);
    } finally {
      setRemoving(null);
    }
  }

  const itemCount = items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 mt-8 md:mt-0">
      {items === null ? (
        <div className="border-4 border-black p-8 md:p-16 text-center font-serif font-bold uppercase text-2xl md:text-4xl">
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="border-4 border-black">
          <div className="bg-[#ff0000] text-white border-b-4 border-black px-4 md:px-6 py-2 md:py-3 font-serif font-bold uppercase text-2xl md:text-4xl">
            Your Cart
          </div>
          <div className="p-8 md:p-16 flex flex-col items-center gap-6 md:gap-8 bg-white">
            <div className="font-serif uppercase text-3xl md:text-5xl text-center leading-none">
              Your cart is empty
            </div>
            <Link
              href="/"
              className="bg-[#fffb00] text-black border-4 border-black font-serif font-bold uppercase text-2xl md:text-4xl px-6 md:px-8 py-2 md:py-3 hover:scale-[1.05]"
            >
              Keep Shopping
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="text-black text-center font-serif font-bold uppercase text-2xl md:text-4xl leading-none mb-4 md:mb-6">
            Your Cart ({itemCount} {itemCount === 1 ? "Item" : "Items"})
          </div>

          <ul className="border-4 border-black bg-white">
            {items.map((item, i) => {
              const isRemoving = removing === item.id;
              return (
                <li
                  key={item.id}
                  className={`relative flex items-center gap-4 md:gap-6 p-4 md:p-6 ${
                    i > 0 ? "border-t-4 border-black" : ""
                  } ${isRemoving ? "opacity-40" : ""}`}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 md:w-32 md:h-32 object-contain shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-2xl md:text-4xl leading-none break-words">
                      {item.title}
                    </div>
                    <div className="flex gap-3 mt-2 md:mt-1 flex-wrap text-sm md:text-base uppercase font-bold text-black">
                      {item.variantTitle &&
                        item.variantTitle !== "Default Title" && (
                          <span>{item.variantTitle}</span>
                        )}
                      <span className="normal-case">x{item.quantity}</span>
                    </div>
                  </div>
                  <div className="font-bold text-xl md:text-2xl whitespace-nowrap">
                    {formatPrice(item.price)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    disabled={removing !== null}
                    aria-label="Remove item"
                    className="md:absolute  md:top-0 md:right-0 text-[#ff0000] shrink-0 cursor-pointer hover:scale-[1.05] disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100"
                  >
                    <TiTimes className="w-8 h-8 md:w-12 md:h-12" />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-baseline justify-between px-4 md:px-6 mt-4 md:mt-6">
            <div className="font-bold uppercase text-2xl md:text-4xl leading-none">
              Subtotal
            </div>
            <div className="font-bold text-2xl md:text-4xl leading-none">
              {subtotal
                ? formatPrice(subtotal.amount, subtotal.currencyCode)
                : "—"}
            </div>
          </div>

          {checkoutUrl && (
            <>
              <div className="text-center text-sm font-bold mt-4 md:mt-6">
                Shipping &amp; taxes calculated at checkout
              </div>
              <a
                href={checkoutUrl}
                className="block w-full mt-3 bg-[#fffb00] text-black border-4 border-black font-serif font-bold uppercase text-4xl md:text-6xl px-6 py-4 md:py-6 text-center hover:scale-[1.02]"
              >
                Checkout
              </a>
            </>
          )}
        </>
      )}
    </div>
  );
}
