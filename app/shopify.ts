import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import Cache from "./cache";

const storefrontClient = createStorefrontApiClient({
  apiVersion: "2025-07",
  storeDomain: "fishtank-gift-shop.myshopify.com",
  publicAccessToken: "b741b59d803d3e9fc54fe2f1b0044f77",
});

export async function createCart() {
  const { data } = await storefrontClient.request(`
      mutation CreateCart {
        cartCreate {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `);

  return data.cartCreate.cart;
}

export async function getCart(cartId: string) {
  const { data } = await storefrontClient.request(
    `query CartQuery($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          estimatedCost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      handle
                    }
                    price {
                      amount
                      currencyCode
                    }
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }`,
    {
      variables: { cartId },
    },
  );

  return data.cart;
}

export async function isCartValid(cartId: string) {
  try {
    const { data } = await storefrontClient.request(
      `query CartQuery($cartId: ID!) {
          cart(id: $cartId) {
            id
            checkoutUrl
          }
        }`,
      {
        variables: { cartId },
      },
    );

    return !!(data && data.cart && data.cart.id);
  } catch {
    return false;
  }
}

export async function getOrCreateCart() {
  const cachedCartId = await Cache.get("cartId");
  const validCart = cachedCartId ? await isCartValid(cachedCartId) : false;

  if (validCart) {
    const existingCart = await getCart(cachedCartId);

    return existingCart;
  }

  const cart = await createCart();

  Cache.set("cartId", cart.id, 180);

  return cart;
}

export async function buyItNow(
  lines: { merchandiseId: string; quantity: number }[],
) {
  const cart = await createCart();
  const updatedCart = await addToCart(cart.id, lines);
  window.location.href = updatedCart.checkoutUrl;
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
) {
  const { data } = await storefrontClient.request(
    `mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            estimatedCost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: { cartId, lines },
    },
  );

  Cache.set("cartId", cartId, 180);

  return data.cartLinesAdd.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
  const { data } = await storefrontClient.request(
    `mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            estimatedCost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: { cartId, lineIds },
    },
  );

  return data.cartLinesRemove.cart;
}

export async function updateQuantity(
  cartId: string,
  lineId: string,
  quantity: number,
) {
  const { data } = await storefrontClient.request(
    `mutation UpdateCartLineQuantity($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            estimatedCost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: {
        cartId,
        lines: [{ id: lineId, quantity }],
      },
    },
  );

  return data.cartLinesUpdate.cart;
}

export async function emptyCart(cart: any) {
  if (
    !cart ||
    !cart.lines ||
    !cart.lines.edges ||
    cart.lines.edges.length === 0
  ) {
    return;
  }

  const lineIds = cart.lines.edges.map((edge: any) => edge.node.id);

  await storefrontClient.request(
    `mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            estimatedCost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: { cartId: cart.id, lineIds },
    },
  );
}

export async function getCartItems(cartId: string): Promise<CartItem[]> {
  const cart = await getCart(cartId);

  if (
    !cart ||
    !cart.lines ||
    !cart.lines.edges ||
    cart.lines.edges.length === 0
  ) {
    return [];
  }

  return cart.lines.edges.map(({ node }: any) => {
    const merchandise = node.merchandise;

    return {
      id: node.id,
      quantity: node.quantity,
      variantId: merchandise.id,
      variantTitle: merchandise.title,
      title: merchandise.product.title,
      handle: merchandise.product.handle,
      price: merchandise.price.amount,
      image: merchandise.image?.url || "",
    } as CartItem;
  });
}

export interface CartItem {
  id: string;
  quantity: number;
  variantId: string;
  variantTitle: string;
  title: string;
  handle: string;
  price: number | string;
  image: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export function shopifyImageUrl(url: string | null | undefined, width: number) {
  if (!url) return "";
  try {
    const u = new URL(url);
    u.searchParams.set("width", String(width));
    return u.toString();
  } catch {
    return url;
  }
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  image: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ShopifyProductVariant }[] };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
}

const PRODUCT_FRAGMENT = `
  id
  title
  handle
  description
  descriptionHtml
  availableForSale
  featuredImage {
    url
    altText
  }
  images(first: 10) {
    edges {
      node {
        url
        altText
      }
    }
  }
  variants(first: 50) {
    edges {
      node {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        image {
          url
          altText
        }
      }
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
`;

export async function getProducts(first = 50): Promise<ShopifyProduct[]> {
  const { data } = await storefrontClient.request(
    `query GetProducts($first: Int!) {
      products(first: $first, sortKey: TITLE) {
        edges {
          node {
            ${PRODUCT_FRAGMENT}
          }
        }
      }
    }`,
    { variables: { first } },
  );

  return data.products.edges.map((edge: any) => edge.node);
}

export async function getProduct(
  handle: string,
): Promise<ShopifyProduct | null> {
  const { data } = await storefrontClient.request(
    `query GetProduct($handle: String!) {
      product(handle: $handle) {
        ${PRODUCT_FRAGMENT}
      }
    }`,
    { variables: { handle } },
  );

  return data.product || null;
}

export async function getCollections(first = 20): Promise<ShopifyCollection[]> {
  const { data } = await storefrontClient.request(
    `query GetCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
            products(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }`,
    { variables: { first } },
  );

  return data.collections.edges
    .filter((edge: any) => edge.node.products.edges.length > 0)
    .map((edge: any) => edge.node);
}

export async function getCollectionWithProducts(handle: string): Promise<{
  collection: ShopifyCollection;
  products: ShopifyProduct[];
} | null> {
  const { data } = await storefrontClient.request(
    `query GetCollection($handle: String!) {
      collection(handle: $handle) {
        id
        title
        handle
        description
        image {
          url
          altText
        }
        products(first: 50) {
          edges {
            node {
              ${PRODUCT_FRAGMENT}
            }
          }
        }
      }
    }`,
    { variables: { handle } },
  );

  if (!data.collection) return null;

  return {
    collection: data.collection,
    products: data.collection.products.edges.map((edge: any) => edge.node),
  };
}
