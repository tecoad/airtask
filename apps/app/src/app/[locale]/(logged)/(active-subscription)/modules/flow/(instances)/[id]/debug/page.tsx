'use client';
import { Howl } from 'howler';
import { useEffect, useRef, useState } from 'react';
import * as wavEncoder from 'wav-encoder';

const Phone = () => {
	const [status, setStatus] = useState('disconnected');
	const [audioStream, setAudioStream] = useState<MediaStream>();
	const [websocket, setWebsocket] = useState<WebSocket>();
	const [audioSource, setAudioSorce] = useState<MediaStreamAudioSourceNode>();
	const [scriptProcessor, setScriptProcessor] = useState<ScriptProcessorNode>();
	const [history, setHistory] = useState<{ content: string; role: 'user' | 'ai' }[]>([]);

	const isFirstRender = useRef(true);

	useEffect(() => {
		if (!isFirstRender.current) return;

		isFirstRender.current = false;

		const initializeTwilioDevice = async () => {
			try {
				setStatus('ready');

				const ws = new WebSocket(
					'ws://localhost:3009/flow-audio-stream?inputFormat=pcm&debug=true',
				);

				setWebsocket(ws);

				const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
					const binaryString = atob(base64);
					const len = binaryString.length;
					const bytes = new Uint8Array(len);

					for (let i = 0; i < len; i++) {
						bytes[i] = binaryString.charCodeAt(i);
					}

					return bytes.buffer;
				};
				// Decodificar a string base64 para um ArrayBuffer

				// Manter uma fila de buffers de áudio
				let audioQueue: ArrayBuffer[] = [];
				let isPlaying = false;

				const decodeAndPlayAudio = (audioBuffer: ArrayBuffer) => {
					const audioContext = new AudioContext();

					audioContext.decodeAudioData(audioBuffer, (buffer) => {
						const source = audioContext.createBufferSource();
						source.buffer = buffer;
						source.connect(audioContext.destination);
						source.start();

						// Quando a reprodução terminar, definir isPlaying como falso e chamar recursivamente para o próximo na fila
						source.onended = () => {
							isPlaying = false;
							playNextAudio();
						};
					});
				};

				const playNextAudio = () => {
					if (audioQueue.length > 0 && !isPlaying) {
						isPlaying = true;

						const audioBuffer = audioQueue.shift(); // Pegar o próximo buffer da fila
						console.log(audioBuffer, 'buffer');
						const sound = new Howl({
							src: [URL.createObjectURL(new Blob([audioBuffer!], { type: 'audio/mp3' }))],
							format: ['mp3'], // ou 'ogg', dependendo do formato do áudio
							onend: () => {
								// Callback chamado quando a reprodução termina
								isPlaying = false;
								playNextAudio();
							},
						});

						// Reproduzir o áudio
						sound.play();
					}
				};

				// Seu código para receber eventos, chame esta função para adicionar o buffer à fila
				const handleAudioEvent = (base64Payload: string) => {
					const audioBuffer = base64ToArrayBuffer(base64Payload);
					audioQueue.push(audioBuffer);

					// Pré-carregar os dados de áudio antes de começar a reprodução
					if (!isPlaying) {
						playNextAudio();
					}
				};

				ws.addEventListener('message', ({ data: _data }) => {
					const data = JSON.parse(_data);

					if (data.event === 'voice-recognized') {
						setHistory((prev) => [
							...prev,
							{
								content: data.data.text,
								role: 'user',
							},
						]);
					}

					if (data.event === 'ai-response-created') {
						setHistory((prev) => [
							...prev,
							{
								content: data.data.text,
								role: 'ai',
							},
						]);
					}

					if (data.event === 'media') {
						const base64Payload = data.media.payload;

						handleAudioEvent(base64Payload);
					}

					if (data.event === 'clear') {
						audioQueue = [];
					}
				});
			} catch (error) {
				console.log(error);
			}
		};

		initializeTwilioDevice();

		// Limpeza ao desmontar o componente
		return () => {
			if (audioStream) {
				// Parar a gravação de áudio
				audioStream.getTracks().forEach((track) => track.stop());
			}

			if (websocket) {
				// Fechar a conexão WebSocket
				websocket.close();
			}
		};
	}, []);

	const handleStartAudio = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			setAudioStream(stream);
			setStatus('audioStarted');

			websocket?.send(
				JSON.stringify({
					event: 'start',
					start: {
						isDebugMode: true,
						customParameters: { interactionId: '3e3d0637-dbb5-48e2-9692-a6d46a2dbefe' },
					},
					streamSid: 'MZ18ad3ab5a668481ce02b83e7395059f0',
				}),
			);

			// Enviar o stream de áudio para o WebSocket
			const audioContext = new AudioContext();
			const audioSource = audioContext.createMediaStreamSource(stream);
			audioSource.channelCount = 1;
			const scriptProcessor = audioContext.createScriptProcessor(8192, 1, 1);

			scriptProcessor.onaudioprocess = async (event) => {
				const audioData = event.inputBuffer.getChannelData(0);

				// Converter a taxa de amostragem para 16000 Hz
				const resampledAudioData = resampleAudio(
					audioData,
					audioContext.sampleRate,
					16000,
				);

				// Enviar dados de áudio para o WebSocket
				if (websocket && websocket.readyState === WebSocket.OPEN) {
					websocket.send(
						JSON.stringify({
							event: 'media',
							sequenceNumber: '4',
							media: {
								track: 'inbound',
								chunk: '2',
								timestamp: '5',
								customFormat: 'pcm/16000',
								payload: await convertToWav(resampledAudioData),
							},
							streamSid: 'MZ18ad3ab5a668481ce02b83e7395059f0',
						}),
					);

					// const audioBuffer = audioContext.createBuffer(1, audioData.length, 44100);
					// audioBuffer.getChannelData(0).set(audioData);

					// const source = audioContext.createBufferSource();
					// source.buffer = audioBuffer;
					// source.connect(audioContext.destination);
					// source.start();
				}
			};

			setAudioSorce(audioSource);
			setScriptProcessor(scriptProcessor);

			audioSource.connect(scriptProcessor);
			scriptProcessor.connect(audioContext.destination);
		} catch (error) {
			console.error('Erro ao iniciar o áudio:', error);
		}
	};

	const handleStopAudio = () => {
		if (audioStream) {
			// Parar a gravação de áudio
			audioStream.getTracks().forEach((track) => track.stop());
			setAudioStream(undefined);
			scriptProcessor?.disconnect();
			audioSource?.disconnect();
			setStatus('ready');
			websocket?.send(
				JSON.stringify({
					event: 'stop',
				}),
			);
		}
	};

	return (
		<div>
			<h1>Twilio Phone</h1>
			<p>Status: {status}</p>
			{status === 'ready' && <button onClick={handleStartAudio}>Iniciar Áudio</button>}
			{status === 'audioStarted' && (
				<button onClick={handleStopAudio}>Parar Áudio</button>
			)}

			{history.map((v, k) => (
				<p key={k}>
					<strong>{v.role}</strong>: {v.content}
				</p>
			))}
		</div>
	);
};

export default Phone;

// Função para converter para WAV
async function convertToWav(audioData: Float32Array) {
	const wavData = await wavEncoder.encode(
		{
			sampleRate: 16000,
			channelData: [audioData],
		},
		{
			bitDepth: 16,
			float: false, // Adicione essa propriedade conforme necessário
			symmetric: true, // Adicione essa propriedade conforme necessário
		},
	);

	// Converte para Base64
	return arrayBufferToBase64(wavData);
}

// Função para resample do áudio
function resampleAudio(input: Float32Array, inputRate: number, outputRate: number) {
	const resampleRatio = inputRate / outputRate;
	const outputLength = Math.floor(input.length / resampleRatio);
	const output = new Float32Array(outputLength);

	for (let i = 0; i < outputLength; i++) {
		const index = Math.floor(i * resampleRatio);
		output[i] = input[index];
	}

	return output;
}

// Função para converter ArrayBuffer para Base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;

	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	return window.btoa(binary);
}
