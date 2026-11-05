import RegisterMenu from "../../components/register/RegisterMenu";
import RegisterShortcutBar from "../../components/register/RegisterShortcutBar";
import RegisterTicket from "../../components/register/RegisterTicket";
import { useRegisterHook } from "../../hooks/register/register.hook";

const Register = () => {
  const r = useRegisterHook();
  const { register } = r;

  return (
    <div className="amgc-register">
      <div className="amgc-register__main">
        <RegisterMenu
          searchRef={r.searchRef}
          gridRef={r.gridRef}
          search={register.search}
          onSearchChange={register.setSearch}
          categories={r.categories}
          categoryId={register.categoryId}
          onCategoryChange={register.setCategoryId}
          products={r.visibleProducts}
          totalProducts={r.products.length}
          isLoading={r.isLoadingMenu}
          highlight={register.highlight}
          qtyByProduct={r.qtyByProduct}
          onAdd={r.addProduct}
        />
        <RegisterShortcutBar />
      </div>

      <RegisterTicket
        lines={register.lines}
        itemCount={r.itemCount}
        orderType={register.orderType}
        onOrderTypeChange={register.setOrderType}
        tableNo={register.tableNo}
        onTableNoChange={register.setTableNo}
        selectedKey={register.selectedKey}
        flashKey={register.flashKey}
        onSelect={register.setSelectedKey}
        onChangeQty={register.changeQty}
        onRemove={register.removeLine}
        discount={register.discount}
        onDiscount={r.openDiscount}
        totals={r.totals}
        vatRegistered={r.vatRegistered}
        onCharge={r.openPayment}
        onClear={r.askClearOrder}
      />
    </div>
  );
};

export default Register;
