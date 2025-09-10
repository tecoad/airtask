export type CustomParameters = {
  interactionId: string;
};

export type TwilioMediaFromEvents =
  | {
      event: 'connected';
      protocol: 'Call';
      version: string;
    }
  | {
      event: 'start';
      sequenceNumber: string;
      start: {
        streamSid: string;
        accountSid: string;
        callSid: string;
        tracks: ('inbound' | 'outbound')[];
        customParameters: CustomParameters;
        mediaFormat: {
          encoding: 'audio/x-mulaw';
          sampleRate: 8000;
          channels: 1;
        };
      };
      streamSid: string;
    }
  | {
      event: 'media';
      sequenceNumber: string;
      media: {
        track: 'outbound' | 'inbound';
        chunk: string;
        timestamp: string;
        payload: string;
      };
      streamSid: string;
    }
  | {
      event: 'stop';
      sequenceNumber: string;
      stop: {
        accountSid: string;
        callSid: string;
      };
      streamSid: string;
    };

export type TwilioMediaToMediaEvent = {
  event: 'media';
  streamSid: string;
  media: {
    /**
     *  (a base64 encoded string of 8000/mulaw)
     */
    payload: string;
  };
};
export type TwilioMediaToClearEvent = {
  event: 'clear';
  streamSid: string;
};

export type TwilioMediaToEvents =
  | TwilioMediaToMediaEvent
  | TwilioMediaToClearEvent;
