import { Alert, Button, Card, Col, Result, Row, Skeleton } from "antd";
import { CloseDayIcon, ReopenIcon } from "../../assets/icons/Icons";
import CashCountForm from "../../components/close-day/CashCountForm";
import DayCloseTable from "../../components/close-day/DayCloseTable";
import DayFigures from "../../components/close-day/DayFigures";
import ListSectionTitle from "../../components/common/ListSectionTitle";
import PageHeader from "../../components/common/PageHeader";
import { useCloseDayHook } from "../../hooks/close-day/close-day.hook";
import { formatLongDate, formatTime } from "../../utils/date.util";

// End of day: the day's figures, the cash count, and the Z reading. A closed day's sales
// are final, so the page always shows the one day that's due: an earlier day that wasn't
// closed, otherwise today.
const CloseDay = () => {
  const day = useCloseDayHook();
  const current = day.current;

  return (
    <div>
      <PageHeader
        icon={CloseDayIcon}
        title="Close the day"
        description={
          current
            ? `${formatLongDate(current.date)}${current.isToday ? " (today)" : ""}.${
                current.close ? "" : " Count the drawer, then close the day to save its Z reading."
              }`
            : undefined
        }
      />

      {day.isLoading || !current ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : current.close ? (
        <Card>
          <Result
            status="success"
            title={`${formatLongDate(current.date)} is closed`}
            subTitle={`Z reading ${current.close.zNumber}, closed at ${formatTime(current.close.closedAt)} by ${current.close.closedByName}. Sales start again tomorrow.`}
            extra={
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="primary" size="large" onClick={() => current.close && day.openZReading(current.close)}>
                  View the Z reading
                </Button>
                {/* Owner only, for a day closed by mistake. */}
                {day.canReopenCurrent && (
                  <Button size="large" danger icon={<ReopenIcon size={18} />} onClick={() => current.close && day.openReopen(current.close)}>
                    Reopen the day
                  </Button>
                )}
              </div>
            }
          />
        </Card>
      ) : (
        <>
          {!current.isToday && (
            <Alert
              type="warning"
              showIcon
              className="!mb-5"
              title={`${formatLongDate(current.date)} was never closed`}
              description="Close it first. Days close in order so the Z readings stay numbered by day. Today comes next."
            />
          )}
          <Row gutter={[20, 20]}>
            <Col xs={24} xl={13}>
              <DayFigures figures={current.figures} vatRegistered={day.vatRegistered} />
            </Col>
            <Col xs={24} xl={11}>
              <CashCountForm
                form={day.form}
                counts={day.counts}
                cashSales={current.figures.cashSales}
                expectedCash={day.expectedCash}
                countedCash={day.countedCash}
                overShort={day.overShort}
                isToday={current.isToday}
                isClosing={day.isClosing}
                onFinish={day.handleSubmit}
              />
            </Col>
          </Row>
        </>
      )}

      <div className="mt-5 rounded-2xl bg-[var(--amgc-bg-surface)] p-5 md:p-6">
        <div className="mb-4">
          <ListSectionTitle label="Past closings" count={day.closeListQuery.data?.totalCount ?? 0} />
        </div>
        <DayCloseTable
          listLoading={day.closeListQuery.isFetching}
          closeDataList={!day.closeListQuery.isError ? day.closeListQuery.data : undefined}
          onTableChange={day.onTableChange}
          onOpen={day.openZReading}
        />
      </div>
    </div>
  );
};

export default CloseDay;
