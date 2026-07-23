export type Product = {
  id: string;
  name: string;
  price: string;
  blurb: string;
};

export const products: Product[] = [
  { id: "drift", name: "Drift Parka", price: "$420", blurb: "Wind-cut shell for cold starts." },
  { id: "rime", name: "Rime Shell", price: "$280", blurb: "Hardface layer. Quiet zippers." },
  { id: "glacier", name: "Glacier Knit", price: "$160", blurb: "Merino weight for the descent." },
];
