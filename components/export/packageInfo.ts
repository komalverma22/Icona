/**
 * The npm package built by `npm run build:icons` (packages/icons).
 *
 * The Install tab only offers the package once it has really been published -
 * set `published` to true after `npm publish` (and change `name` if you
 * publish under a different scope).
 */
export const PACKAGE = { name: "@icona/icons", published: false } as const;

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

export const installCommandFor = (manager: PackageManager) =>
  ({ pnpm: "pnpm add", npm: "npm install", yarn: "yarn add", bun: "bun add" })[manager] + ` ${PACKAGE.name}`;

/** Import path for a component: static icons from the root, animated ones from the /animated entry. */
export const importPath = (animated: boolean) => (animated ? `${PACKAGE.name}/animated` : PACKAGE.name);
