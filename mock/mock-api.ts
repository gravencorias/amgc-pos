/**
 * DEV-ONLY MOCK OF amgc-pos-api.
 *
 * Runs inside `yarn dev` (vite.config.ts) when VITE_USE_MOCK_API=true, answering
 * the routes in docs/api-contract.md so the app works before the real ASP.NET
 * Core API exists. It is never part of a build. Data is kept in mock/data/db.json
 * (git-ignored); delete that file to start over.
 *
 * The real API must hash passwords and PINs. The mock keeps them as plain text
 * because it only ever runs on a developer's machine.
 *
 * Demo sign-ins (mock only): see README.md.
 */
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, resolve } from "node:path";
import { networkInterfaces } from "node:os";

type Role = { code: string; value: string };
type User = {
  id: number;
  username: string | null;
  password: string | null;
  pin: string | null;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  lastSignInAt: string | null;
};

type Category = { id: number; name: string; icon: string; sortOrder: number };
type AddOn = { id: number; name: string; price: number };
type Size = { name: string; price: number };
type Product = {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  sizes: Size[];
  addOnIds: number[];
  photoUrl: string | null;
  isAvailable: boolean;
  updatedAt: string;
};

const ROLES = {
  owner: { code: "P001", value: "Owner" },
  manager: { code: "P002", value: "Manager" },
  cashier: { code: "P003", value: "Cashier" },
};
const roleByCode = (code: string) => Object.values(ROLES).find((r) => r.code === code);

const SEEDED = new Date("2026-11-01T08:00:00+08:00").toISOString();
const DEFAULT_USERS: User[] = [
  { id: 1, username: "owner", password: "owner1234", pin: null, fullName: "Maria Santos", role: ROLES.owner, isActive: true, createdAt: SEEDED, lastSignInAt: null },
  { id: 2, username: "manager", password: "manager1234", pin: null, fullName: "Jose Reyes", role: ROLES.manager, isActive: true, createdAt: SEEDED, lastSignInAt: null },
  { id: 3, username: null, password: null, pin: "1234", fullName: "Ana Cruz", role: ROLES.cashier, isActive: true, createdAt: SEEDED, lastSignInAt: null },
  { id: 4, username: null, password: null, pin: "5678", fullName: "Ben Dizon", role: ROLES.cashier, isActive: true, createdAt: SEEDED, lastSignInAt: null },
];

// The sample menu from the prototype (amgc-pos-prototype/index.html).
const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: "Hot coffee", icon: "hot", sortOrder: 1 },
  { id: 2, name: "Iced drinks", icon: "iced", sortOrder: 2 },
  { id: 3, name: "Pastries", icon: "pastry", sortOrder: 3 },
  { id: 4, name: "Rice meals", icon: "meal", sortOrder: 4 },
  { id: 5, name: "Sandwiches and pasta", icon: "sandwich", sortOrder: 5 },
  { id: 6, name: "Desserts", icon: "dessert", sortOrder: 6 },
];
const DEFAULT_ADD_ONS: AddOn[] = [
  { id: 1, name: "Extra shot", price: 40 },
  { id: 2, name: "Oat milk", price: 35 },
  { id: 3, name: "Vanilla syrup", price: 25 },
  { id: 4, name: "Whipped cream", price: 20 },
  { id: 5, name: "Fried egg", price: 20 },
  { id: 6, name: "Extra rice", price: 25 },
  { id: 7, name: "Cheese", price: 15 },
];
const cup = (b: number): Size[] => [
  { name: "12 oz", price: b },
  { name: "16 oz", price: b + 25 },
  { name: "22 oz", price: b + 45 },
];
const tall = (b: number): Size[] => [
  { name: "16 oz", price: b },
  { name: "22 oz", price: b + 30 },
];
const seedProducts = (): Product[] => {
  const rows: [string, number, number, Size[], number[], boolean?][] = [
    ["Barako Brew", 1, 110, cup(110), [1, 2, 3]],
    ["Americano", 1, 120, cup(120), [1, 2, 3]],
    ["Cappuccino", 1, 150, cup(150), [1, 2, 3]],
    ["Café Latte", 1, 150, cup(150), [1, 2, 3]],
    ["Spanish Latte", 1, 165, cup(165), [1, 2, 3]],
    ["Mocha", 1, 160, cup(160), [1, 2, 3, 4]],
    ["Iced Caramel Macchiato", 2, 175, tall(175), [1, 2, 3]],
    ["Matcha Latte", 2, 170, tall(170), [2, 4]],
    ["Ube Latte", 2, 175, tall(175), [2, 4]],
    ["Calamansi Cooler", 2, 110, tall(110), []],
    ["Java Chip Frappé", 2, 190, tall(190), [4, 1], false],
    ["Ensaymada", 3, 85, [], []],
    ["Ube Cheese Pandesal", 3, 95, [], []],
    ["Butter Croissant", 3, 110, [], []],
    ["Banana Bread", 3, 90, [], []],
    ["Tapsilog", 4, 220, [], [5, 6]],
    ["Longsilog", 4, 195, [], [5, 6]],
    ["Chicken Adobo", 4, 210, [], [5, 6]],
    ["Sisig Rice Bowl", 4, 230, [], [5, 6]],
    ["Clubhouse Sandwich", 5, 195, [], [7]],
    ["Pancit Canton", 5, 180, [], []],
    ["Carbonara", 5, 210, [], [7]],
    ["Leche Flan", 6, 95, [], []],
    ["Mango Graham Float", 6, 120, [], []],
  ];
  return rows.map(([name, categoryId, price, sizes, addOnIds, isAvailable], i) => ({
    id: i + 1,
    name,
    categoryId,
    price,
    sizes,
    addOnIds,
    photoUrl: null,
    isAvailable: isAvailable !== false,
    updatedAt: SEEDED,
  }));
};

const DEFAULT_SETTINGS = {
  storeName: "My Café",
  tagline: "",
  address: "",
  tin: "",
  vatRegistered: true,
  receiptFooter: "Salamat po! Come again.",
  showLogoOnReceipt: true,
  receiptWidth: "80mm",
  logoUrl: null as string | null,
  theme: "ube",
  customColor: "#0D6C77",
  mode: "light",
  corners: "soft",
  textSize: "normal",
  updatedAt: new Date().toISOString(),
};
type Settings = typeof DEFAULT_SETTINGS;

const DB_FILE = resolve(process.cwd(), "mock/data/db.json");
const tokens = new Map<string, number>();

type SaleLine = {
  productId: number;
  name: string;
  sizeName: string | null;
  addOns: { id: number; name: string; price: number }[];
  note: string | null;
  unitPrice: number;
  qty: number;
  lineTotal: number;
};
type Sale = {
  id: number;
  receiptNumber: string;
  orderNumber: string;
  createdAt: string;
  cashierId: number;
  cashierName: string;
  orderType: string;
  tableNo: string | null;
  lines: SaleLine[];
  discount: { kind: string; name: string; idNumber: string } | null;
  totals: {
    gross: number;
    vatExemptAmount: number;
    discountAmount: number;
    total: number;
    vatableSales: number;
    vat: number;
    vatExemptSales: number;
  };
  payment: { method: string; tendered: number; change: number; reference: string | null };
  // "completed" or "voided". A void keeps the sale on record and takes it out of the totals.
  status: string;
  voidInfo: { reason: string; voidedAt: string; voidedByName: string; approvedByName: string } | null;
};

