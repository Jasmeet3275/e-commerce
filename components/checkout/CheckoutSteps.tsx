import { cn } from "@/lib/cn";

const STEPS = ["Address", "Payment", "Confirmation"] as const;

export type CheckoutStepsProps = {
  current: 1 | 2 | 3;
};

export function CheckoutSteps({ current }: CheckoutStepsProps) {
  return (
    <ol className="mb-6 flex items-center gap-2">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === current;
        const isDone = stepNumber < current;

        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                isActive && "bg-brand-600 text-white",
                isDone && "bg-brand-100 text-brand-700",
                !isActive && !isDone && "bg-neutral-100 text-neutral-500",
              )}
            >
              {stepNumber}
            </span>
            <span
              className={cn(
                "text-sm",
                isActive ? "font-medium text-neutral-900" : "text-neutral-500",
              )}
            >
              {label}
            </span>
            {stepNumber < STEPS.length && <span className="mx-1 text-neutral-300">—</span>}
          </li>
        );
      })}
    </ol>
  );
}
