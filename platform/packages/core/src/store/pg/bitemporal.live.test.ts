import { describe, expect, it } from "vitest";
import { Pool } from "pg";
import { BITEMPORAL_TABLE_DDL, PostgresBitemporalStore } from "./bitemporal.js";

const connectionString = process.env.PG_TEST_URL;

describe.runIf(connectionString !== undefined)("PostgresBitemporalStore", () => {
  it("round-trips a backdated correction along both axes", async () => {
    const pool = new Pool({ connectionString: connectionString! });
    try {
      const table = "bitemporal_test";
      await pool.query(`DROP TABLE IF EXISTS "${table}"`);
      await pool.query(BITEMPORAL_TABLE_DDL.replaceAll('"bitemporal_record"', `"${table}"`));
      const store = new PostgresBitemporalStore({ pool, table });

      await store.put({
        entityId: "CP-1",
        version: 1,
        effectiveFrom: "2024-01-01",
        effectiveTo: null,
        knownDate: "2024-01-02",
        data: { rating: "A", country: "ZW" },
      });
      await store.put({
        entityId: "CP-1",
        version: 2,
        effectiveFrom: "2024-01-01",
        effectiveTo: null,
        knownDate: "2024-01-15",
        data: { rating: "BBB", country: "ZW" },
      });

      const asReported = await store.at<{ rating: string }>("CP-1", "2024-01-10", "2024-01-10");
      expect(asReported?.data.rating).toBe("A");

      const asUnderstood = await store.at<{ rating: string }>("CP-1", "2024-01-10", "2024-01-20");
      expect(asUnderstood?.data.rating).toBe("BBB");

      const history = await store.history("CP-1");
      expect(history).toHaveLength(2);
    } finally {
      await pool.end();
    }
  });
});