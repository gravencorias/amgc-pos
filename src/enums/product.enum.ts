// String values are what amgc-pos-api stores; keep them in step with the API.

// The picture a category gives its products while they have no photo.
export enum CategoryIconEnum {
  hot = "hot",
  iced = "iced",
  drink = "drink",
  pastry = "pastry",
  meal = "meal",
  sandwich = "sandwich",
  salad = "salad",
  pizza = "pizza",
  dessert = "dessert",
  frozen = "frozen",
}

export const categoryIconLabel: Record<CategoryIconEnum, string> = {
  [CategoryIconEnum.hot]: "Hot drinks",
  [CategoryIconEnum.iced]: "Iced drinks",
  [CategoryIconEnum.drink]: "Other drinks",
  [CategoryIconEnum.pastry]: "Pastries",
  [CategoryIconEnum.meal]: "Rice meals and soup",
  [CategoryIconEnum.sandwich]: "Sandwiches",
  [CategoryIconEnum.salad]: "Salads",
  [CategoryIconEnum.pizza]: "Pizza",
  [CategoryIconEnum.dessert]: "Desserts",
  [CategoryIconEnum.frozen]: "Frozen treats",
};

// A soft background hue per icon, so photo-less products still look distinct.
export const categoryIconHue: Record<CategoryIconEnum, number> = {
  [CategoryIconEnum.hot]: 26,
  [CategoryIconEnum.iced]: 200,
  [CategoryIconEnum.drink]: 170,
  [CategoryIconEnum.pastry]: 40,
  [CategoryIconEnum.meal]: 12,
  [CategoryIconEnum.sandwich]: 140,
  [CategoryIconEnum.salad]: 100,
  [CategoryIconEnum.pizza]: 6,
  [CategoryIconEnum.dessert]: 330,
  [CategoryIconEnum.frozen]: 285,
};

export enum ProductAvailabilityEnum {
  all = "all",
  available = "available",
  soldOut = "soldOut",
}

export const productAvailabilityLabel: Record<ProductAvailabilityEnum, string> = {
  [ProductAvailabilityEnum.all]: "All",
  [ProductAvailabilityEnum.available]: "Available",
  [ProductAvailabilityEnum.soldOut]: "Sold out",
};

export const MAX_PRODUCT_SIZES = 4;
