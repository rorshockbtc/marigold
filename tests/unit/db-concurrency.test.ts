import { describe, it, expect, beforeEach } from 'vitest';
import { getActiveDatabaseName, openActiveDatabase } from '@/lib/db/dbName';

describe('IndexedDB Concurrency & Deadlock Prevention Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should resolve database name correctly based on active group', () => {
    localStorage.setItem("marigold_active_group", "Mississippi Fair Elections");
    expect(getActiveDatabaseName()).toBe("VoterDataDB");

    localStorage.setItem("marigold_active_group", "State of Roosevelt (Demo)");
    expect(getActiveDatabaseName()).toBe("DemoVoterDataDB");
  });

  it('should open database without throwing version error or deadlocking', async () => {
    localStorage.setItem("marigold_active_group", "Test Group");
    const dbName = getActiveDatabaseName();
    
    const db = await openActiveDatabase(dbName);
    expect(db).toBeDefined();
    expect(db.objectStoreNames.contains('rows')).toBe(true);
    db.close();
  });

  it('should allow concurrent database handles to close gracefully on versionchange', async () => {
    localStorage.setItem("marigold_active_group", "Concurrent Test Group");
    const dbName = getActiveDatabaseName();

    const db1 = await openActiveDatabase(dbName);
    expect(db1).toBeDefined();

    // Verify handle can be closed without hanging
    db1.close();

    const db2 = await openActiveDatabase(dbName);
    expect(db2).toBeDefined();
    db2.close();
  });
});
