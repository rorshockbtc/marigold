import { writeStructuredFile, readStructuredFile, listStructuredSubfolderFiles } from '../fs/LocalFSManager';

export interface PlaybookConfig {
  id: string;
  name: string;
  description: string;
  queryTemplate: string;
  chartType: string;
  createdAt: number;
}

export class LocalPlaybookStore {
  static async savePlaybook(rootHandle: any, playbook: PlaybookConfig): Promise<boolean> {
    const jsonString = JSON.stringify(playbook, null, 2);
    return writeStructuredFile(rootHandle, 'Custom_Playbooks', `${playbook.id}.json`, jsonString);
  }

  static async loadPlaybook(rootHandle: any, id: string): Promise<PlaybookConfig | null> {
    const content = await readStructuredFile(rootHandle, 'Custom_Playbooks', `${id}.json`);
    if (!content) return null;
    try {
      return JSON.parse(content) as PlaybookConfig;
    } catch (e) {
      console.error(`Failed to parse Playbook ${id}:`, e);
      return null;
    }
  }

  static async listPlaybooks(rootHandle: any): Promise<PlaybookConfig[]> {
    const files = await listStructuredSubfolderFiles(rootHandle, 'Custom_Playbooks');
    const playbooks: PlaybookConfig[] = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const id = file.replace('.json', '');
        const pb = await this.loadPlaybook(rootHandle, id);
        if (pb) playbooks.push(pb);
      }
    }
    return playbooks.sort((a, b) => b.createdAt - a.createdAt);
  }
}
