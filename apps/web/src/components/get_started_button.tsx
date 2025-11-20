import Link from "next/link";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	href?: string;
	className?: string;
}

export const GetStartedButton = ({
	children,
	href = "/",
	className,
	style,
	...props
}: ButtonProps) => {
	return (
		<Link href={href} passHref>
			<button
				type="button"
				className={[
					"text-white bg-linear-to-r from-blue-600 via-blue-500 to-blue-400 box-border border border-transparent hover:from-blue-700 hover:to-blue-500 hover:via-blue-600 focus:ring-4 focus:ring-blue-300 shadow-md font-semibold leading-5 rounded-lg text-base px-6 py-3 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none cursor-pointer",
					className,
				]
					.filter(Boolean)
					.join(" ")}
				style={style}
				{...props}
			>
				{children}
			</button>
		</Link>
	);
};
