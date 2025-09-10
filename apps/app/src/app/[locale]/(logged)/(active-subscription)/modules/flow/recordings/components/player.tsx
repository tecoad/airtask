import { CustomButton } from '@/components/custom-button';
import { CustomIconProps, PlayerIcons } from '@/components/player-icons';
import { useSidebar } from '@/components/providers/sidebar-provider';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useReducer, useRef, useState } from 'react';

type Props = {
	audio?: {
		src: string;
		secondsDuration: number;
	};
	onClose: () => void;
};

type State = {
	paused: boolean;
	progress: number;
	muted: boolean;
	speed: number;
	audioBlob?: Blob;
};

type Action =
	| {
			type: 'pause';
			onlyChangeState?: boolean;
	  }
	| {
			type: 'play';
			onlyChangeState?: boolean;
	  }
	| {
			type: 'updateProgress';
			payload: number;
	  }
	| {
			type: 'toggleMuted';
	  }
	| {
			type: 'nextSpeed';
	  }
	| {
			type: 'updateAudioBlob';
			payload: Blob | undefined;
	  };

const speeds = [
	[PlayerIcons.onespeed, 1],
	[PlayerIcons.onehalfspeed, 1.5],
	[PlayerIcons.twospeed, 2],
] satisfies [(props: CustomIconProps) => JSX.Element, number][];

