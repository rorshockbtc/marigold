import { writeStructuredFile, readStructuredFile } from '../fs/LocalFSManager';

export interface MariContext {
  interests: string[];
  historicalQueries: string[];
  knownSchemas: Record<string, any>;
  lastUpdated: number;
}

export class MariContextStore {
  private static readonly CONTEXT_FILE = 'context.json';
  private static readonly SUBFOLDER = '.marigold';

  static async loadContext(rootHandle: any): Promise<MariContext> {
    const content = await readStructuredFile(rootHandle, this.SUBFOLDER, this.CONTEXT_FILE);
    if (!content) {
      return {
        interests: [],
        historicalQueries: [],
        knownSchemas: {},
        lastUpdated: Date.now()
      };
    }
    try {
      return JSON.parse(content) as MariContext;
    } catch (e) {
      console.error('Failed to parse Mari Context:', e);
      return {
        interests: [],
        historicalQueries: [],
        knownSchemas: {},
        lastUpdated: Date.now()
      };
    }
  }

  static async saveContext(rootHandle: any, context: MariContext): Promise<boolean> {
    context.lastUpdated = Date.now();
    const jsonString = JSON.stringify(context, null, 2);
    return writeStructuredFile(rootHandle, this.SUBFOLDER, this.CONTEXT_FILE, jsonString);
  }

  static async addInterest(rootHandle: any, interest: string): Promise<void> {
    const context = await this.loadContext(rootHandle);
    if (!context.interests.includes(interest)) {
      context.interests.push(interest);
      await this.saveContext(rootHandle, context);
    }
  }

  static async addHistoricalQuery(rootHandle: any, query: string): Promise<void> {
    const context = await this.loadContext(rootHandle);
    // keep last 50 queries
    context.historicalQueries.unshift(query);
    if (context.historicalQueries.length > 50) {
      context.historicalQueries.pop();
    }
    await this.saveContext(rootHandle, context);
  }
}
