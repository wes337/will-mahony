import Link from "next/link";
import { getProducts, shopifyImageUrl } from "./shopify";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export default async function Products() {
  const products = await getProducts();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1200px] mx-auto p-4">
      {products.map((product) => {
        const image =
          product.featuredImage?.url || product.images.edges[0]?.node.url;
        const price = product.priceRange.minVariantPrice;
        return (
          <Link
            key={product.id}
            href={`/products/${product.handle}`}
            className="flex flex-col hover:scale-[1.05] cursor-pointer"
          >
            <div className="relative">
              {image && (
                <img
                  src={shopifyImageUrl(image, 600)}
                  alt={product.featuredImage?.altText || product.title}
                  loading="lazy"
                  className="w-full aspect-square object-contain [filter:drop-shadow(0_4px_4px_rgba(0,0,0,0.25))]"
                />
              )}
              {!product.availableForSale && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#ff0000] text-white font-serif font-bold uppercase text-lg md:text-xl px-4 py-0.5 -rotate-45 whitespace-nowrap shadow-[0_4px_6px_rgba(0,0,0,0.25)]">
                    Sold Out
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 font-sans text-xl text-center leading-none">
              {product.title}
            </div>
            <div className="text-lg font-bold text-center">
              {formatPrice(price.amount, price.currencyCode)}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
