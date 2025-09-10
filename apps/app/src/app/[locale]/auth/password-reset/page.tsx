import { useTranslations } from 'next-intl';
import { Title } from '../components/title';
import { TopButton } from '../components/top-button';
import { Wrapper } from '../components/wrapper';
import { Forms } from './forms';

const Page = () => {
	const t = useTranslations('auth');

	return (
		<>
			<TopButton href="login" title={t('login.title')} />

			<Wrapper>
				<Title
					title={t('passwordReset.title')}
					subtitle={t('passwordReset.description')}
				/>
				<Forms />
			</Wrapper>
		</>
	);
};

export default Page;
