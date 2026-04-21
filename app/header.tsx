import Link from "next/link";
import Cart from "./cart";

export default function Header() {
  return (
    <>
      <div className="flex items-center justify-center w-full bg-[#ff0000] text-white font-bold uppercase text-lg min-[400px]:text-xl md:text-4xl text-center whitespace-nowrap scale-y-[1.25] leading-none pt-2 pb-1">
        Will Mahony Official Merchandise
      </div>
      <div className="relative flex font-serif w-max mx-auto translate-x-[12.5%]">
        <div className="text-8xl md:text-[12rem]">I</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#ff4b00"
          className="w-20 h-22 md:w-46 md:h-46"
          aria-label="heart"
        >
          <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.5 4 4 7-2.5 4.5-9.5 9-9.5 9z" />
        </svg>
        <div className="text-8xl md:text-[12rem] scale-x-[0.5] translate-x-[-25%] uppercase">
          Love
        </div>
        <Cart />
      </div>
      <div className="flex items-center justify-evenly w-full font-serif text-2xl md:text-5xl max-w-[1200px] mx-auto">
        <Link
          className="bg-[#fffb00] lowercase px-2 py-1 hover:scale-[1.05]"
          href="/"
        >
          Shop
        </Link>
        <Link
          className="bg-[#fffb00] lowercase px-2 py-1 hover:scale-[1.05]"
          href="https://www.patreon.com/cw/willmahony"
        >
          Patreon
        </Link>
        <Link
          className="bg-[#fffb00] lowercase px-2 py-1 hover:scale-[1.05]"
          href="https://www.cameo.com/willmahony1"
        >
          Cameo
        </Link>
      </div>
      <button className="hidden absolute left-[5%] top-[10%] md:flex flex-col uppercase text-center leading-2 scale-x-[0.8] hover:scale-y-[1.1] hover:scale-x-[0.9] -rotate-5 cursor-pointer">
        <div className="text-2xl leading-none">
          Problem
          <br />
          with order?
        </div>
        <div className="font-bold text-4xl leading-none">Click Here!</div>
      </button>
    </>
  );
}
