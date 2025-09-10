import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';
import { Button, ButtonProps } from './ui/button';

type Props = { loading?: boolean } & ButtonProps;

export const CustomButton = forwardRef<HTMLButtonElement, Props>(
	({ loading, children, className, ...rest }, ref) => {
		const classes = `leading-4 ${className}`;
		return (
			<Button
				type="button"
				className={classes}
				{...rest}
				ref={ref}
				disabled={loading || rest.disabled}>
				{loading ? <Loader2 className=" h-4 w-4 animate-spin" /> : children}
			</Button>
		);
	},
);
