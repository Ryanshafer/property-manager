import { Fragment, type ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  onOpenSidebar?: () => void;
};

const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const PageHeader = ({ title, description, breadcrumbs, actions, onOpenSidebar }: PageHeaderProps) => (
  <div className="border-b border-border bg-background/95 px-4 py-4 shadow-sm backdrop-blur md:px-8">
    <div className="flex items-center gap-4">
      {onOpenSidebar && (
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground shadow-sm md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      <div className="flex flex-1 flex-col gap-3">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <Fragment key={`${crumb.label}-${index}`}>
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink
                        className="text-ink-strong"
                        href={`${basePath}${crumb.href.startsWith("/") ? crumb.href : `/${crumb.href}`}`}
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <span className="text-ink-muted">{crumb.label}</span>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <div>
          <h1 className="text-display-lg leading-tight tracking-tight text-ink-strong">{title}</h1>
          {description && <p className="text-body-md text-ink-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className={cn("flex items-center gap-2", "max-md:hidden")}>{actions}</div>}
    </div>
    {actions && <div className="mt-4 flex gap-2 md:hidden">{actions}</div>}
  </div>
);

export default PageHeader;
