/**
 * MARIGOLD × PIPES CLIENT-SIDE WEBGPU INFERENCE ENGINE (`@mlc-ai/web-llm`)
 * =========================================================================
 * Ported from `pipes-unified/src/lib/greater-local/webllm-engine.ts`.
 *
 * Runs 100% in-browser on the user's local GPU via WebGPU (`navigator.gpu`).
 * Zero cloud API costs, zero server telemetry, and zero bytes of voter metadata sent outbound.
 */

export interface WebGPUProgress {
  progress: number;
  text: string;
}

export const DEFAULT_MARIGOLD_WEBGPU_MODEL = 'SmolLM2-360M-Instruct-q4f16_1-MLC';

let enginePromise: Promise<any> | null = null;
let activeWebGPUEngine: any = null;

export function isWebGPUSupported(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return 'gpu' in navigator;
}

export function isWebGPUEngineReady(): boolean {
  return Boolean(activeWebGPUEngine);
}

/**
 * Warms the local in-browser WebGPU model (`SmolLM2-360M-Instruct-q4f16_1-MLC`) on explicit user opt-in.
 * Weights are cached automatically in the browser's Cache Storage / OPFS by WebLLM.
 */
export async function warmMarigoldWebGPUEngine(
  modelId: string = DEFAULT_MARIGOLD_WEBGPU_MODEL,
  onProgress?: (p: WebGPUProgress) => void
): Promise<any | null> {
  if (!isWebGPUSupported()) return null;
  if (activeWebGPUEngine) return activeWebGPUEngine;

  if (!enginePromise) {
    enginePromise = (async () => {
      try {
        const runtimeImport = new Function('u', 'return import(u)') as (u: string) => Promise<any>;
        const { CreateMLCEngine } = await runtimeImport('https://esm.run/@mlc-ai/web-llm');
        const engine = await CreateMLCEngine(modelId, {
          initProgressCallback: (report: { progress: number; text: string }) => {
            if (onProgress) {
              onProgress({
                progress: Math.round((report.progress || 0) * 100),
                text: report.text || 'Warming local WebGPU weights...',
              });
            }
          },
        });
        activeWebGPUEngine = engine;
        return engine;
      } catch (err) {
        console.warn('Marigold WebGPU Engine unavailable, falling back to deterministic local engine:', err);
        enginePromise = null;
        return null;
      }
    })();
  }

  return enginePromise;
}

/**
 * If the WebGPU engine is already warmed in local GPU memory, executes a fast structured JSON
 * completion completely inside the browser with zero network calls.
 */
export async function tryWebGPUJSONCompletion<T>(
  prompt: string,
  systemInstruction: string
): Promise<T | null> {
  if (!activeWebGPUEngine) return null;

  try {
    const completion = await activeWebGPUEngine.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `${systemInstruction}\nRespond ONLY with a valid JSON object. Do not wrap in markdown code fences.`,
        },
        {
          role: 'user',
          content: prompt.slice(0, 1800),
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
      stream: false,
    });

    const rawText: string = completion?.choices?.[0]?.message?.content || '';
    if (!rawText) return null;

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return null;
  }
}
