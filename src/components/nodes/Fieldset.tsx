import { forwardRef, useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FieldsetProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  titleAdornment?: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
};

const Fieldset = forwardRef<HTMLElement, FieldsetProps>(
  ({
    title,
    description,
    children,
    titleAdornment,
    actions,
    className,
    contentClassName,
  }, ref) => {
    const headingId = useId();
    const descriptionId = description ? `${headingId}-description` : undefined;

    return ( 
      <section
        ref={ref}
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        className={cn("rounded-2xl border border-border bg-card/80 p-4 shadow-sm md:p-6", className)}
      >
        <div className="mb-4 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-ink-strong">
              {titleAdornment}
              <h3 id={headingId} className="text-title-md leading-title-md">
                {title}
              </h3>
            </div>
            {actions}
          </div>
          {description && (
            <p id={descriptionId} className="text-body-md text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className={cn("space-y-4", contentClassName)}>{children}</div>
      </section>
    );
  },
);

Fieldset.displayName = "Fieldset";

export default Fieldset;
