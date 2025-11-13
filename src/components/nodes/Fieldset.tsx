import type { ReactNode } from "react";

const Fieldset = ({
  title,
  description,
  children,
  titleAdornment,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  titleAdornment?: ReactNode;
  actions?: ReactNode;
}) => (
  <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm md:p-6">
    <div className="mb-4 space-y-1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {titleAdornment}
          <h3 className="text-title-md leading-title-md text-ink-strong">{title}</h3>
        </div>
        {actions}
      </div>
      {description && <p className="text-body-md text-muted-foreground">{description}</p>}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

export default Fieldset;
