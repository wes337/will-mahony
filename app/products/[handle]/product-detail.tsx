"use client";

import { useEffect, useRef, useState } from "react";
import { TiTimes } from "react-icons/ti";
import {
  addToCart,
  buyItNow,
  getOrCreateCart,
  type ShopifyProduct,
} from "../../shopify";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export default function ProductDetail({ product }: { product: ShopifyProduct }) {
  const images = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);
  const hasRealVariants =
    variants.length > 1 ||
    (variants[0] && variants[0].title !== "Default Title");

  const firstImage =
    product.featuredImage?.url || images[0]?.url || "";

  const [activeImage, setActiveImage] = useState(firstImage);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [flashVariant, setFlashVariant] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [pending, setPending] = useState<"add" | "buy" | null>(null);
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen]);

  const isSoldOut =
    !product.availableForSale ||
    (hasRealVariants && variants.every((v) => !v.availableForSale));

  function requireVariant() {
    if (!hasRealVariants) return true;
    if (variantId) return true;
    setFlashVariant(false);
    requestAnimationFrame(() => setFlashVariant(true));
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => setFlashVariant(false), 2000);
    return false;
  }

  const effectiveVariantId = hasRealVariants ? variantId : variants[0]?.id;

  async function handleAddToCart() {
    if (!requireVariant() || !effectiveVariantId || pending) return;
    setPending("add");
    try {
      const cart = await getOrCreateCart();
      const updated = await addToCart(cart.id, [
        { merchandiseId: effectiveVariantId, quantity: 1 },
      ]);
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(
        new CustomEvent("cart-item-added", {
          detail: { checkoutUrl: updated?.checkoutUrl || cart.checkoutUrl },
        }),
      );
    } catch (err) {
      console.error("Add to cart failed", err);
    } finally {
      setPending(null);
    }
  }

  async function handleBuyItNow() {
    if (!requireVariant() || !effectiveVariantId || pending) return;
    setPending("buy");
    try {
      await buyItNow([{ merchandiseId: effectiveVariantId, quantity: 1 }]);
    } catch (err) {
      console.error("Buy it now failed", err);
      setPending(null);
    }
  }

  const price = product.priceRange.minVariantPrice;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1200px] mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="View image full screen"
          className="cursor-zoom-in"
        >
          {activeImage && (
            <img
              src={activeImage}
              alt={product.title}
              className="w-full aspect-square object-contain [filter:drop-shadow(0_4px_4px_rgba(0,0,0,0.25))]"
            />
          )}
        </button>
        {images.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(img.url)}
                className={`w-20 h-20 border-2 cursor-pointer ${
                  activeImage === img.url
                    ? "border-[#ff0000]"
                    : "border-black"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.altText || `${product.title} ${i + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-serif text-5xl md:text-6xl leading-none">
            {product.title}
          </h1>
          <div className="font-bold text-2xl mt-2">
            {formatPrice(price.amount, price.currencyCode)}
          </div>
        </div>

        {product.description && (
          <p className="text-lg whitespace-pre-line">{product.description}</p>
        )}

        {hasRealVariants && (
          <div
            className={`flex flex-col gap-2 ${flashVariant ? "flash-blink" : ""}`}
          >
            <div className="uppercase font-bold flash-blink-target">Size</div>
            <div className="flex gap-2 flex-wrap">
              {variants.map((v) => {
                const soldOut = !v.availableForSale;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={soldOut}
                    onClick={() => setVariantId(v.id)}
                    className={`min-w-12 px-4 py-2 border-2 font-bold ${
                      soldOut
                        ? "border-black/30 text-black/30 cursor-default"
                        : `cursor-pointer hover:scale-[1.05] ${
                            variantId === v.id
                              ? "border-[#ff0000] text-[#ff0000]"
                              : "border-black text-black"
                          }`
                    }`}
                  >
                    {v.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-2">
          {isSoldOut ? (
            <div className="w-full bg-black/10 text-black/60 font-serif font-bold uppercase text-4xl md:text-5xl py-3 text-center">
              Sold Out
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={pending !== null}
                onClick={handleBuyItNow}
                className="w-full bg-[#ff0000] text-white border-4 border-black font-serif font-bold uppercase text-4xl md:text-5xl py-3 hover:scale-[1.02] cursor-pointer disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100"
              >
                Buy It Now
              </button>
              <button
                type="button"
                disabled={pending !== null}
                onClick={handleAddToCart}
                className="w-full bg-[#fffb00] border-4 border-black font-serif font-bold uppercase text-4xl md:text-5xl py-3 hover:scale-[1.02] cursor-pointer disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100"
              >
                Add To Cart
              </button>
            </>
          )}
        </div>
      </div>

      {lightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-[60] bg-white flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            aria-label="Close"
            className="absolute top-4 right-4 cursor-pointer hover:scale-[1.05]"
          >
            <TiTimes className="w-12 h-12" />
          </button>
          <img
            src={activeImage}
            alt={product.title}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
