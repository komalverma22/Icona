import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";

/** Join class names, skipping falsy values. */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type Variant = "raised" | "accent";

interface SharedProps {
  variant?: Variant;
  /** Square 32 × 32 icon button (Figma nav icon buttons). */
  iconOnly?: boolean;
  pressed?: boolean;
  children: ReactNode;
}

const rootClass = (iconOnly?: boolean, className?: string) =>
  cx(
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[10px] transition-transform duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60",
    iconOnly ? "size-8" : "h-8 gap-1.5 px-3",
    className,
  );

/**
 * Figma button anatomy: the visible surface is an inset "Background" layer.
 *  - raised : white gradient surface with hairline + soft stacked shadow
 *  - accent : green Login surface with tinted shadow and white label
 */
function ButtonInner({ variant = "raised", pressed, children }: Omit<SharedProps, "iconOnly">) {
  return (
    <>
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute",
          variant === "accent"
            ? "inset-[1px_0_0_1px] rounded-[7.5px] surface-accent shadow-accent"
            : "inset-[0.5px] rounded-[9.5px] surface-raised shadow-button",
          pressed && variant === "raised" && "ring-1 ring-accent-ring",
        )}
      />
      <span
        className={cx(
          "relative inline-flex items-center justify-center gap-1.5 text-[12px] leading-normal font-medium",
          variant === "accent" ? "text-white [text-shadow:0px_0.5px_0px_rgba(10,10,11,0.15)]" : "text-ink",
        )}
      >
        {children}
      </span>
    </>
  );
}

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, iconOnly, pressed, className, children, type = "button", ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-pressed={pressed} className={rootClass(iconOnly, className)} {...rest}>
      <ButtonInner variant={variant} pressed={pressed}>
        {children}
      </ButtonInner>
    </button>
  );
});

type ButtonLinkProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement>;

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant, iconOnly, pressed, className, children, ...rest },
  ref,
) {
  return (
    <a ref={ref} className={rootClass(iconOnly, className)} {...rest}>
      <ButtonInner variant={variant} pressed={pressed}>
        {children}
      </ButtonInner>
    </a>
  );
});
