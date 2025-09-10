import moment from 'moment';
import 'moment/locale/pt-br';
import { useLocale } from 'next-intl';
import { ReactNode } from 'react';

type Props = {
	date: Date;
	mode: 'formatted and relative' | 'formatted' | 'relative';
	prepend?: ReactNode;
};

export const MomentDate = ({ date, mode, prepend }: Props) => {
	const locale = useLocale();
	const m = moment(date).locale(locale);

	const formatted = m.format('llll');
	const relative = m.fromNow();

	return (
		<>
			{prepend}
			{mode === 'formatted and relative'
				? `${formatted} (${relative})`
				: mode === 'formatted'
				  ? formatted
				  : relative}
		</>
	);
};
