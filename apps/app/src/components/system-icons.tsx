type IconProps = React.HTMLAttributes<SVGElement>;

interface CustomIconProps extends IconProps {
	strokeWidth?: string;
}

export const Icons = {
	calendar: ({ strokeWidth = '1.8', ...props }: CustomIconProps) => (
		<svg role="img" viewBox="0 0 24 24" fill="none" {...props}>
			<path
				d="M8.27759 3V6"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M17.2776 3V6"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M3.77759 9.5H21.7776"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M18.7776 4.5H6.77759C5.12073 4.5 3.77759 5.84315 3.77759 7.5V18C3.77759 19.6569 5.12073 21 6.77759 21H18.7776C20.4344 21 21.7776 19.6569 21.7776 18V7.5C21.7776 5.84315 20.4344 4.5 18.7776 4.5Z"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	),
	dashboard: ({ strokeWidth = '1.8', ...props }: CustomIconProps) => (
		<svg role="img" viewBox="0 0 24 24" {...props}>
			<path
				d="M20.9213 14.9971C20.303 16.7515 19.1556 18.2709 17.6372 19.3457C16.1189 20.4205 14.3045 20.9977 12.4443 20.9977C10.5841 20.9977 8.76966 20.4205 7.25134 19.3457C5.73302 18.2709 4.58558 16.7515 3.96729 14.9971"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M21.4443 12C21.4443 9.61305 20.4961 7.32387 18.8083 5.63604C17.1205 3.94821 14.8313 3 12.4443 3C10.0574 3 7.7682 3.94821 6.08037 5.63604C4.39255 7.32387 3.44434 9.61305 3.44434 12"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M3.44434 12H4.94434"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M19.9443 12H21.4443"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M14.7575 9.03885L11.626 10.3283C11.3356 10.4479 11.0793 10.6373 10.8797 10.8797C10.6801 11.1221 10.5434 11.4101 10.4819 11.718C10.4203 12.0259 10.4357 12.3443 10.5267 12.6448C10.6177 12.9454 10.7815 13.2188 11.0035 13.4409V13.4409C11.2255 13.6629 11.499 13.8267 11.7995 13.9177C12.1001 14.0087 12.4184 14.0241 12.7263 13.9625C13.0343 13.9009 13.3222 13.7643 13.5646 13.5647C13.8071 13.3651 13.9965 13.1087 14.116 12.8184L15.4055 9.68683C15.4428 9.59621 15.4525 9.49658 15.4333 9.40049C15.414 9.3044 15.3668 9.21615 15.2975 9.14685C15.2282 9.07756 15.14 9.03033 15.0439 9.01111C14.9478 8.99189 14.8481 9.00154 14.7575 9.03885Z"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M6.08032 5.63599L7.14102 6.69669"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12.4443 3V4.5"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M18.8084 5.63599L17.7477 6.69669"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	),
	help: ({ strokeWidth = '1.8', ...props }: CustomIconProps) => (
		<svg role="img" viewBox="0 0 24 24" {...props}>
			<path
				d="M12 13.5V12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M11.9937 15.075C11.4967 15.075 11.0938 15.4779 11.0938 15.975C11.0938 16.472 11.4967 16.875 11.9937 16.875C12.4908 16.875 12.8937 16.472 12.8937 15.975C12.8937 15.4779 12.4908 15.075 11.9937 15.075Z"
				fill="currentColor"
			/>
		</svg>
	),
	home: ({ strokeWidth = '1.8', ...props }: CustomIconProps) => (
		<svg role="img" viewBox="0 0 24 24" {...props}>
			<path
				d="M12.0833 13H12.5833C13.3126 13 14.0121 13.2897 14.5278 13.8055C15.0435 14.3212 15.3333 15.0207 15.3333 15.75V21H9.33325V15.75C9.33325 15.0207 9.62298 14.3212 10.1387 13.8055C10.6544 13.2897 11.3539 13 12.0833 13Z"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M3.33325 18V10.9597C3.33325 10.2849 3.48504 9.61863 3.77738 9.01038C4.06972 8.40212 4.49513 7.8674 5.0221 7.44582L9.20975 4.09568C10.0963 3.38641 11.1979 3 12.3333 3C13.4686 3 14.5702 3.38641 15.4568 4.09568L19.6444 7.44581C20.1714 7.86739 20.5968 8.40211 20.8891 9.01036C21.1815 9.61862 21.3333 10.2848 21.3333 10.9597V18C21.3333 18.7957 21.0172 19.5587 20.4546 20.1213C19.892 20.6839 19.1289 21 18.3333 21H6.33325C5.5376 21 4.77454 20.6839 4.21193 20.1213C3.64932 19.5587 3.33325 18.7957 3.33325 18Z"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	),
	links: ({ strokeWidth = '1.8', ...props }: CustomIconProps) => (
		<svg role="img" viewBox="0 0 24 24" {...props}>
			<path
				d="M8.66394 10.1142C9.70547 11.1557 9.70547 12.8443 8.66394 13.8859C7.62241 14.9274 5.93376 14.9274 4.89223 13.8859C3.8507 12.8443 3.8507 11.1557 4.89223 10.1142C5.93376 9.07263 7.62241 9.07263 8.66394 10.1142"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M19.33 4.78115C20.3715 5.82268 20.3715 7.51133 19.33 8.55286C18.2884 9.59439 16.5998 9.59439 15.5582 8.55286C14.5167 7.51133 14.5167 5.82268 15.5582 4.78115C16.5998 3.73962 18.2884 3.73962 19.33 4.78115"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M19.33 15.4472C20.3715 16.4887 20.3715 18.1773 19.33 19.2189C18.2884 20.2604 16.5998 20.2604 15.5582 19.2189C14.5167 18.1773 14.5167 16.4887 15.5582 15.4472C16.5998 14.4056 18.2884 14.4056 19.33 15.4472"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M9.15112 10.8101L15.0711 7.8501"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M9.15112 13.1899L15.0711 16.1499"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	),
	google: ({ strokeWidth = '1.8', ...props }: CustomIconProps) => (
		<svg role="img" viewBox="0 0 24 24" {...props}></svg>
	),
};
