import Link from "next/link";
import { TiArrowLeft } from "react-icons/ti";
import Header from "../header";
import CartView from "./cart-view";

export default function CartPage() {
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
      <CartView />
    </>
  );
}
