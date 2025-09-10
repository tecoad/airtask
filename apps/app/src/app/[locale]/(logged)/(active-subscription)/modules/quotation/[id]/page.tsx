import { redirect } from 'next/navigation';

export type Props = {
	params: { id: string };
};

export default function Page({ params }: Props) {
	redirect(`${params.id}/overview`);
}
