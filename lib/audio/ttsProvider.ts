/**
 * Bridge3 Academy — Text-to-Speech Provider Abstraction
 * Supports Google Cloud TTS, ElevenLabs, and OpenAI TTS via standard HTTP APIs.
 */

export interface TTSResult {
  audioBuffer: Buffer;
  contentType: string;
}

export interface TTSProvider {
  name: string;
  generateAudio(text: string): Promise<TTSResult>;
}

export class GoogleTTSProvider implements TTSProvider {
  name = "google";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_TTS_API_KEY || "";
  }

  async generateAudio(text: string): Promise<TTSResult> {
    if (!this.apiKey) {
      throw new Error("Missing GOOGLE_TTS_API_KEY environment variable.");
    }

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "en-US",
          name: "en-US-Journey-F", // Natural sounding Neural2 / Journey voice
          ssmlGender: "FEMALE",
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 1.0,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google TTS API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const audioBuffer = Buffer.from(data.audioContent, "base64");
    return { audioBuffer, contentType: "audio/mpeg" };
  }
}

export class ElevenLabsTTSProvider implements TTSProvider {
  name = "elevenlabs";
  private apiKey: string;
  private voiceId: string;

  constructor(apiKey?: string, voiceId?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || "";
    // Default to 'Rachel' or custom voice
    this.voiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  }

  async generateAudio(text: string): Promise<TTSResult> {
    if (!this.apiKey) {
      throw new Error("Missing ELEVENLABS_API_KEY environment variable.");
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`ElevenLabs API error (${res.status}): ${errText}`);
    }

    const arrayBuf = await res.arrayBuffer();
    return { audioBuffer: Buffer.from(arrayBuf), contentType: "audio/mpeg" };
  }
}

export class OpenAITTSProvider implements TTSProvider {
  name = "openai";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
  }

  async generateAudio(text: string): Promise<TTSResult> {
    if (!this.apiKey) {
      throw new Error("Missing OPENAI_API_KEY environment variable.");
    }

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "alloy",
        response_format: "mp3",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI TTS API error (${res.status}): ${errText}`);
    }

    const arrayBuf = await res.arrayBuffer();
    return { audioBuffer: Buffer.from(arrayBuf), contentType: "audio/mpeg" };
  }
}

/**
 * Returns the configured TTS Provider based on TTS_PROVIDER env var.
 * Defaults to Google Cloud TTS.
 */
export function getTTSProvider(): TTSProvider {
  const provider = (process.env.TTS_PROVIDER || "google").toLowerCase();
  switch (provider) {
    case "elevenlabs":
      return new ElevenLabsTTSProvider();
    case "openai":
      return new OpenAITTSProvider();
    case "google":
    default:
      return new GoogleTTSProvider();
  }
}
