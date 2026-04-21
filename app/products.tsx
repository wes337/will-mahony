const TEST_PRODUCTS = [
  { id: "1", title: "Test T Shirt", price: "29.99" },
  { id: "2", title: "Example Shirt", price: "59.99" },
  { id: "3", title: "Sample T Shirt", price: "14.99" },
  { id: "4", title: "Dummy Shirt", price: "19.99" },
  { id: "5", title: "Placeholder T Shirt", price: "7.99" },
  { id: "6", title: "Test Shirt", price: "24.99" },
  { id: "7", title: "Example T Shirt", price: "34.99" },
  { id: "8", title: "Sample Shirt", price: "49.99" },
  { id: "9", title: "Dummy T Shirt", price: "39.99" },
  { id: "10", title: "Placeholder Shirt", price: "9.99" },
  { id: "11", title: "Mock T Shirt", price: "22.99" },
  { id: "12", title: "Mock Shirt", price: "6.99" },
].map((product) => ({ ...product, image: "/tshirt2.png" }));

export default function Products() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1200px] mx-auto p-4">
      {TEST_PRODUCTS.map((product) => (
        <div
          key={product.id}
          className="flex flex-col hover:scale-[1.05] cursor-pointer"
        >
          <img
            src={product.image}
            alt={product.title}
            className="w-full aspect-square object-contain [filter:drop-shadow(0_4px_4px_rgba(0,0,0,0.25))]"
          />
          <div className="mt-2 font-sans text-lg text-center">
            {product.title}
          </div>
          <div className="font-bold text-center">${product.price}</div>
        </div>
      ))}
    </div>
  );
}
