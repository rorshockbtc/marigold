import { describe, it, expect, beforeEach } from 'vitest';
import { ZeroPIIPipeline } from '../src/lib/data/ZeroPII';

describe('ZeroPIIPipeline', () => {
  let pipeline: ZeroPIIPipeline;

  beforeEach(() => {
    pipeline = new ZeroPIIPipeline();
  });

  it('hashes a string into a safe token', () => {
    const raw = "John Doe";
    const token = pipeline.encodeValue(raw);
    
    expect(token).toMatch(/^\{\{MARI_KEY_[A-Z0-9]{8}\}\}$/);
    expect(token).not.toContain("John");
    expect(token).not.toContain("Doe");
  });

  it('returns the same token for the same string (deterministic)', () => {
    const token1 = pipeline.encodeValue("123 Main St");
    const token2 = pipeline.encodeValue("123 Main St");
    
    expect(token1).toEqual(token2);
  });

  it('decodes a string replacing tokens with original values', () => {
    const nameToken = pipeline.encodeValue("Jane Smith");
    const cityToken = pipeline.encodeValue("Chicago");

    const llmOutput = `The resident ${nameToken} was found in the ${cityToken} anomaly cluster.`;
    const decoded = pipeline.decodeString(llmOutput);

    expect(decoded).toEqual("The resident Jane Smith was found in the Chicago anomaly cluster.");
  });

  it('exports and imports the dictionary successfully', () => {
    pipeline.encodeValue("Secret Agent");
    const exportedJson = pipeline.exportDictionary();

    const newPipeline = new ZeroPIIPipeline();
    newPipeline.importDictionary(exportedJson);

    // It should now decode successfully using the new instance
    const decoded = newPipeline.decodeString(`We found ${exportedJson.match(/\{\{MARI_KEY_[A-Z0-9]{8}\}\}/)![0]}`);
    expect(decoded).toContain("Secret Agent");
  });

  it('leaves unknown tokens untouched', () => {
    const llmOutput = "Here is a token {{MARI_KEY_UNKNOWN}}";
    const decoded = pipeline.decodeString(llmOutput);
    expect(decoded).toEqual(llmOutput);
  });
});