// One Philippine calendar day's figures, as the Z reading prints them. Voided sales are
// left out of every figure except voidCount and voidTotal.
type DayFigures = {
  firstReceipt: string | null;
  lastReceipt: string | null;
  saleCount: number;
  grossSales: number;
  discountCount: number;
  discountTotal: number;
  netSales: number;
  vatableSales: number;
  vat: number;
  vatExemptSales: number;
  voidCount: number;
  voidTotal: number;
  cashSales: number;
  byPayment: { method: string; count: number; total: number }[];
};

// A closed day (Z reading). Numbered in order, and the running grand total carries on.
type DayClose = {
  id: number;
  zNumber: string;
  date: string;
  closedAt: string;
  closedByName: string;
  figures: DayFigures;
  openingFloat: number;
  cashCount: { denomination: number; qty: number }[];
  expectedCash: number;
  countedCash: number;
  overShort: number;
  note: string | null;
  grandTotalBefore: number;
  grandTotalAfter: number;
  // "closed", or "reopened" once the owner reopens the day. A reopened Z reading stays on
  // record but no longer closes the day or counts toward the grand total.
  status: string;
  reopenInfo: { reason: string; reopenedAt: string; reopenedByName: string } | null;
};

type Db = {
  settings: Settings;
  users: User[];
  categories: Category[];
  addOns: AddOn[];
  products: Product[];
  sales: Sale[];
  dayCloses: DayClose[];
};

const defaultDb = (): Db => ({
  settings: { ...DEFAULT_SETTINGS },
  users: DEFAULT_USERS.map((u) => ({ ...u })),
  categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
  addOns: DEFAULT_ADD_ONS.map((a) => ({ ...a })),
  products: seedProducts(),
  sales: [],
  dayCloses: [],
});

// Older db.json files lack the newer collections; those start from the defaults.
const loadDb = (): Db => {
  const fresh = defaultDb();
  try {
    if (existsSync(DB_FILE)) {
      const saved = JSON.parse(readFileSync(DB_FILE, "utf8"));
      return {
        settings: { ...DEFAULT_SETTINGS, ...saved.settings },
        users: Array.isArray(saved.users) ? saved.users : fresh.users,
        categories: Array.isArray(saved.categories) ? saved.categories : fresh.categories,
        addOns: Array.isArray(saved.addOns) ? saved.addOns : fresh.addOns,
        products: Array.isArray(saved.products) ? saved.products : fresh.products,
        // Sales saved before voids existed are completed ones.
        sales: Array.isArray(saved.sales)
          ? saved.sales.map((s: Sale) => ({ ...s, status: s.status ?? "completed", voidInfo: s.voidInfo ?? null }))
          : fresh.sales,
        // Closings saved before reopening existed are closed ones.
        dayCloses: Array.isArray(saved.dayCloses)
          ? saved.dayCloses.map((c: DayClose) => ({ ...c, status: c.status ?? "closed", reopenInfo: c.reopenInfo ?? null }))
          : fresh.dayCloses,
      };
    }
  } catch {
    // Unreadable file: start from the defaults.
  }
  return fresh;
};
const db = loadDb();
const saveDb = () => {
  mkdirSync(dirname(DB_FILE), { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};

const readBody = (req: IncomingMessage) =>
  new Promise<Buffer>((done, fail) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => done(Buffer.concat(chunks)));
    req.on("error", fail);
  });

const send = (res: ServerResponse, status: number, body?: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(body === undefined ? "" : JSON.stringify(body));
};

// Just enough multipart parsing for the single "File" part the app sends.
const readFilePart = (body: Buffer, contentType: string) => {
  const boundary = /boundary=(.+)$/.exec(contentType)?.[1];
  if (!boundary) return null;
  const marker = Buffer.from(`--${boundary}`);
  let start = body.indexOf(marker);
  while (start !== -1) {
    const next = body.indexOf(marker, start + marker.length);
    if (next === -1) break;
    const part = body.subarray(start + marker.length + 2, next - 2);
    const headerEnd = part.indexOf("\r\n\r\n");
    const headers = part.subarray(0, headerEnd).toString();
    if (/name="File"/.test(headers)) {
      const type = /Content-Type:\s*([^\r\n]+)/i.exec(headers)?.[1] ?? "application/octet-stream";
      return { type, data: part.subarray(headerEnd + 4) };
    }
    start = next;
  }
  return null;
};

const account = (user: User, token: string) => ({
  id: user.id,
  userInfo: { id: user.id, username: user.username, fullName: user.fullName, roleName: user.role.value },
  tokenInfo: {
    token,
    refreshToken: "",
    expiration: Date.now() + 12 * 3600e3,
    // The role code (P001, P002 or P003): what the app's routes and permission checks gate on.
    roles: [{ access: user.role.code }],
  },
});

const signIn = (user: User) => {
  const token = randomBytes(24).toString("hex");
  tokens.set(token, user.id);
  user.lastSignInAt = new Date().toISOString();
  saveDb();
  return account(user, token);
};

const revokeTokens = (userId: number) => {
  for (const [token, id] of tokens) if (id === userId) tokens.delete(token);
};

const publicSettings = () => ({
  storeName: db.settings.storeName,
  logoUrl: db.settings.logoUrl,
  theme: db.settings.theme,
  customColor: db.settings.customColor,
  mode: db.settings.mode,
  corners: db.settings.corners,
  textSize: db.settings.textSize,
});

// IStaffResponse: never includes the password or PIN.
const toStaff = (u: User) => ({
  id: u.id,
  fullName: u.fullName,
  username: u.username,
  roleCode: u.role.code,
  roleName: u.role.value,
  isActive: u.isActive,
  hasPin: !!u.pin,
  createdAt: u.createdAt,
  lastSignInAt: u.lastSignInAt,
});

const toCategory = (c: Category) => ({
  ...c,
  productCount: db.products.filter((p) => p.categoryId === c.id).length,
});
const toAddOn = (a: AddOn) => ({ ...a, productCount: db.products.filter((p) => p.addOnIds.includes(a.id)).length });
const toProduct = (p: Product) => ({
  ...p,
  categoryName: db.categories.find((c) => c.id === p.categoryId)?.name ?? "No category",
  categoryIcon: db.categories.find((c) => c.id === p.categoryId)?.icon ?? "hot",
});
const nextId = (rows: { id: number }[]) => Math.max(0, ...rows.map((r) => r.id)) + 1;
const money = (value: unknown) => Math.round(Number(value) * 100) / 100;

