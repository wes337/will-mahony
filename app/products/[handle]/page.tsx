import Link from "next/link";
import { notFound } from "next/navigation";
import { TiArrowLeft } from "react-icons/ti";
import Header from "../../header";
import Footer from "../../footer";
import { getProduct } from "../../shopify";
import ProductDetail from "./product-detail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return (
    <>
      <Header showNav={false} />
      <Link
        href="/"
        aria-label="Back to shop"
        className="md:hidden absolute top-11 left-3 z-40 hover:scale-[1.05] active:scale-95"
      >
        <TiArrowLeft className="w-12 h-12" />
      </Link>
      <ProductDetail product={product} />
      <Footer />
    </>
  );
}
