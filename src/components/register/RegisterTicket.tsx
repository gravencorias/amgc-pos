import { Button, Empty, Input, Segmented, Typography } from "antd";
import { CloseIcon, DiscountIcon, LockIcon, MinusIcon, PlusIcon } from "../../assets/icons/Icons";
import { DiscountKindEnum, discountKindLabel, OrderTypeEnum, orderTypeLabel } from "../../enums/sale.enum";
import type { ICartLine } from "../../models/register/register.model";
import type { ISaleDiscountRequest } from "../../models/sale/sale.request.model";
import type { ISaleTotals } from "../../models/sale/sale.response.model";
import { peso } from "../../utils/sale.util";
import ProductArt from "../product/ProductArt";

const { Text } = Typography;

interface IProps {
  lines: ICartLine[];
  itemCount: number;
  orderType: OrderTypeEnum;
  onOrderTypeChange: (orderType: OrderTypeEnum) => void;
  tableNo: string;
  onTableNoChange: (tableNo: string) => void;
  selectedKey: string | null;
  flashKey: string | null;
  onSelect: (key: string) => void;
  onChangeQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  discount: ISaleDiscountRequest | null;
  onDiscount: () => void;
  totals: ISaleTotals;
  vatRegistered: boolean;
  // Set once today's Z reading is done: says so, and turns off Charge.
  dayClosedNote: string | null;
  onCharge: () => void;
  onClear: () => void;
}

const lineMeta = (l: ICartLine) =>
  [l.sizeName, ...l.addOns.map((a) => a.name), l.note ? `"${l.note}"` : null, l.qty > 1 ? `${peso(l.unitPrice)} each` : null]
    .filter(Boolean)
    .join(", ");

const RegisterTicket = ({
  lines,
  itemCount,
  orderType,
  onOrderTypeChange,
  tableNo,
  onTableNoChange,
  selectedKey,
  flashKey,
  onSelect,
  onChangeQty,
  onRemove,
  discount,
  onDiscount,
  totals,
  vatRegistered,
  dayClosedNote,
  onCharge,
  onClear,
}: IProps) => (
  <aside className="amgc-register__ticket" aria-label="Current order">
    <div className="amgc-ticket__head">
      <div className="flex items-baseline justify-between gap-3">
        <Text className="!text-[20px] font-semibold">New order</Text>
        <Text className="tabular-nums !text-[var(--amgc-text-muted)]">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </Text>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented<OrderTypeEnum>
          value={orderType}
          onChange={onOrderTypeChange}
          options={[OrderTypeEnum.dineIn, OrderTypeEnum.takeOut].map((value) => ({
            value,
            label: orderTypeLabel[value],
          }))}
        />
        {orderType === OrderTypeEnum.dineIn ? (
          <Input
            className="!w-[110px]"
            prefix={<Text className="!text-[var(--amgc-text-muted)]">Table</Text>}
            value={tableNo}
            maxLength={4}
            inputMode="numeric"
            aria-label="Table number"
            onChange={(e) => onTableNoChange(e.target.value)}
          />
        ) : (
          <Text className="!text-xs !text-[var(--amgc-text-muted)]">
            <kbd className="amgc-kbd">F8</kbd> switches
          </Text>
        )}
      </div>
    </div>

    {lines.length ? (
      <ol className="amgc-ticket__lines">
        {lines.map((l) => (
          <li
            key={l.key}
            className={`amgc-ticket__line ${selectedKey === l.key ? "is-selected" : ""} ${flashKey === l.key ? "is-flash" : ""}`}
            onClick={() => onSelect(l.key)}
          >
            <ProductArt photoUrl={l.photoUrl} icon={l.categoryIcon} name={l.name} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <Text strong className="truncate">
                  {l.name}
                </Text>
                <Text strong className="shrink-0 tabular-nums">
                  {peso(l.unitPrice * l.qty)}
                </Text>
              </div>
              {lineMeta(l) && <Text className="block !text-xs !text-[var(--amgc-text-muted)]">{lineMeta(l)}</Text>}
              <div className="mt-1 flex items-center justify-between">
                <div className="amgc-qty" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="small"
                    type="text"
                    aria-label={`One less ${l.name}`}
                    icon={<MinusIcon size={14} />}
                    onClick={() => onChangeQty(l.key, -1)}
                  />
                  <span className="tabular-nums">{l.qty}</span>
                  <Button
                    size="small"
                    type="text"
                    aria-label={`One more ${l.name}`}
                    icon={<PlusIcon size={14} />}
                    onClick={() => onChangeQty(l.key, 1)}
                  />
                </div>
                <Button
                  size="small"
                  type="text"
                  className="amgc-ticket__remove"
                  aria-label={`Remove ${l.name}`}
                  icon={<CloseIcon size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(l.key);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ol>
    ) : (
      <Empty
        className="amgc-ticket__empty"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <>
            <span className="amgc-touch-hide">No items yet. Click a product, or type its name and press Enter.</span>
            <span className="amgc-touch-only">No items yet. Tap a product to add it.</span>
          </>
        }
      />
    )}

    <div className="amgc-ticket__foot">
      <button type="button" className={`amgc-ticket__discount ${discount ? "is-on" : ""}`} onClick={onDiscount}>
        <DiscountIcon size={16} />
        <span className="min-w-0 flex-1 truncate">
          {discount
            ? `${discountKindLabel[discount.kind as DiscountKindEnum]}: ${discount.name}, ID ${discount.idNumber}`
            : "Senior citizen or PWD discount"}
        </span>
        <kbd className="amgc-kbd">F4</kbd>
      </button>

      <dl className="amgc-ticket__sums">
        <dt>Subtotal</dt>
        <dd>{peso(totals.gross)}</dd>
        {discount ? (
          <>
            {vatRegistered && (
              <>
                <dt>Less VAT (12%)</dt>
                <dd className="is-less">−{peso(totals.vatExemptAmount)}</dd>
              </>
            )}
            <dt>{discount.kind === DiscountKindEnum.pwd ? "PWD" : "Senior citizen"} discount (20%)</dt>
            <dd className="is-less">−{peso(totals.discountAmount)}</dd>
          </>
        ) : vatRegistered ? (
          <>
            <dt>VATable sales</dt>
            <dd>{peso(totals.vatableSales)}</dd>
            <dt>VAT (12%)</dt>
            <dd>{peso(totals.vat)}</dd>
          </>
        ) : null}
      </dl>

      {/* Once the day is closed, this takes the Charge button's place at the same size, so
          the ticket's layout doesn't change. */}
      {dayClosedNote ? (
        <div className="amgc-charge amgc-charge--closed" role="status">
          <LockIcon size={22} className="shrink-0" />
          <span className="amgc-charge__label">
            Closed for today
            <span className="amgc-charge__note">{dayClosedNote}</span>
          </span>
        </div>
      ) : (
        <button type="button" className="amgc-charge" disabled={!lines.length} onClick={onCharge}>
          <span className="amgc-charge__label">
            Charge <kbd className="amgc-kbd">F9</kbd>
          </span>
          <span className="amgc-charge__total tabular-nums">{peso(totals.total)}</span>
        </button>
      )}

      {lines.length > 0 && (
        <Button type="text" size="small" className="self-center" onClick={onClear}>
          Clear order <kbd className="amgc-kbd !ml-1">Del</kbd>
        </Button>
      )}
    </div>
  </aside>
);

export default RegisterTicket;
