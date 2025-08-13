"use client";

import { ChevronRight } from "lucide-react";
import {
  createContext,
  PropsWithChildren,
  use,
  useMemo,
  useState,
} from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type SlideDirection =
  | "leftToRight"
  | "rightToLeft"
  | "BottomToTop"
  | "topToBottom";

type SlideToggleContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slideDirection: SlideDirection;
};

const SlideToggleContext = createContext<SlideToggleContextValue>({
  open: false,
  onOpenChange: () => {},
  slideDirection: "rightToLeft",
});

const useSlideToggle = () => {
  const slideToggleActions = use(SlideToggleContext);
  if (!slideToggleActions) {
    throw Error("Please wrap with SlideToggleRoot component");
  }
  return slideToggleActions;
};

interface SlideToggleRootProps extends Partial<SlideToggleContextValue> {
  defaultOpen?: boolean;
  className?: string;
}

export const SlideToggleRoot = ({
  defaultOpen = false,
  onOpenChange,
  open,
  className,
  children,
  slideDirection = "rightToLeft",
}: PropsWithChildren<SlideToggleRootProps>) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const providerValues: SlideToggleContextValue = useMemo(
    () => ({
      open: open ?? isOpen,
      onOpenChange: onOpenChange ?? setIsOpen,
      slideDirection,
    }),
    [isOpen, onOpenChange, open, slideDirection]
  );

  const isSlideBottomOrTop =
    slideDirection === "BottomToTop" || slideDirection === "topToBottom";

  return (
    <SlideToggleContext.Provider value={providerValues}>
      <div
        className={cn(
          "flex justify-start items-center gap-2 h-fit w-fit ",
          isSlideBottomOrTop && "flex-col",
          className
        )}
      >
        {children}
      </div>
    </SlideToggleContext.Provider>
  );
};

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

type SlideToggleTriggerProps = Omit<ButtonProps, "onClick"> & {
  tooltip?: string;
};

export const SlideToggleTrigger = ({
  className,
  children,
  size = "icon",
  variant,
  tooltip,
  ...other
}: SlideToggleTriggerProps) => {
  const { onOpenChange, open, slideDirection } = useSlideToggle();

  const haveTooltip = !!tooltip && !!tooltip.trim();
  const icon = useMemo(() => {
    return (
      <ChevronRight
        className={cn(
          "size-5 transition-transform duration-300 ease-in-out rotate-0",
          open && {
            "rotate-180": slideDirection === "rightToLeft",
            "-rotate-180": slideDirection === "leftToRight",
            "rotate-90": slideDirection === "topToBottom",
            "-rotate-90": slideDirection === "BottomToTop",
          }
        )}
      />
    );
  }, [open, slideDirection]);

  const button = useMemo(
    () => (
      <Button
        aria-expanded={open}
        aria-controls={slideDirection}
        className={cn(
          " flex-shrink-0 shadow-sm transition-[width] duration-500 ease-in-out",
          className
        )}
        data-state={open}
        size={size}
        variant={variant ?? open ? "default" : "outline"}
        onClick={() => onOpenChange(!open)}
        {...other}
      >
        {children ? children : icon}
      </Button>
    ),
    [
      children,
      className,
      onOpenChange,
      open,
      other,
      size,
      slideDirection,
      variant,
      icon,
    ]
  );

  if (!haveTooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent data-state={open}>{tooltip}</TooltipContent>
    </Tooltip>
  );
};

interface SlideToggleContentProps {
  className?: string;
}

export const SlideToggleContent = ({
  className,
  children,
}: PropsWithChildren<SlideToggleContentProps>) => {
  const { open, slideDirection } = useSlideToggle();

  return (
    <div
      data-direction={slideDirection}
      data-state={open}
      className={cn(
        "flex overflow-hidden transition-all duration-500 ease-in-out w-0 h-0",
        // Direction-based layout
        slideDirection === "leftToRight" || slideDirection === "rightToLeft"
          ? "items-center space-x-1"
          : "flex-col space-y-1",
        // OPEN: scale in + visible
        open && {
          "opacity-100 scale-100 translate-x-0 translate-y-0 w-full h-full":
            true,
        },
        // CLOSED: scaled down + faded out + moved
        !open && {
          "opacity-0 scale-x-0 translate-x-full":
            slideDirection === "rightToLeft",
          "opacity-0 scale-x-0 -translate-x-full":
            slideDirection === "leftToRight",
          "opacity-0 scale-y-0 -translate-y-full":
            slideDirection === "topToBottom",
          "opacity-0 scale-y-0 translate-y-full":
            slideDirection === "BottomToTop",
        }
      )}
    >
      <div
        className={cn(
          "flex items-center p-2 space-x-1",
          (slideDirection === "topToBottom" ||
            slideDirection === "BottomToTop") &&
            "flex-col space-y-1",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
