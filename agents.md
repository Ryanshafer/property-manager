# Agent Guidelines

This document captures the working rules for automated or command-line assistants operating in this repository.

## Component Restrictions
- Never modify files within `src/components/ui`. These shadcn/ui primitives must remain byte-for-byte identical to the upstream source so they can be upgraded safely.
- Always check to see if a shadcn/ui primitive exists before attemptiong to add a new one.

## Figma Access
- Always fetch the referenced design nodes through the Figma MCP server before beginning UI work.
- If a Figma request fails due to authentication or rate limiting (e.g., “You’ve hit your rate limit”), immediately stop the prompt, report the issue to the user, and wait for explicit direction before resuming.

## Tailwind & Styling
- Respect the design tokens defined in `src/styles/global.css`; prefer the semantic utilities (`text-display-lg`, `bg-ink-strong`, etc.) over hard-coded values when building new UI. If new styles exist in Figma, create a new design token to match.
- Avoid attaching additional utility classes directly to shadcn/ui components (`<Button>`, `<Label>`, etc.) unless explicitly instructed to override them; rely on their built-in variants and the shared design tokens instead.
- Map spacing in Figma to the nearest native Tailwind spacing utility (margin, padding, gap) whenever possible. Create a custom token in `src/styles/global.css` only when the design value falls outside Tailwind’s scale.

## Icon Usage
- When implementing a icon, try to map from the Figma file shared to the icon within the Lucide icon library installed in this application.

## Layout Usage
- Default pages should render through `src/layouts/BaseLayout.astro`. Only disable the header/footer via props when the design explicitly calls for a blank canvas.

## Build Validation
- After structural changes (new components, layout updates, or page additions), run `npm run build` to confirm Astro + Vite compilation succeeds.

## Feature Organization
- House new domain logic inside `src/features/<feature>/` using a `components/` + `hooks/` structure; reserve `src/components/examples` only for temporary throwaway code.
- Prefer lightweight barrel files (e.g. `src/features/comments/index.ts`) to expose feature APIs so pages import via feature entry points instead of deep relative paths. Make sure each React istand has clean props and minimal Astro-specific code.

## Mock Data Setup
- When planning your prototype, if mock data is needed to make the app functional and data-driven: Create a dedicated JSON file for the mock data. Store all mock data files in the /data/ directory. Structure the data to closely resemble the expected response format of the real API (field names, nesting, data types, etc.). This ensures easy replacement with real data in the future and keeps the prototype consistent and realistic.

## Interaction & Accessibility
- When dialogs or async flows use timers or subscriptions, always clean them up on unmount and wire cancel buttons through the relevant Radix `DialogClose` primitives.
- Only move keyboard focus when a view actually changes state (e.g. collapsing/expanding cards) to avoid disrupting screen reader users.
- Select widths and spacing using Tailwind’s tokenized utilities (`max-w-3xl`, `w-56`, etc.) instead of ad-hoc pixel values once components graduate from prototypes.

Please append to this file as new conventions are established.
