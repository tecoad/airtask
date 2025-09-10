'use client';

import { CustomButton } from '@/components/custom-button';
import { MomentDate } from '@/components/moment-date';
import { TitledAvatarFallback } from '@/components/titled-avatar';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CONSTANTS } from '@/core/config/constants';
import { useFetchQuotationRequest } from '@/lib';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QuestionsTree } from './components/questions-tree';
import { ToggleChecked } from './components/toggle-checked';

export default function Page() {
	const router = useRouter();
	const { isLoading: skeletonMode, data, setData } = useFetchQuotationRequest();

	const t = useTranslations('quotation.requests');

	// TODO
	if (!skeletonMode && !data) return <p>{t('notFound')}</p>;

	return (
		<div className="flex flex-col gap-0">
			<div className="flex flex-row items-start items-center gap-4">
				<CustomButton
					variant="outline"
					onClick={router.back}
					size="icon"
					className="flex flex-row gap-2 rounded-b-none  rounded-t-lg border-b-0 ">
					<ArrowLeft />
					{/* <span>Voltar</span> */}
				</CustomButton>
				<span className={`text-foreground ${skeletonMode ? 'is-skeleton' : ''}`}>
					{t('title')} #{skeletonMode ? '123' : data?.sequential_id}
				</span>
			</div>
			<div className="overflow-hidden rounded-xl rounded-tl-none border">
				<div
					className={`grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] gap-3 p-4 transition-colors ${
						data?.checked_at ? 'bg-gradient-to-tl from-green-500/10  to-green-500/20' : ''
					}`}>
					<div className="col-start-1 row-start-1 ">
						<Avatar className=" h-14 w-14 shrink-0">
							<TitledAvatarFallback
								className={`highlight-white/30 bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500 text-white transition-colors ${
									data?.checked_at && 'from-blue-400 via-blue-300 to-blue-500'
								}
              ${skeletonMode && 'is-skeleton'}
              `}
								title={`${data?.conversation.recipient?.first_name} ${data?.conversation.recipient?.last_name}`}
							/>
						</Avatar>
					</div>
					<div className="col-start-2 row-start-1 flex flex-col items-start justify-center  gap-1">
						<span
							className={`text-foreground text-lg font-semibold leading-none ${
								skeletonMode && 'is-skeleton'
							}`}>
							{skeletonMode
								? 'some-recipient firstname'
								: `${data?.conversation.recipient?.first_name} ${data?.conversation.recipient?.last_name}`}
						</span>
						<Link
							href={CONSTANTS.email_redirect_by_email(
								data?.conversation.recipient?.email!,
							)}>
							<span className={`text-base leading-none ${skeletonMode && 'is-skeleton'}`}>
								{skeletonMode
									? 'some-recipient-email'
									: data?.conversation.recipient?.email}
							</span>
						</Link>
					</div>
					<div className="col-start-2 row-start-2 ">
						<Link
							href={CONSTANTS.whatsapp_redirect_by_number(
								data?.conversation.recipient?.phone!,
							)}
							target="_blank">
							<span className={`text-base ${skeletonMode && 'is-skeleton'}`}>
								{skeletonMode ? '31991400910' : data?.conversation.recipient?.phone}
							</span>
						</Link>
					</div>
					<div className="text-foreground/80 col-start-3 row-start-2">
						<span className={`${skeletonMode && 'is-skeleton'}`}>
							<MomentDate
								date={new Date(data?.date_created)}
								mode="formatted and relative"
							/>
						</span>
					</div>
					<div className="col-start-3 row-start-1 flex flex-col items-end justify-start">
						{/* <span>#3498A</span> */}

						<ToggleChecked data={data} setData={setData} skeletonMode={skeletonMode} />
					</div>
				</div>

				<Tabs
					defaultValue="1"
					className={`flex flex-row gap-3 ${
						data?.checked_at ? 'bg-green-400/5' : 'bg-foreground/5'
					} p-5 pb-0`}>
					<TabsList className="mb-5 flex h-fit min-w-[180px] flex-shrink-0 flex-col items-stretch justify-start bg-transparent">
						<TabsTrigger value="1" className="justify-start">
							{t('infos')}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="1" className=" flex-grow ">
						<div className="mx-auto max-w-lg">
							<QuestionsTree skeletonMode={skeletonMode} questions={data?.data} />
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