const Player = ({ onClose, audio }: Props) => {
	const { sidebarVisible } = useSidebar();
	const [_, forceRender] = useReducer((state) => state + 1, 0);

	const audioRef = useRef<HTMLAudioElement>(null);
	const isScrollingProgress = useRef(false);
	const [isLoading, setLoading] = useState(false);

	const [state, dispatch] = useReducer(
		function reducer(state: State, action: Action): State {
			switch (action.type) {
				case 'play': {
					!action.onlyChangeState && audioRef.current?.play();

					return {
						...state,
						paused: false,
					};
				}
				case 'pause': {
					!action.onlyChangeState && audioRef.current?.pause();

					return {
						...state,
						paused: true,
					};
				}
				case 'updateProgress': {
					return {
						...state,
						progress: action.payload,
					};
				}
				case 'updateAudioBlob': {
					return {
						...state,
						audioBlob: action.payload,
					};
				}
				case 'nextSpeed': {
					if (audioRef.current) {
						const next = speeds.findIndex((s) => s[1] === state.speed) + 1;

						if (next >= speeds.length) {
							audioRef.current.playbackRate = speeds[0][1];
						} else {
							audioRef.current.playbackRate = speeds[next][1];
						}

						return {
							...state,
							speed: audioRef.current.playbackRate,
						};
					}

					return state;
				}
				case 'toggleMuted': {
					// audioRef.current.muted = !audioRef.current.muted;

					return {
						...state,
						muted: !state.muted,
					};
				}
			}

			return state;
		},
		{
			muted: false,
			paused: false,
			progress: 0,
			speed: speeds[0][1],
			audioBlob: undefined,
		} as State,
	);

	const currentSpeed = speeds.find((s) => s[1] === state.speed)!;
	const [CurrentSpeedC] = currentSpeed;

	const playerVisible = !!audio;
	const VolumeToggleComponent = !state.muted ? Volume2 : VolumeX;
	useEffect(() => {
		dispatch({
			type: 'updateProgress',
			payload: 0,
		});
		if (audio) {
			setLoading(true);
			fetch(audio.src)
				.then((response) => response.blob())
				.then((blob) => {
					dispatch({
						type: 'updateAudioBlob',
						payload: blob,
					});
					setLoading(false);
				});
		} else {
			dispatch({
				type: 'updateAudioBlob',
				payload: undefined,
			});
		}
	}, [audio?.src]);

	return (
		<>
			{/* <CustomButton
				onClick={() => playerVisible && onClose()}
				variant="secondary"
				className="h-8 w-8 rounded-full p-0">
				{playerVisible ? <X size={16} /> : <Play size={16} />}
			</CustomButton> */}

			<AnimatePresence>
				{playerVisible && (
					<div
						className={cn(
							'fixed bottom-0 right-0  px-3 py-3 transition-[left] duration-200 ease-in-out md:px-10 md:py-6',
							{
								'left-16 md:left-72': sidebarVisible,
								'left-16': !sidebarVisible,
							},
						)}>
						<motion.div
							initial={{ bottom: '-200px' }}
							animate={{ bottom: '0px' }}
							exit={{ bottom: '-200px' }}
							transition={{ duration: 0.2, ease: 'easeInOut' }}
							className="relative">
							<div
								className={`mobile-only:grid-cols-[1fr_1fr_1fr] mobile-only:grid-rows-[auto_auto] bg-background mobile-only:border-t-0 mobile-only:pb-2  grid w-full grid-cols-[auto_1fr_auto_auto_auto] grid-rows-1 items-center gap-2 rounded-b-xl border  md:gap-4 md:rounded-xl md:p-4`}>
								<div className="mobile-only:order-2 flex flex-row items-center justify-center gap-2 ">
									<CustomButton
										variant="secondary"
										className="h-8 w-8 rounded-full p-0"
										onClick={() => {
											if (audioRef.current) {
												const newTime = audioRef.current.currentTime - 10;

												audioRef.current.currentTime = newTime < 0 ? 0 : newTime;
											}
										}}>
										<PlayerIcons.backwardten className="h-4 w-4" strokeWidth="1.2" />
									</CustomButton>

									<CustomButton
										size="icon"
										className="h-12 w-12 rounded-full md:-order-1 md:h-14 md:w-14 ">
										{state.paused ? (
											<Play
												size={24}
												className="ml-1"
												strokeWidth={1.5}
												onClick={() => {
													dispatch({
														type: 'play',
													});
												}}
											/>
										) : (
											<Pause
												size={24}
												strokeWidth={1.5}
												onClick={() => {
													dispatch({
														type: 'pause',
													});
												}}
											/>
										)}
										{/* <Pause size={24} strokeWidth={1.5} /> */}
									</CustomButton>

									<CustomButton
										variant="secondary"
										className="h-8 w-8 rounded-full p-0"
										onClick={() => {
											if (audioRef.current && audio) {
												const newTime = audioRef.current.currentTime + 10;

												audioRef.current.currentTime =
													newTime > audio.secondsDuration
														? audio.secondsDuration
														: newTime;
											}
										}}>
										<PlayerIcons.forwardten className="h-4 w-4" strokeWidth="1.2" />
									</CustomButton>
								</div>

								<audio
									ref={audioRef}
									src={audio!.src}
									autoPlay
									muted={state.muted}
									onTimeUpdate={(e) => {
										audioRef.current &&
											!isScrollingProgress.current &&
											dispatch({
												type: 'updateProgress',
												payload:
													(audioRef.current.currentTime / audioRef.current.duration) *
													100,
											});
									}}
									onPlay={() => {
										dispatch({
											type: 'play',
											onlyChangeState: true,
										});
									}}
									onPause={() => {
										dispatch({ type: 'pause', onlyChangeState: true });
									}}
								/>

								<Slider
									value={[state.progress]}
									onValueCommit={([v]) => {
										if (isScrollingProgress.current) {
											isScrollingProgress.current = false;
										}

										if (audioRef.current) {
											audioRef.current.currentTime =
												(v / 100) * audioRef.current.duration;
										}
									}}
									onValueChange={([v]) => {
										if (!isScrollingProgress.current) {
											isScrollingProgress.current = true;
										}
										dispatch({
											type: 'updateProgress',
											payload: v,
										});
									}}
									max={100}
									step={1}
									trackClassName="rounded-none md:rounded-full h-1"
									className="mobile-only:col-span-3 mobile-only:-order-1 cursor-pointer"
								/>

								{/* <div className="mobile-only:col-span-3 mobile-only:-order-1   bg-foreground/20 h-1 cursor-pointer overflow-hidden md:rounded-full">
									<div
										id="progress-bar"
										className="bg-foreground h-full md:rounded-full"
										style={{ width: '30%' }}></div>
								</div> */}

								<div className="mobile-only:hidden flex-row gap-2  ">
									<span className="text-foreground font-semibold">
										{audioRef.current && formatTime(audioRef.current.currentTime)}
									</span>
									<span>/</span>
									<span className="text-foreground font-semibold">
										{formatTime(audio.secondsDuration)}
									</span>
								</div>

								<div className="mobile-only:order-1 mobile-only:pl-2 flex flex-row  gap-0 ">
									<CustomButton
										variant="ghost"
										size="icon"
										className="mobile-only:order-3 h-8 w-8 rounded-full">
										<CurrentSpeedC
											className="h-4 w-4"
											onClick={() => {
												if (audioRef.current) {
													dispatch({
														type: 'nextSpeed',
													});
												}
											}}
										/>
									</CustomButton>

									<CustomButton
										variant="ghost"
										size="icon"
										className="h-8 w-8 rounded-full">
										<VolumeToggleComponent
											size={18}
											onClick={() => {
												dispatch({
													type: 'toggleMuted',
												});
											}}
										/>
									</CustomButton>

									<CustomButton
										variant="ghost"
										size="icon"
										className="h-8 w-8 rounded-full">
										<Download
											size={18}
											onClick={() => {
												if (state.audioBlob) {
													const blobUrl = URL.createObjectURL(state.audioBlob);

													const link = document.createElement('a');
													link.href = blobUrl;
													link.download = `${audio.src.split('/').pop()}.mp3`;

													document.body.appendChild(link);

													// Simula um clique para iniciar o download
													link.click();
													document.body.removeChild(link);
													URL.revokeObjectURL(blobUrl);
												}
											}}
										/>
									</CustomButton>
								</div>

								<div className="mobile-only:order-5 mobile-only:pr-2 flex justify-end ">
									<CustomButton
										size="icon"
										className=" h-6 w-6 rounded-full  "
										onClick={() => {
											onClose();
											audioRef.current?.pause();
											audioRef.current?.remove();
										}}
										variant="outline">
										<X size={16} />
									</CustomButton>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: '0%' }}
							animate={{ opacity: '100%' }}
							exit={{ opacity: '0%' }}
							transition={{ duration: 0.2, delay: 0.4 }}
							className={cn(
								'from-foreground/10  absolute inset-0  -z-10 bg-gradient-to-t to-transparent to-50%',
							)}></motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
};

export default Player;

function formatTime(seconds: number): string {
	seconds = Math.floor(seconds);

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	const formatNumber = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

	if (hours > 0) {
		return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(
			remainingSeconds,
		)}`;
	} else if (minutes > 0) {
		return `${formatNumber(minutes)}:${formatNumber(remainingSeconds)}`;
	} else {
		return `00:${formatNumber(remainingSeconds)}`;
	}
}
