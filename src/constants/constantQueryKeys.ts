// Query keys shared by more than one feature's hooks. Kept here so the menu hooks
// (products, categories, add-ons) can invalidate each other without importing each other.
export const CATEGORIES_KEY = ["categories-all"];
export const ADD_ONS_KEY = ["add-ons-all"];
export const PRODUCT_LIST_KEY = ["product-list"];
// The register's full menu. Invalidated together with PRODUCT_LIST_KEY.
export const PRODUCT_ALL_KEY = ["product-all"];
// Sales reports. A completed sale on the register invalidates both.
export const SALE_SUMMARY_KEY = ["sale-summary"];
export const SALE_LIST_KEY = ["sale-list"];
