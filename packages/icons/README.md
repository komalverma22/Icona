# @icona/icons

Icona icons as React components - static, animated and pixel-art.

```bash
pnpm add @icona/icons      # or: npm install @icona/icons / yarn add @icona/icons
```

```tsx
import { HeartIcon, HeartFillIcon } from "@icona/icons";
import { HeartHeartbeatIcon } from "@icona/icons/animated";

<HeartIcon size={32} color="#e11d48" />
<HeartHeartbeatIcon animate="loop" />   // "hover" (default) | "loop" | "none"
```

- **Static icons** live in the root import. Outline is the default style (`HeartIcon`); `…FillIcon` is the filled one.
- **Animated icons** live in `@icona/icons/animated`, named `<Icon><Animation>Icon` (for example `CartDriveOffIcon`).
  The animation is plain CSS, so there is no animation library. Some animations also draw canvas
  particles; those components start with `"use client"`.
- Props: `size`, `color` (defaults to `currentColor`), `strokeWidth`, and for animated icons `speed` and `animate`.
  Everything else goes to the `<svg>`.
- Tree-shakeable ESM with TypeScript types. Needs React 18 or newer.
- Animations honour `prefers-reduced-motion`.

Browse every icon, preview animations and copy code at the Icona site. The names there match the names here.
