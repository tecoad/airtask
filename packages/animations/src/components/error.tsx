import Lottie from 'lottie-react';
import animation404 from '../animations/404Animation.json';

type Props = {
	width: string;
};

export const ErrorAnimation = ({ width }: Props) => {
	//@ts-ignore
	return <Lottie style={{ width }} animationData={animation404} loop={true} />;
};
