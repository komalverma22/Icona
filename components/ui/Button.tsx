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
  /** "lg" is a taller 44px button with 14px text, for hero calls to action. */
  size?: "md" | "lg";
  pressed?: boolean;
  children: ReactNode;
}

const rootClass = (iconOnly?: boolean, className?: string, size?: "md" | "lg") =>
  cx(
    "group/btn relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[8px] transition-transform duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60",
    iconOnly ? "size-8" : size === "lg" ? "h-11 gap-2 px-6" : "h-8 gap-1.5 px-3",
    className,
  );

/**
 * Figma button anatomy: the visible surface is an inset "Background" layer.
 *  - raised : soft warm-grey surface with hairline border (blue icon chips go inside)
 *  - accent : dark #1D1F23 button, white-15% gradient, black 1.5px stroke, 0/4/7 drop shadow, white label
 */
function ButtonInner({ variant = "raised", size, pressed, children }: Omit<SharedProps, "iconOnly">) {
  return (
    <>
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute",
          variant === "accent"
            ? "inset-[0.5px] rounded-[7.5px] surface-accent shadow-accent transition-[filter] duration-150 group-hover/btn:brightness-125"
            : "inset-0 rounded-[8px] border border-black/10 surface-raised shadow-button",
          pressed && variant === "raised" && "ring-1 ring-accent-ring",
        )}
      />
      <span
        className={cx(
          "relative inline-flex items-center justify-center gap-2 leading-normal font-medium",
          size === "lg" ? "text-[14px]" : "text-[12px]",
          variant === "accent" ? "text-white [text-shadow:0px_4px_4px_rgba(0,0,0,0.4)]" : "text-ink",
        )}
      >
        {children}
      </span>
    </>
  );
}

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, iconOnly, size, pressed, className, children, type = "button", ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-pressed={pressed} className={rootClass(iconOnly, className, size)} {...rest}>
      <ButtonInner variant={variant} size={size} pressed={pressed}>
        {children}
      </ButtonInner>
    </button>
  );
});

type ButtonLinkProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement>;

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant, iconOnly, size, pressed, className, children, ...rest },
  ref,
) {
  return (
    <a ref={ref} className={rootClass(iconOnly, className, size)} {...rest}>
      <ButtonInner variant={variant} size={size} pressed={pressed}>
        {children}
      </ButtonInner>
    </a>
  );
});
