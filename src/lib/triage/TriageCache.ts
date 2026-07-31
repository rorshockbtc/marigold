interface CachedQA {
  id: string;
  question: string;
  answer: string;
  embedding: number[];
  timestamp: number;
}

export class TriageCache {
  private static instance: TriageCache;
  private extractor: any = null;
  private isReady: boolean = false;
  private initPromise: Promise<void> | null = null;
  private cacheKey = 'marigold_triage_cache';

  private constructor() {}

  public static getInstance(): TriageCache {
    if (!TriageCache.instance) {
      TriageCache.instance = new TriageCache();
    }
    return TriageCache.instance;
  }

  public async initialize() {
    if (this.isReady) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // Dynamically import to avoid Next.js top-level evaluation crashes
        const { pipeline, env } = await import('@xenova/transformers');
        env.allowLocalModels = false;
        
        // Load the tiny fast model for semantic similarity
        this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        this.isReady = true;
      } catch (err) {
        console.error("Failed to load Semantic Triage model:", err);
      }
    })();

    return this.initPromise;
  }

  private getLocalCache(): CachedQA[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.cacheKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  private saveLocalCache(cache: CachedQA[]) {
    if (typeof window !== 'undefined') {
      // Keep only the most recent 100 to prevent localstorage bloat
      const pruned = cache.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
      localStorage.setItem(this.cacheKey, JSON.stringify(pruned));
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public async getEmbedding(text: string): Promise<number[]> {
    await this.initialize();
    if (!this.extractor) throw new Error("Extractor not loaded");
    
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  public async checkTriage(query: string, threshold: number = 0.85): Promise<string | null> {
    try {
      const cache = this.getLocalCache();
      if (cache.length === 0) return null;

      const queryEmbedding = await this.getEmbedding(query);
      
      let bestMatch: CachedQA | null = null;
      let highestSimilarity = 0;

      for (const item of cache) {
        const sim = this.cosineSimilarity(queryEmbedding, item.embedding);
        if (sim > highestSimilarity) {
          highestSimilarity = sim;
          bestMatch = item;
        }
      }

      if (highestSimilarity >= threshold && bestMatch) {
        return bestMatch.answer;
      }

      return null;
    } catch (e) {
      console.warn("Triage cache check failed:", e);
      return null;
    }
  }

  public async learnNewAnswer(question: string, answer: string) {
    try {
      const embedding = await this.getEmbedding(question);
      const cache = this.getLocalCache();
      
      // Update if exact question exists, else add new
      const existingIdx = cache.findIndex(c => c.question === question);
      
      const newEntry: CachedQA = {
        id: "qa_" + Date.now(),
        question,
        answer,
        embedding,
        timestamp: Date.now()
      };

      if (existingIdx >= 0) {
        cache[existingIdx] = newEntry;
      } else {
        cache.push(newEntry);
      }

      this.saveLocalCache(cache);
    } catch (e) {
      console.warn("Triage learning failed:", e);
    }
  }

  // Pre-seed the cache with core Marigold FAQs if empty
  public async preSeedFAQs() {
    const cache = this.getLocalCache();
    if (cache.length > 0) return; // Already has data

    const coreFAQs = [
      {
        q: "What is Marigold good at?",
        a: "Marigold Insights is a completely local, zero-cloud data auditing platform. It excels at parsing large CSV files (like voter rolls or real estate records) instantly in your browser's RAM, applying statistical algorithms (like Benford's Law and Z-Score outlier detection), and helping you build Data Stories without ever transmitting your raw data to a server."
      },
      {
        q: "How do I upload data?",
        a: "To load data, click the 'Data Insights' tab or 'Re-link Folder' button at the top right. You can safely select any local CSV file. It will be loaded securely into your browser's isolated memory using DuckDB WebAssembly."
      },
      {
        q: "Is my data secure?",
        a: "Yes. Marigold Insights is an entirely air-gapped system. Your raw CSV records never leave your machine. Any calculations are performed locally in WebAssembly. When communicating with Mari (the AI), we automatically redact PII and replace it with cryptographic hashes before sending metadata to the LLM."
      }
    ];

    for (const faq of coreFAQs) {
      await this.learnNewAnswer(faq.q, faq.a);
    }
  }
}
