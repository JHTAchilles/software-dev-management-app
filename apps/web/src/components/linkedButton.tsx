import Link from "next/link";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  href?: string;
  className?: string;
}

export const LinkedButton = ({
  children,
  href = "/",
  className,
}: ButtonProps) => {
  return (
    <Link href={href} passHref>
      <button
        type="button"
        className={[
          "box-border transform cursor-pointer rounded-lg bg-[#6daeed] py-1.5 duration-200 ease-in-out hover:scale-103 dark:bg-[#274581]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </button>
    </Link>
  );
};
