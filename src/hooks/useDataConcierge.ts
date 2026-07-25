import { useState } from 'react';
import { useLocalFileSystem } from '@/lib/data/useLocalFileSystem';
import { SecurityScanner } from '@/lib/data/SecurityScanner';

export type ConciergeState = 'IDLE' | 'LOCAL_CHECK' | 'DATA_DISCOVERY' | 'INGESTING' | 'RENDERING' | 'ERROR';

export interface PublicDataPayload {
  source_url: string;
  description: string;
  suggested_dataset_name: string;
}

export function useDataConcierge() {
  const [state, setState] = useState<ConciergeState>('IDLE');
  const [publicData, setPublicData] = useState<PublicDataPayload | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [ingestStatus, setIngestStatus] = useState<string>('');
  const { isConnected, requestDirectoryAccess, saveFileSilently } = useLocalFileSystem();

  const startQuery = async (query: string, activeGroup: string) => {
    setState('LOCAL_CHECK');
    setErrorMsg('');
    
    try {
      const localKeys = isConnected ? ['demo.mari'] : [];
      
      const response = await fetch('/api/mari', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, localDataKeys: localKeys, activeGroup })
      });
      
      const result = await response.json();
      
      if (result.action === 'fetch_public_data') {
        setPublicData({
          source_url: result.source_url,
          description: result.description,
          suggested_dataset_name: result.suggested_dataset_name
        });
        setState('DATA_DISCOVERY');
      } else {
        setState('RENDERING');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to communicate with Mari LLM router.');
      setState('ERROR');
    }
  };

  const ingestData = async (mode: 'permanent' | 'jit') => {
    if (!publicData) return;
    
    setState('INGESTING');
    setErrorMsg('');
    
    try {
      // Real Security Scan: Endpoint Validation
      setIngestStatus('Running Security Scanner: Validating endpoint...');
      const endpointCheck = SecurityScanner.validateEndpoint(publicData.source_url);
      if (!endpointCheck.safe) {
        throw new Error(`SECURITY ALERT: ${endpointCheck.reason}`);
      }

      setIngestStatus('Connecting to trusted public endpoint...');
      const response = await fetch(publicData.source_url);
      if (!response.ok) throw new Error(`HTTP Fetch Error: ${response.status}`);
      if (!response.body) throw new Error('ReadableStream not supported by browser.');

      setIngestStatus('Scanning incoming payload chunks for malicious signatures...');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullPayload = '';
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // Scan the chunk
        const chunkCheck = SecurityScanner.scanPayloadChunk(chunk);
        if (!chunkCheck.safe) {
          throw new Error(`SECURITY ALERT: ${chunkCheck.reason}`);
        }

        fullPayload += chunk;
        
        if (isFirstChunk) {
          setIngestStatus('Payload verified. Streaming data...');
          isFirstChunk = false;
        }
      }

      if (mode === 'permanent') {
        setIngestStatus('Writing encrypted chunks to local OPFS...');
        if (!isConnected) {
          await requestDirectoryAccess();
        }
        await saveFileSilently(`${publicData.suggested_dataset_name}.csv`, fullPayload);
      } else {
        setIngestStatus('Holding data in temporary JIT buffer...');
      }
      
      setState('RENDERING');
    } catch (err: any) {
      console.error("Ingestion failed", err);
      setErrorMsg(err.message || 'Unknown ingestion error');
      setState('ERROR');
    }
  };

  const reset = () => {
    setState('IDLE');
    setPublicData(null);
    setErrorMsg('');
  };

  return {
    state,
    publicData,
    errorMsg,
    ingestStatus,
    startQuery,
    ingestData,
    reset
  };
}
