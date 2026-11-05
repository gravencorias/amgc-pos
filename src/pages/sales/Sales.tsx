import { Button, Col, DatePicker, Input, Row, Select, Typography } from "antd";
import dayjs from "dayjs";
import { NextIcon, PreviousIcon, SalesIcon } from "../../assets/icons/Icons";
import ListSectionTitle from "../../components/common/ListSectionTitle";
import PageHeader from "../../components/common/PageHeader";
import PaymentMixCard from "../../components/sales/PaymentMixCard";
import SaleReceiptView from "../../components/sales/SaleReceiptView";
import SalesByHourChart from "../../components/sales/SalesByHourChart";
import SalesStats from "../../components/sales/SalesStats";
import SalesTable from "../../components/sales/SalesTable";
import TopSellersCard from "../../components/sales/TopSellersCard";
import { PaymentMethodEnum, paymentMethodLabel } from "../../enums/sale.enum";
import { useSalesHook } from "../../hooks/sales/sales.hook";
import type { ISaleResponse } from "../../models/sale/sale.response.model";
import { formatLongDate } from "../../utils/date.util";

const { Text } = Typography;

const Sales = () => {
  const sales = useSalesHook();

  const openReceipt = (record: ISaleResponse) => {
    sales.setViewingSale(record);
    sales.showModal({
      properties: {
        open: true,
        centered: true,
        width: 440,
        title: <Text className="!text-[20px] font-semibold">Receipt {record.receiptNumber}</Text>,
      },
      body: <SaleReceiptView key={record.id} />,
    });
  };

  return (
    <div>
      <PageHeader
        icon={SalesIcon}
        title={sales.isToday ? "Today's sales" : "Sales"}
        description={
          sales.isToday ? `${formatLongDate(sales.salesDate)} · ${sales.currentTime}` : formatLongDate(sales.salesDate)
        }
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={sales.onPreviousDay} aria-label="Previous day" icon={<PreviousIcon size={16} />} />
            <DatePicker
              value={dayjs(sales.salesDate)}
              onChange={sales.onDateChange}
              disabledDate={sales.isFutureDate}
              allowClear={false}
              format="MMM D, YYYY"
              aria-label="Day to report on"
            />
            <Button
              onClick={sales.onNextDay}
              disabled={sales.isToday}
              aria-label="Next day"
              icon={<NextIcon size={16} />}
            />
            {!sales.isToday && <Button onClick={sales.onToday}>Today</Button>}
          </div>
        }
      />

      <SalesStats summary={sales.summary} isLoading={sales.isLoadingSummary} />

      {sales.summary && (
        <Row gutter={[20, 20]} className="mt-5">
          <Col xs={24} xxl={12}>
            <SalesByHourChart byHour={sales.summary.byHour} />
          </Col>
          <Col xs={24} md={12} xxl={6}>
            <PaymentMixCard byPayment={sales.summary.byPayment} grossSales={sales.summary.grossSales} />
          </Col>
          <Col xs={24} md={12} xxl={6}>
            <TopSellersCard topProducts={sales.summary.topProducts} />
          </Col>
        </Row>
      )}

      <div className="mt-5 rounded-2xl bg-[var(--amgc-bg-surface)] p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <ListSectionTitle label="Receipts" count={sales.saleListQuery.data?.totalCount ?? 0} />
          <div className="flex flex-wrap items-center gap-2">
            <Select<PaymentMethodEnum>
              allowClear
              placeholder="Any payment"
              className="min-w-[150px]"
              value={sales.salesPagination.paymentMethod}
              onChange={sales.onPaymentChange}
              options={Object.values(PaymentMethodEnum).map((value) => ({ value, label: paymentMethodLabel[value] }))}
            />
            <Input.Search
              allowClear
              placeholder="Receipt, cashier or item"
              className="!w-[240px]"
              onChange={(e) => sales.onSearch(e.currentTarget.value)}
            />
          </div>
        </div>
        <Text className="mb-3 block !text-sm !text-[var(--amgc-text-muted)]">Click a receipt to see it or reprint it.</Text>
        <SalesTable
          listLoading={sales.saleListQuery.isFetching}
          saleDataList={!sales.saleListQuery.isError ? sales.saleListQuery.data : undefined}
          onTableChange={sales.onTableChange}
          onOpen={openReceipt}
        />
      </div>
    </div>
  );
};

export default Sales;
