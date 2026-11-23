import type { DashboardProps } from "./Dashboard.types";
import {
  dashboardZoneNames,
  validateDashboardLayout,
} from "./internal/dashboard-layout";
import { EmptyState } from "./EmptyState";
export type * from "./Dashboard.types";
export {
  moveDashboardItem,
  restoreDashboardLayout,
  serializeDashboardLayout,
} from "./internal/dashboard-layout";

/** Responsive layout without visual reordering: DOM, keyboard and reading order stay aligned. */
export function Dashboard({
  widgets,
  value,
  renderWidget,
  children,
  className = "",
}: DashboardProps) {
  validateDashboardLayout(widgets, value);
  return (
    <div className={`sui-dashboard flex min-w-0 flex-col gap-4 ${className}`}>
      {(["summary", "analysis"] as const).map((zone) => {
        const entries = value.filter((item) => item.zone === zone);
        return (
          <section
            key={zone}
            aria-label={`${dashboardZoneNames[zone]} widgets`}
            className="flex min-w-0 flex-col gap-4"
          >
            <h3 className="text-sui-heading-xs">{dashboardZoneNames[zone]}</h3>
            {entries.length ? (
              <div className="sui-dashboard-grid">
                {entries.map((item) => (
                  <div
                    key={item.id}
                    data-dashboard-widget={item.id}
                    data-size={item.size}
                    className="sui-dashboard-slot"
                  >
                    {renderWidget(
                      widgets.find((widget) => widget.id === item.id)!,
                      item,
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                variant="subtle"
                title="No widgets in this zone"
                description="Customize your dashboard to add a widget."
              />
            )}
          </section>
        );
      })}
      {children}
    </div>
  );
}
