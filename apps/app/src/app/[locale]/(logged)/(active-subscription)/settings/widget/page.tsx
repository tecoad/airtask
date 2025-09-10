import { fetchGoggleFontFamilyList } from '@/lib/settings/helpers';
import { WidgetForm } from './widget-form';

export default async function SettingsAppearancePage() {
	const fontsNameList = await fetchGoggleFontFamilyList();

	return <WidgetForm fontsNameList={fontsNameList} />;
}