// Shared checks for product create/update. Returns a message, or null when valid.
const productProblem = (body: Record<string, unknown>, exceptId?: number) => {
  const name = String(body.name ?? "").trim();
  if (!name) return "Enter the product's name.";
  if (name.length > 40) return "Keep the name under 40 characters.";
  if (db.products.some((p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== exceptId))
    return "There's already a product with that name.";
  if (!db.categories.some((c) => c.id === Number(body.categoryId))) return "Choose a category.";
  const sizes = Array.isArray(body.sizes) ? (body.sizes as Size[]) : [];
  if (sizes.length > 4) return "A product can have up to 4 sizes.";
  if (sizes.some((s) => !String(s.name ?? "").trim() || !(Number(s.price) > 0))) return "Every size needs a name and a price.";
  if (!sizes.length && !(Number(body.price) > 0)) return "Enter a price greater than zero.";
  return null;
};
const productFromBody = (body: Record<string, unknown>) => {
  const sizes = (Array.isArray(body.sizes) ? (body.sizes as Size[]) : []).map((s) => ({
    name: String(s.name).trim(),
    price: money(s.price),
  }));
  return {
    name: String(body.name).trim(),
    categoryId: Number(body.categoryId),
    sizes,
    price: sizes.length ? Math.min(...sizes.map((s) => s.price)) : money(body.price),
    addOnIds: (Array.isArray(body.addOnIds) ? (body.addOnIds as number[]) : []).filter((id) =>
      db.addOns.some((a) => a.id === Number(id)),
    ),
    isAvailable: body.isAvailable !== false,
  };
};

// Philippine VAT is included in menu prices. A senior citizen or PWD sale is VAT-exempt
// and gets 20% off the VAT-exempt amount. A store that isn't VAT-registered charges no
// VAT, so the 20% comes off the plain amount. Mirrors computeSaleTotals in the app.
const round2 = (n: number) => Math.round(n * 100) / 100;
const saleTotals = (gross: number, hasDiscount: boolean, vatRegistered: boolean) => {
  if (!vatRegistered) {
    const discountAmount = hasDiscount ? round2(gross * 0.2) : 0;
    return {
      gross,
      vatExemptAmount: 0,
      discountAmount,
      total: round2(gross - discountAmount),
      vatableSales: 0,
      vat: 0,
      vatExemptSales: round2(gross - discountAmount),
    };
  }
  if (hasDiscount) {
    const exempt = gross / 1.12;
    const discountAmount = round2(exempt * 0.2);
    return {
      gross,
      vatExemptAmount: round2(gross - exempt),
      discountAmount,
      total: round2(exempt - exempt * 0.2),
      vatableSales: 0,
      vat: 0,
      vatExemptSales: round2(exempt - exempt * 0.2),
    };
  }
  const vatable = gross / 1.12;
  return {
    gross,
    vatExemptAmount: 0,
    discountAmount: 0,
    total: gross,
    vatableSales: round2(vatable),
    vat: round2(gross - vatable),
    vatExemptSales: 0,
  };
};

// Stores run on Philippine time (UTC+8, no daylight saving): a "day" of sales is a
// Manila calendar day, whatever the server's own time zone is.
const PH_OFFSET_MS = 8 * 3600e3;
const phDate = (iso: string) => new Date(new Date(iso).getTime() + PH_OFFSET_MS).toISOString().slice(0, 10);
const phHour = (iso: string) => new Date(new Date(iso).getTime() + PH_OFFSET_MS).getUTCHours();

// A week of sample sales, so the Sales page has something to show in development.
// Only used while the mock has no sales at all; delete mock/data/db.json to get them back.
const seedSales = (): Sale[] => {
  let seed = 20261105;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
  const sellable = db.products.filter((p) => p.isAvailable);
  const cashiers = db.users.filter((u) => u.role.code === ROLES.cashier.code);
  if (!sellable.length || !cashiers.length) return [];

  const nowPh = new Date(Date.now() + PH_OFFSET_MS);
  const sales: Sale[] = [];
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const day = new Date(Date.UTC(nowPh.getUTCFullYear(), nowPh.getUTCMonth(), nowPh.getUTCDate() - daysAgo));
    const count = 16 + Math.floor(rand() * 18);
    for (let i = 0; i < count; i++) {
      // Busier around breakfast and lunch.
      const hour = pick([7, 7, 8, 8, 8, 9, 10, 11, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
      const at = new Date(day.getTime() + (hour * 60 + Math.floor(rand() * 60)) * 60e3 - PH_OFFSET_MS);
      if (at.getTime() > Date.now()) continue;

      const lines: SaleLine[] = [];
      const itemCount = 1 + Math.floor(rand() * 3);
      for (let j = 0; j < itemCount; j++) {
        const product = pick(sellable);
        const size = product.sizes.length ? pick(product.sizes) : null;
        const addOn = product.addOnIds.length && rand() < 0.25 ? db.addOns.find((a) => a.id === product.addOnIds[0]) : undefined;
        const unitPrice = round2((size ? size.price : product.price) + (addOn?.price ?? 0));
        const qty = rand() < 0.2 ? 2 : 1;
        lines.push({
          productId: product.id,
          name: product.name,
          sizeName: size?.name ?? null,
          addOns: addOn ? [{ id: addOn.id, name: addOn.name, price: addOn.price }] : [],
          note: null,
          unitPrice,
          qty,
          lineTotal: round2(unitPrice * qty),
        });
      }
      const discount =
        rand() < 0.07 ? { kind: rand() < 0.6 ? "sc" : "pwd", name: pick(["Lourdes Ramos", "Rogelio Tan", "Nena Villar"]), idNumber: `DVO-${10000 + Math.floor(rand() * 89999)}` } : null;
      const totals = saleTotals(round2(lines.reduce((s, l) => s + l.lineTotal, 0)), !!discount, db.settings.vatRegistered);
      const roll = rand();
      const method = roll < 0.6 ? "cash" : roll < 0.88 ? "ewallet" : "card";
      const step = pick([50, 100, 500]);
      const tendered = method === "cash" ? Math.ceil(totals.total / step) * step : totals.total;
      const cashier = pick(cashiers);
      sales.push({
        id: 0,
        receiptNumber: "",
        orderNumber: "",
        createdAt: at.toISOString(),
        cashierId: cashier.id,
        cashierName: cashier.fullName,
        orderType: rand() < 0.55 ? "dine_in" : "take_out",
        tableNo: null,
        lines,
        discount,
        totals,
        payment: {
          method,
          tendered,
          change: round2(tendered - totals.total),
          reference: method === "cash" ? null : String(100000000 + Math.floor(rand() * 899999999)),
        },
        status: "completed",
        voidInfo: null,
      });
    }
  }

  // Number them in time order, with order numbers restarting each day.
  sales.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const perDay: Record<string, number> = {};
  sales.forEach((s, i) => {
    const date = phDate(s.createdAt);
    perDay[date] = (perDay[date] ?? 0) + 1;
    s.id = i + 1;
    s.receiptNumber = String(i + 1).padStart(6, "0");
    s.orderNumber = String(perDay[date]).padStart(4, "0");
    if (s.orderType === "dine_in") s.tableNo = String(1 + (i % 12));
  });
  return sales;
};
if (!db.sales.length) db.sales = seedSales();

const sumMoney = (values: number[]) => round2(values.reduce((a, b) => a + b, 0));

const dayFigures = (date: string): DayFigures => {
  const ofDay = db.sales.filter((s) => phDate(s.createdAt) === date).sort((a, b) => a.receiptNumber.localeCompare(b.receiptNumber));
  const sales = ofDay.filter((s) => s.status !== "voided");
  const voided = ofDay.filter((s) => s.status === "voided");
  const discounted = sales.filter((s) => s.discount);
  const byPayment = ["cash", "ewallet", "card"].map((method) => {
    const paid = sales.filter((s) => s.payment.method === method);
    return { method, count: paid.length, total: sumMoney(paid.map((s) => s.totals.total)) };
  });
  return {
    firstReceipt: ofDay[0]?.receiptNumber ?? null,
    lastReceipt: ofDay[ofDay.length - 1]?.receiptNumber ?? null,
    saleCount: sales.length,
    grossSales: sumMoney(sales.map((s) => s.totals.gross)),
    discountCount: discounted.length,
    discountTotal: sumMoney(discounted.map((s) => s.totals.vatExemptAmount + s.totals.discountAmount)),
    netSales: sumMoney(sales.map((s) => s.totals.total)),
    vatableSales: sumMoney(sales.map((s) => s.totals.vatableSales)),
    vat: sumMoney(sales.map((s) => s.totals.vat)),
    vatExemptSales: sumMoney(sales.map((s) => s.totals.vatExemptSales)),
    voidCount: voided.length,
    voidTotal: sumMoney(voided.map((s) => s.totals.total)),
    cashSales: byPayment[0].total,
    byPayment,
  };
};

const isDayClosed = (date: string) => db.dayCloses.some((c) => c.date === date && c.status === "closed");

// The newest closing still in force. Closings are stored in the order they were made.
const latestClosed = () => [...db.dayCloses].reverse().find((c) => c.status === "closed");

// The day to close next: the oldest day with sales that isn't closed, else today.
// Closing in date order keeps the Z numbers and the grand total in order.
const dayToClose = () => {
  const today = phDate(new Date().toISOString());
  const open = [...new Set(db.sales.map((s) => phDate(s.createdAt)))].filter((d) => d < today && !isDayClosed(d)).sort();
  return open[0] ?? today;
};

const buildDayClose = (
  date: string,
  openingFloat: number,
  cashCount: { denomination: number; qty: number }[],
  note: string | null,
  closedByName: string,
  closedAt: string,
): DayClose => {
  const figures = dayFigures(date);
  // A reopened closing is skipped, so its day's sales aren't counted twice.
  const grandTotalBefore = latestClosed()?.grandTotalAfter ?? 0;
  const countedCash = sumMoney(cashCount.map((c) => c.denomination * c.qty));
  const expectedCash = round2(openingFloat + figures.cashSales);
  return {
    id: nextId(db.dayCloses),
    zNumber: String(db.dayCloses.length + 1).padStart(4, "0"),
    date,
    closedAt,
    closedByName,
    figures,
    openingFloat,
    cashCount,
    expectedCash,
    countedCash,
    overShort: round2(countedCash - expectedCash),
    note,
    grandTotalBefore,
    grandTotalAfter: round2(grandTotalBefore + figures.netSales),
    status: "closed",
    reopenInfo: null,
  };
};

// Sample closings for every past day with sales, so only today is open in development.
// Their counts match the expected cash exactly: ₱2,000 float, then the cash sales.
if (!db.dayCloses.length) {
  const today = phDate(new Date().toISOString());
  const owner = db.users.find((u) => u.role.code === ROLES.owner.code);
  [...new Set(db.sales.map((s) => phDate(s.createdAt)))]
    .filter((d) => d < today)
    .sort()
    .forEach((date) => {
      const cash = Math.round((2000 + dayFigures(date).cashSales) * 100);
      // Whole pesos in ₱1 coins and the centavos in 1¢, so the count is exact.
      const cashCount = [
        { denomination: 1, qty: Math.floor(cash / 100) },
        { denomination: 0.01, qty: cash % 100 },
      ].filter((c) => c.qty > 0);
      db.dayCloses.push(buildDayClose(date, 2000, cashCount, null, owner?.fullName ?? "Owner", `${date}T13:30:00.000Z`));
    });
}

// One day's report: the figures the Sales page shows above the receipts list.
// Voided sales are left out of every figure and counted on their own.
const saleSummary = (date: string) => {
  const ofDay = db.sales.filter((s) => phDate(s.createdAt) === date);
  const sales = ofDay.filter((s) => s.status !== "voided");
  const voided = ofDay.filter((s) => s.status === "voided");
  const sum = (values: number[]) => round2(values.reduce((a, b) => a + b, 0));
  const gross = sum(sales.map((s) => s.totals.total));
  const discounted = sales.filter((s) => s.discount);

  const byHour = Array.from({ length: 24 }, (_, hour) => {
    const inHour = sales.filter((s) => phHour(s.createdAt) === hour);
    return { hour, count: inHour.length, total: sum(inHour.map((s) => s.totals.total)) };
  });

  const products: Record<string, { name: string; qty: number; total: number }> = {};
  sales.forEach((s) =>
    s.lines.forEach((l) => {
      const row = (products[l.name] ??= { name: l.name, qty: 0, total: 0 });
      row.qty += l.qty;
      row.total = round2(row.total + l.lineTotal);
    }),
  );

  return {
    date,
    saleCount: sales.length,
    grossSales: gross,
    averageSale: sales.length ? round2(gross / sales.length) : 0,
    itemsSold: sales.reduce((n, s) => n + s.lines.reduce((m, l) => m + l.qty, 0), 0),
    dineInCount: sales.filter((s) => s.orderType === "dine_in").length,
    takeOutCount: sales.filter((s) => s.orderType === "take_out").length,
    discountCount: discounted.length,
    discountTotal: sum(discounted.map((s) => s.totals.vatExemptAmount + s.totals.discountAmount)),
    vatTotal: sum(sales.map((s) => s.totals.vat)),
    voidCount: voided.length,
    voidTotal: sum(voided.map((s) => s.totals.total)),
    byHour,
    byPayment: ["cash", "ewallet", "card"].map((method) => {
      const paid = sales.filter((s) => s.payment.method === method);
      return { method, count: paid.length, total: sum(paid.map((s) => s.totals.total)) };
    }),
    topProducts: Object.values(products)
      .sort((a, b) => b.qty - a.qty || b.total - a.total)
      .slice(0, 8),
  };
};

const PIN_PATTERN = /^\d{4,6}$/;
const pinTaken = (pin: string, exceptId?: number) =>
  db.users.some((u) => u.isActive && u.pin === pin && u.id !== exceptId);
const usernameTaken = (username: string, exceptId?: number) =>
  db.users.some((u) => u.username === username && u.id !== exceptId);

// Who may manage whom: owners manage everyone, managers manage cashiers only.
// Mirrors canManageStaff in the app's utils/roleChecker.ts.
const canManage = (actor: User, target: User) =>
  actor.role.code === ROLES.owner.code || (actor.role.code === ROLES.manager.code && target.role.code === ROLES.cashier.code);

// This PC's addresses on the store's network, for Settings > Devices. The real API keeps
// adapters that have a gateway; Node doesn't report gateways, so this goes by name and drops
// the usual virtual ones (WSL, Hyper-V, VirtualBox), unless nothing else is left.
const VERSION_INFO = { version: "dev", androidAppPath: null };
const VIRTUAL_ADAPTER = /vEthernet|WSL|Hyper-V|VirtualBox|VMware|Docker|Loopback/i;
const serverInfo = (port: number) => {
  const all = Object.entries(networkInterfaces()).flatMap(([adapterName, list]) =>
    (list ?? [])
      .filter((a) => a.family === "IPv4" && !a.internal && !a.address.startsWith("169.254."))
      .map((a) => ({ address: a.address, adapterName, url: `http://${a.address}:${port}` })),
  );
  const real = all.filter((a) => !VIRTUAL_ADAPTER.test(a.adapterName));
  return { ...VERSION_INFO, port, addresses: real.length > 0 ? real : all };
};

export const mockApi = (): Plugin => ({
  name: "amgc-mock-api",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/api", async (req, res) => {
      try {
        const [rawPath, rawQuery] = (req.url ?? "/").split("?");
        const path = rawPath.replace(/\/+$/, "") || "/";
        const query = new URLSearchParams(rawQuery ?? "");
        const method = req.method ?? "GET";
        const raw = await readBody(req);
        const json = () => (raw.length ? JSON.parse(raw.toString()) : {});

        // Public routes
        if (method === "GET" && path === "/store-settings/public") return send(res, 200, publicSettings());
        // The real API reports the installed package's version; yarn dev is always "dev", with no APK.
        if (method === "GET" && path === "/system/version") return send(res, 200, VERSION_INFO);

        if (method === "POST" && path === "/auth/login") {
          const { username, password } = json();
          const user = db.users.find((u) => u.username && u.username === String(username ?? "").trim().toLowerCase());
          // 400, not 401: http_service treats a 401 as "session ended".
          if (!user || user.password !== password) return send(res, 400, { message: "The username or password is incorrect." });
          if (!user.isActive) return send(res, 400, { message: "This account is turned off. Ask the store owner." });
          return send(res, 200, signIn(user));
        }

        if (method === "POST" && path === "/auth/pin") {
          const { pin } = json();
          const user = db.users.find((u) => u.isActive && u.pin && u.pin === String(pin ?? ""));
          if (!user) return send(res, 400, { message: "That PIN doesn't match a cashier." });
          return send(res, 200, signIn(user));
        }

        // Signed-in routes
        const token = /^Bearer (.+)$/.exec(String(req.headers.authorization ?? ""))?.[1];
        const userId = token ? tokens.get(token) : undefined;
        const user = db.users.find((u) => u.id === userId && u.isActive);
        if (!user || !token) return send(res, 401, { message: "Oops, you are not authorize to access this resource" });
        const isManager = user.role.code !== ROLES.cashier.code;

        if (method === "GET" && path === "/account/me") return send(res, 200, account(user, token));

        // System. The port is the one the request came in on: Vite's during yarn dev, the API's when installed.
        if (method === "GET" && path === "/system/server-info") {
          if (!isManager) return send(res, 403, { message: "Only an owner or manager can see the server's addresses." });
          return send(res, 200, serverInfo(req.socket.localPort ?? 5173));
        }

        // Store settings
        if (method === "GET" && path === "/store-settings") return send(res, 200, db.settings);

        if (path.startsWith("/store-settings") && !isManager)
          return send(res, 403, { message: "Only an owner or manager can change store settings." });

        if (method === "PUT" && path === "/store-settings/update") {
          const body = json();
          if (!String(body.storeName ?? "").trim()) return send(res, 400, { message: "Store name is required." });
          if (!["80mm", "58mm"].includes(body.receiptWidth))
            return send(res, 400, { message: "Choose the receipt paper: 80 mm or 58 mm." });
          db.settings = { ...db.settings, ...body, logoUrl: db.settings.logoUrl, updatedAt: new Date().toISOString() };
          saveDb();
          return send(res, 200, db.settings);
        }

        if (method === "POST" && path === "/store-settings/logo") {
          const file = readFilePart(raw, String(req.headers["content-type"] ?? ""));
          if (!file || !file.data.length) return send(res, 400, { message: "Choose an image file to upload." });
          if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return send(res, 400, { message: "Use a PNG, JPG or WebP image." });
          // The real API stores the file and returns its URL; the mock keeps a data URL.
          db.settings = { ...db.settings, logoUrl: `data:${file.type};base64,${file.data.toString("base64")}`, updatedAt: new Date().toISOString() };
          saveDb();
          return send(res, 200, db.settings);
        }

        if (method === "DELETE" && path === "/store-settings/logo") {
          db.settings = { ...db.settings, logoUrl: null, updatedAt: new Date().toISOString() };
          saveDb();
          return send(res, 200, db.settings);
        }

        // Menu: everyone signed in can read it (the register needs it); only owners and managers change it.
        const isMenuRoute = /^\/(category|add-on|product)(\/|$)/.test(path);
        if (isMenuRoute && method !== "GET" && !isManager)
          return send(res, 403, { message: "Only an owner or manager can change the menu." });

        if (method === "GET" && path === "/category/all")
          return send(res, 200, [...db.categories].sort((a, b) => a.sortOrder - b.sortOrder).map(toCategory));

        if (method === "POST" && path === "/category/create") {
          const body = json();
          const name = String(body.name ?? "").trim();
          if (!name) return send(res, 400, { message: "Enter the category's name." });
          if (db.categories.some((c) => c.name.toLowerCase() === name.toLowerCase()))
            return send(res, 400, { message: "There's already a category with that name." });
          const row = { id: nextId(db.categories), name, icon: String(body.icon ?? "hot"), sortOrder: db.categories.length + 1 };
          db.categories.push(row);
          saveDb();
          return send(res, 200, toCategory(row));
        }

        if (method === "PUT" && path === "/category/update") {
          const body = json();
          const row = db.categories.find((c) => c.id === Number(body.id));
          const name = String(body.name ?? "").trim();
          if (!row) return send(res, 404, { message: "That category no longer exists." });
          if (!name) return send(res, 400, { message: "Enter the category's name." });
          if (db.categories.some((c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== row.id))
            return send(res, 400, { message: "There's already a category with that name." });
          Object.assign(row, { name, icon: String(body.icon ?? row.icon) });
          saveDb();
          return send(res, 200, toCategory(row));
        }

        const categoryDelete = /^\/category\/delete\/(\d+)$/.exec(path);
        if (method === "DELETE" && categoryDelete) {
          const id = Number(categoryDelete[1]);
          const used = db.products.filter((p) => p.categoryId === id).length;
          if (used) return send(res, 400, { message: `Move its ${used} product${used > 1 ? "s" : ""} to another category first.` });
          const row = db.categories.find((c) => c.id === id);
          if (!row) return send(res, 404, { message: "That category no longer exists." });
          db.categories = db.categories.filter((c) => c.id !== id);
          saveDb();
          return send(res, 200, toCategory(row));
        }

        if (method === "GET" && path === "/add-on/all")
          return send(res, 200, [...db.addOns].sort((a, b) => a.name.localeCompare(b.name)).map(toAddOn));

        if ((method === "POST" && path === "/add-on/create") || (method === "PUT" && path === "/add-on/update")) {
          const body = json();
          const name = String(body.name ?? "").trim();
          const price = money(body.price);
          if (!name) return send(res, 400, { message: "Enter the add-on's name." });
          if (!(price >= 0)) return send(res, 400, { message: "Enter a price. Use 0 if it's free." });
          const existing = path.endsWith("update") ? db.addOns.find((a) => a.id === Number(body.id)) : undefined;
          if (path.endsWith("update") && !existing) return send(res, 404, { message: "That add-on no longer exists." });
          if (db.addOns.some((a) => a.name.toLowerCase() === name.toLowerCase() && a.id !== existing?.id))
            return send(res, 400, { message: "There's already an add-on with that name." });
          const row = existing ?? { id: nextId(db.addOns), name, price };
          Object.assign(row, { name, price });
          if (!existing) db.addOns.push(row);
          saveDb();
          return send(res, 200, toAddOn(row));
        }

        const addOnDelete = /^\/add-on\/delete\/(\d+)$/.exec(path);
        if (method === "DELETE" && addOnDelete) {
          const id = Number(addOnDelete[1]);
          const row = db.addOns.find((a) => a.id === id);
          if (!row) return send(res, 404, { message: "That add-on no longer exists." });
          // Deleting an add-on takes it off every product that offered it.
          db.products.forEach((p) => (p.addOnIds = p.addOnIds.filter((x) => x !== id)));
          db.addOns = db.addOns.filter((a) => a.id !== id);
          saveDb();
          return send(res, 200, toAddOn(row));
        }

        // The register's whole menu in one call, in menu order, sold-out items included.
        if (method === "GET" && path === "/product/all") {
          const catOrder = (p: Product) => db.categories.find((c) => c.id === p.categoryId)?.sortOrder ?? 99;
          return send(res, 200, [...db.products].sort((a, b) => catOrder(a) - catOrder(b) || a.id - b.id).map(toProduct));
        }

        // A completed sale. The server re-prices every line from the menu, so what the
        // register shows can't change what is charged, then numbers the receipt.
        if (method === "POST" && path === "/sale/create") {
          const body = json();
          const lines = Array.isArray(body.lines) ? body.lines : [];
          // After the Z reading, today's sales are final.
          if (isDayClosed(phDate(new Date().toISOString())))
            return send(res, 400, { message: "Today is already closed (Z reading done). Sales start again tomorrow." });
          if (!lines.length) return send(res, 400, { message: "The order is empty." });

          const priced: SaleLine[] = [];
          for (const line of lines) {
            const product = db.products.find((p) => p.id === Number(line.productId));
            if (!product) return send(res, 400, { message: "An item in the order was removed from the menu. Take it off and try again." });
            if (!product.isAvailable) return send(res, 400, { message: `${product.name} is sold out. Take it off the order.` });
            const size = line.sizeName ? product.sizes.find((s) => s.name === line.sizeName) : null;
            if (product.sizes.length && !size) return send(res, 400, { message: `Choose a size for ${product.name}.` });
            const addOns = (Array.isArray(line.addOnIds) ? line.addOnIds : [])
              .map((id: number) => db.addOns.find((a) => a.id === Number(id) && product.addOnIds.includes(a.id)))
              .filter(Boolean) as AddOn[];
            const qty = Math.max(1, Math.min(99, Math.floor(Number(line.qty) || 1)));
            const unitPrice = round2((size ? size.price : product.price) + addOns.reduce((s, a) => s + a.price, 0));
            priced.push({
              productId: product.id,
              name: product.name,
              sizeName: size?.name ?? null,
              addOns: addOns.map((a) => ({ id: a.id, name: a.name, price: a.price })),
              note: String(line.note ?? "").trim().slice(0, 80) || null,
              unitPrice,
              qty,
              lineTotal: round2(unitPrice * qty),
            });
          }

          const discount = body.discount
            ? { kind: String(body.discount.kind), name: String(body.discount.name ?? "").trim(), idNumber: String(body.discount.idNumber ?? "").trim() }
            : null;
          if (discount && (!discount.name || !discount.idNumber))
            return send(res, 400, { message: "A senior citizen or PWD discount needs the name and ID number on the card." });

          const gross = round2(priced.reduce((s, l) => s + l.lineTotal, 0));
          const totals = saleTotals(gross, !!discount, db.settings.vatRegistered);
          const payMethod = String(body.payment?.method ?? "cash");
          const tendered = payMethod === "cash" ? round2(Number(body.payment?.tendered)) : totals.total;
          if (payMethod === "cash" && !(tendered >= totals.total))
            return send(res, 400, { message: `Cash received is short. The total is ₱${totals.total.toFixed(2)}.` });

          const sale: Sale = {
            id: nextId(db.sales),
            receiptNumber: String(Math.max(0, ...db.sales.map((s) => Number(s.receiptNumber))) + 1).padStart(6, "0"),
            // Order numbers start again at 0001 each day.
            orderNumber: String(db.sales.filter((s) => phDate(s.createdAt) === phDate(new Date().toISOString())).length + 1).padStart(4, "0"),
            createdAt: new Date().toISOString(),
            cashierId: user.id,
            cashierName: user.fullName,
            orderType: body.orderType === "take_out" ? "take_out" : "dine_in",
            tableNo: body.orderType === "take_out" ? null : String(body.tableNo ?? "").trim() || null,
            lines: priced,
            discount,
            totals,
            payment: {
              method: payMethod,
              tendered,
              change: round2(tendered - totals.total),
              reference: String(body.payment?.reference ?? "").trim() || null,
            },
            status: "completed",
            voidInfo: null,
          };
          db.sales.push(sale);
          saveDb();
          return send(res, 200, sale);
        }

        // Voids a whole sale: it stays on record, marked void, and leaves the day's totals.
        // An owner or manager approves their own void. A cashier may void only their own
        // sale from today, and an owner or manager signs off with their username and password.
        if (method === "POST" && path === "/sale/void") {
          const body = json();
          const sale = db.sales.find((s) => s.id === Number(body.id));
          if (!sale) return send(res, 404, { message: "That sale no longer exists." });
          if (sale.status === "voided") return send(res, 400, { message: "This sale is already void." });
          if (isDayClosed(phDate(sale.createdAt)))
            return send(res, 400, { message: "That day is closed (Z reading done), so its sales can't be voided." });
          const reason = String(body.reason ?? "").trim();
          if (reason.length < 3) return send(res, 400, { message: "Say why the sale is being voided." });

          let approver: User = user;
          if (!isManager) {
            if (sale.cashierId !== user.id || phDate(sale.createdAt) !== phDate(new Date().toISOString()))
              return send(res, 403, { message: "A cashier can only void their own sales from today." });
            const username = String(body.approver?.username ?? "").trim().toLowerCase();
            const found = db.users.find((u) => u.username && u.username === username);
            // 400, not 401: http_service treats a 401 as "session ended".
            if (!found || found.password !== body.approver?.password)
              return send(res, 400, { message: "The approver's username or password is incorrect." });
            if (!found.isActive || found.role.code === ROLES.cashier.code)
              return send(res, 400, { message: "Only an owner or manager can approve a void." });
            approver = found;
          }

          sale.status = "voided";
          sale.voidInfo = {
            reason: reason.slice(0, 200),
            voidedAt: new Date().toISOString(),
            voidedByName: user.fullName,
            approvedByName: approver.fullName,
          };
          saveDb();
          return send(res, 200, sale);
        }

        // Sales reports: owners and managers only.
        if (method === "GET" && /^\/sale(\/|$)/.test(path) && !isManager)
          return send(res, 403, { message: "Only an owner or manager can see sales." });

        const todayPh = phDate(new Date().toISOString());
        const dateParam = /^\d{4}-\d{2}-\d{2}$/.test(query.get("date") ?? "") ? String(query.get("date")) : todayPh;

        if (method === "GET" && path === "/sale/summary") return send(res, 200, saleSummary(dateParam));

        if (method === "GET" && path === "/sale") {
          const search = (query.get("search") ?? "").trim().toLowerCase();
          const paymentMethod = query.get("paymentMethod");
          const pageNumber = Math.max(1, Number(query.get("pageNumber") ?? 1));
          const pageSize = Math.max(1, Number(query.get("pageSize") ?? 10));
          const [sortKey, sortOrder] = (query.get("sort") ?? "createdAt_descend").split("_");

          let list = db.sales.filter(
            (s) =>
              phDate(s.createdAt) === dateParam &&
              (!paymentMethod || s.payment.method === paymentMethod) &&
              (!search ||
                s.receiptNumber.includes(search) ||
                s.orderNumber.includes(search) ||
                s.cashierName.toLowerCase().includes(search) ||
                s.lines.some((l) => l.name.toLowerCase().includes(search))),
          );
          list = list.sort((a, b) =>
            sortKey === "total" ? a.totals.total - b.totals.total : a.createdAt.localeCompare(b.createdAt),
          );
          if (sortOrder === "descend") list.reverse();

          return send(res, 200, {
            data: list.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
            pageSize,
            currentPage: pageNumber,
            totalPages: Math.max(1, Math.ceil(list.length / pageSize)),
            totalCount: list.length,
          });
        }

        // Whether today is closed, for the Register. Everyone signed in can ask.
        if (method === "GET" && path === "/day-close/today") {
          const close = db.dayCloses.find((c) => c.date === todayPh && c.status === "closed");
          return send(res, 200, {
            date: todayPh,
            isClosed: !!close,
            zNumber: close?.zNumber ?? null,
            closedAt: close?.closedAt ?? null,
            closedByName: close?.closedByName ?? null,
          });
        }

        // Closing the day (Z reading): owners and managers only.
        if (/^\/day-close(\/|$)/.test(path) && !isManager)
          return send(res, 403, { message: "Only an owner or manager can close the day." });

        // The day due to be closed: its figures so far, or its Z reading once it's closed.
        if (method === "GET" && path === "/day-close/current") {
          const date = dayToClose();
          const close = db.dayCloses.find((c) => c.date === date && c.status === "closed") ?? null;
          const last = db.dayCloses[db.dayCloses.length - 1];
          return send(res, 200, {
            date,
            isToday: date === todayPh,
            close,
            figures: close?.figures ?? dayFigures(date),
            // Most stores start each day with the same float.
            suggestedFloat: last?.openingFloat ?? 0,
            // Only this closing can be reopened.
            latestCloseId: latestClosed()?.id ?? null,
          });
        }

        if (method === "POST" && path === "/day-close/create") {
          const body = json();
          const date = String(body.date ?? "");
          const due = dayToClose();
          if (isDayClosed(date)) return send(res, 400, { message: "That day is already closed." });
          if (date !== due) return send(res, 400, { message: `Close ${due} first. Days close in order.` });
          const openingFloat = money(body.openingFloat);
          if (!(openingFloat >= 0)) return send(res, 400, { message: "Enter the starting cash. Use 0 if there was none." });
          const cashCount = (Array.isArray(body.cashCount) ? body.cashCount : [])
            .map((c: { denomination?: unknown; qty?: unknown }) => ({
              denomination: money(c.denomination),
              qty: Math.max(0, Math.floor(Number(c.qty) || 0)),
            }))
            .filter((c: { denomination: number; qty: number }) => c.denomination > 0 && c.qty > 0);
          const note = String(body.note ?? "").trim().slice(0, 200) || null;
          const close = buildDayClose(date, openingFloat, cashCount, note, user.fullName, new Date().toISOString());
          db.dayCloses.push(close);
          saveDb();
          return send(res, 200, close);
        }

        // Reopens the latest closing, for a day closed by mistake. Owner only, with a reason.
        // The Z reading stays on record, marked reopened; closing again saves a new one.
        if (method === "POST" && path === "/day-close/reopen") {
          if (user.role.code !== ROLES.owner.code) return send(res, 403, { message: "Only the owner can reopen a day." });
          const body = json();
          const close = db.dayCloses.find((c) => c.id === Number(body.id));
          if (!close) return send(res, 404, { message: "That Z reading no longer exists." });
          if (close.status !== "closed") return send(res, 400, { message: "That day is already reopened." });
          if (close.id !== latestClosed()?.id)
            return send(res, 400, { message: "Only the latest closed day can be reopened." });
          const reason = String(body.reason ?? "").trim();
          if (reason.length < 3) return send(res, 400, { message: "Say why the day is being reopened." });
          close.status = "reopened";
          close.reopenInfo = { reason: reason.slice(0, 200), reopenedAt: new Date().toISOString(), reopenedByName: user.fullName };
          saveDb();
          return send(res, 200, close);
        }

        if (method === "GET" && path === "/day-close") {
          const pageNumber = Math.max(1, Number(query.get("pageNumber") ?? 1));
          const pageSize = Math.max(1, Number(query.get("pageSize") ?? 10));
          // Newest day first. A reopened day has two closings; the newer one (higher Z) leads.
          const list = [...db.dayCloses].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
          return send(res, 200, {
            data: list.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
            pageSize,
            currentPage: pageNumber,
            totalPages: Math.max(1, Math.ceil(list.length / pageSize)),
            totalCount: list.length,
          });
        }

        if (method === "GET" && path === "/product") {
          const search = (query.get("search") ?? "").trim().toLowerCase();
          const categoryId = Number(query.get("categoryId") ?? 0);
          const availability = query.get("availability") ?? "all";
          const pageNumber = Math.max(1, Number(query.get("pageNumber") ?? 1));
          const pageSize = Math.max(1, Number(query.get("pageSize") ?? 10));
          const [sortKey, sortOrder] = (query.get("sort") ?? "").split("_");

          let list = db.products.filter(
            (p) =>
              (!search || p.name.toLowerCase().includes(search)) &&
              (!categoryId || p.categoryId === categoryId) &&
              (availability === "all" || (availability === "available" ? p.isAvailable : !p.isAvailable)),
          );
          // Default order: the menu's category order, then the order products were added.
          const catOrder = (p: Product) => db.categories.find((c) => c.id === p.categoryId)?.sortOrder ?? 99;
          list = list.sort((a, b) =>
            sortKey === "name"
              ? a.name.localeCompare(b.name)
              : sortKey === "price"
                ? a.price - b.price
                : catOrder(a) - catOrder(b) || a.id - b.id,
          );
          if (sortOrder === "descend") list.reverse();

          return send(res, 200, {
            data: list.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map(toProduct),
            pageSize,
            currentPage: pageNumber,
            totalPages: Math.max(1, Math.ceil(list.length / pageSize)),
            totalCount: list.length,
          });
        }

        if (method === "POST" && path === "/product/create") {
          const body = json();
          const problem = productProblem(body);
          if (problem) return send(res, 400, { message: problem });
          const row: Product = { id: nextId(db.products), photoUrl: null, updatedAt: new Date().toISOString(), ...productFromBody(body) };
          db.products.push(row);
          saveDb();
          return send(res, 200, toProduct(row));
        }

        if (method === "PUT" && path === "/product/update") {
          const body = json();
          const row = db.products.find((p) => p.id === Number(body.id));
          if (!row) return send(res, 404, { message: "That product no longer exists." });
          const problem = productProblem(body, row.id);
          if (problem) return send(res, 400, { message: problem });
          Object.assign(row, productFromBody(body), { updatedAt: new Date().toISOString() });
          saveDb();
          return send(res, 200, toProduct(row));
        }

        if (method === "PUT" && path === "/product/set-available") {
          const body = json();
          const row = db.products.find((p) => p.id === Number(body.id));
          if (!row) return send(res, 404, { message: "That product no longer exists." });
          row.isAvailable = !!body.isAvailable;
          row.updatedAt = new Date().toISOString();
          saveDb();
          return send(res, 200, toProduct(row));
        }

        const productDelete = /^\/product\/delete\/(\d+)$/.exec(path);
        if (method === "DELETE" && productDelete) {
          const row = db.products.find((p) => p.id === Number(productDelete[1]));
          if (!row) return send(res, 404, { message: "That product no longer exists." });
          db.products = db.products.filter((p) => p.id !== row.id);
          saveDb();
          return send(res, 200, toProduct(row));
        }

        const productPhoto = /^\/product\/(\d+)\/photo$/.exec(path);
        if (productPhoto && (method === "POST" || method === "DELETE")) {
          const row = db.products.find((p) => p.id === Number(productPhoto[1]));
          if (!row) return send(res, 404, { message: "That product no longer exists." });
          if (method === "POST") {
            const file = readFilePart(raw, String(req.headers["content-type"] ?? ""));
            if (!file || !file.data.length) return send(res, 400, { message: "Choose an image file to upload." });
            if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return send(res, 400, { message: "Use a PNG, JPG or WebP image." });
            row.photoUrl = `data:${file.type};base64,${file.data.toString("base64")}`;
          } else row.photoUrl = null;
          row.updatedAt = new Date().toISOString();
          saveDb();
          return send(res, 200, toProduct(row));
        }

        // Staff
        if (path.startsWith("/staff") && !isManager) return send(res, 403, { message: "Only an owner or manager can manage staff." });

        if (method === "GET" && path === "/staff") {
          const search = (query.get("search") ?? "").trim().toLowerCase();
          const status = query.get("status") ?? "active";
          const roleCode = query.get("roleCode");
          const [sortKey, sortOrder] = (query.get("sort") ?? "fullName_ascend").split("_");
          const pageNumber = Math.max(1, Number(query.get("pageNumber") ?? 1));
          const pageSize = Math.max(1, Number(query.get("pageSize") ?? 10));

          let list = db.users.filter(
            (u) =>
              (status === "all" || (status === "active" ? u.isActive : !u.isActive)) &&
              (!roleCode || u.role.code === roleCode) &&
              (!search || u.fullName.toLowerCase().includes(search) || (u.username ?? "").includes(search)),
          );
          const key = (sortKey === "lastSignInAt" ? "lastSignInAt" : "fullName") as "fullName" | "lastSignInAt";
          list = list.sort((a, b) => String(a[key] ?? "").localeCompare(String(b[key] ?? "")));
          if (sortOrder === "descend") list.reverse();

          return send(res, 200, {
            data: list.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map(toStaff),
            pageSize,
            currentPage: pageNumber,
            totalPages: Math.max(1, Math.ceil(list.length / pageSize)),
            totalCount: list.length,
          });
        }

        if (method === "POST" && path === "/staff/create") {
          const body = json();
          const role = roleByCode(String(body.roleCode ?? ""));
          const fullName = String(body.fullName ?? "").trim();
          if (!fullName) return send(res, 400, { message: "Enter the person's name." });
          if (!role || role.code === ROLES.owner.code) return send(res, 400, { message: "Choose Manager or Cashier." });
          if (role.code === ROLES.manager.code && user.role.code !== ROLES.owner.code)
            return send(res, 403, { message: "Only the owner can add a manager." });

          const next: User = {
            id: Math.max(0, ...db.users.map((u) => u.id)) + 1,
            fullName,
            role,
            username: null,
            password: null,
            pin: null,
            isActive: true,
            createdAt: new Date().toISOString(),
            lastSignInAt: null,
          };
          if (role.code === ROLES.cashier.code) {
            const pin = String(body.pin ?? "");
            if (!PIN_PATTERN.test(pin)) return send(res, 400, { message: "A PIN is 4 to 6 digits." });
            if (pinTaken(pin)) return send(res, 400, { message: "Another cashier already uses that PIN. Choose a different one." });
            next.pin = pin;
          } else {
            const username = String(body.username ?? "").trim().toLowerCase();
            const password = String(body.password ?? "");
            if (!/^[a-z0-9._-]{3,30}$/.test(username))
              return send(res, 400, { message: "A username is 3 to 30 letters, numbers, dots, dashes or underscores." });
            if (usernameTaken(username)) return send(res, 400, { message: "That username is taken." });
            if (password.length < 8) return send(res, 400, { message: "A password is at least 8 characters." });
            next.username = username;
            next.password = password;
          }
          db.users.push(next);
          saveDb();
          return send(res, 200, toStaff(next));
        }

        // The remaining staff routes act on one existing person.
        const body = method === "PUT" ? json() : {};
        const target = db.users.find((u) => u.id === Number(body.id));
        if (path.startsWith("/staff/") && method === "PUT") {
          if (!target) return send(res, 404, { message: "That person no longer exists." });
          if (!canManage(user, target)) return send(res, 403, { message: "Only the owner can change an owner's or manager's account." });
        }

        if (method === "PUT" && path === "/staff/update" && target) {
          const fullName = String(body.fullName ?? "").trim();
          if (!fullName) return send(res, 400, { message: "Enter the person's name." });
          if (target.username !== null) {
            const username = String(body.username ?? "").trim().toLowerCase();
            if (!/^[a-z0-9._-]{3,30}$/.test(username))
              return send(res, 400, { message: "A username is 3 to 30 letters, numbers, dots, dashes or underscores." });
            if (usernameTaken(username, target.id)) return send(res, 400, { message: "That username is taken." });
            target.username = username;
          }
          target.fullName = fullName;
          saveDb();
          return send(res, 200, toStaff(target));
        }

        if (method === "PUT" && path === "/staff/reset-pin" && target) {
          const pin = String(body.pin ?? "");
          if (target.role.code !== ROLES.cashier.code) return send(res, 400, { message: "Only cashiers sign in with a PIN." });
          if (!PIN_PATTERN.test(pin)) return send(res, 400, { message: "A PIN is 4 to 6 digits." });
          if (pinTaken(pin, target.id)) return send(res, 400, { message: "Another cashier already uses that PIN. Choose a different one." });
          target.pin = pin;
          revokeTokens(target.id);
          saveDb();
          return send(res, 200, toStaff(target));
        }

        if (method === "PUT" && path === "/staff/reset-password" && target) {
          const password = String(body.password ?? "");
          if (target.role.code === ROLES.cashier.code) return send(res, 400, { message: "Cashiers sign in with a PIN, not a password." });
          if (password.length < 8) return send(res, 400, { message: "A password is at least 8 characters." });
          target.password = password;
          if (target.id !== user.id) revokeTokens(target.id);
          saveDb();
          return send(res, 200, toStaff(target));
        }

        if (method === "PUT" && path === "/staff/set-active" && target) {
          if (target.id === user.id) return send(res, 400, { message: "You can't turn off your own account." });
          if (target.role.code === ROLES.owner.code) return send(res, 400, { message: "The owner's account can't be turned off." });
          const isActive = !!body.isActive;
          if (isActive && target.pin && pinTaken(target.pin, target.id))
            return send(res, 400, { message: "Another cashier now uses this person's PIN. Reset their PIN first." });
          target.isActive = isActive;
          if (!isActive) revokeTokens(target.id);
          saveDb();
          return send(res, 200, toStaff(target));
        }

        return send(res, 404, { message: `No mock for ${method} ${path}.` });
      } catch (error) {
        return send(res, 500, { message: error instanceof Error ? error.message : "Mock API error." });
      }
    });
  },
});
