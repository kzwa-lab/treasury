import type { Pool } from "pg";
import type { BitemporalRecord, BitemporalStore } from "../bitemporal.js";

export interface PostgresBitemporalStoreOptions {
  pool: Pool;
  table?: string;
}

interface Row {
  entity_id: string;
  version: number;
  effective_from: string;
  effective_to: string | null;
  known_date: string;
  data: unknown;
}

function rowToRecord<T>(row: Row): BitemporalRecord<T> {
  return {
    entityId: row.entity_id,
    version: row.version,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    knownDate: row.known_date,
    data: row.data as T,
  };
}

const rowStored = rowToRecord;

export class PostgresBitemporalStore implements BitemporalStore {
  private readonly pool: Pool;
  private readonly table: string;

  constructor(options: PostgresBitemporalStoreOptions) {
    this.pool = options.pool;
    this.table = options.table ?? "bitemporal_record";
  }

  async put<T>(record: BitemporalRecord<T>): Promise<void> {
    if (record.effectiveTo !== null && record.effectiveTo <= record.effectiveFrom) {
      throw new Error(
        `Invalid effective range for ${record.entityId} v${record.version}: ${record.effectiveFrom} to ${record.effectiveTo}`,
      );
    }
    await this.pool.query(
      `INSERT INTO "${this.table}" (
         entity_id, version, effective_from, effective_to, known_date, data
       ) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (entity_id, version, known_date) DO NOTHING`,
      [record.entityId, record.version, record.effectiveFrom, record.effectiveTo, record.knownDate, JSON.stringify(record.data)],
    );
  }

  async at<T>(
    entityId: string,
    effectiveDate: string,
    knownAsOf: string,
  ): Promise<BitemporalRecord<T> | undefined> {
    const result = await this.pool.query<Row>(
      `SELECT entity_id, version, effective_from, effective_to, known_date, data
       FROM "${this.table}"
       WHERE entity_id = $1
         AND effective_from <= $2
         AND (effective_to IS NULL OR $2 < effective_to)
         AND known_date <= $3
       ORDER BY known_date DESC, version DESC
       LIMIT 1`,
      [entityId, effectiveDate, knownAsOf],
    );
    const row = result.rows[0];
    return row === undefined ? undefined : rowStored<T>(row);
  }

  async history<T>(entityId: string): Promise<BitemporalRecord<T>[]> {
    const result = await this.pool.query<Row>(
      `SELECT entity_id, version, effective_from, effective_to, known_date, data
       FROM "${this.table}"
       WHERE entity_id = $1
       ORDER BY effective_from, known_date, version`,
      [entityId],
    );
    return result.rows.map(rowStored<T>);
  }

  async all<T>(): Promise<BitemporalRecord<T>[]> {
    const result = await this.pool.query<Row>(
      `SELECT entity_id, version, effective_from, effective_to, known_date, data
       FROM "${this.table}"
       ORDER BY entity_id, effective_from, known_date`,
    );
    return result.rows.map(rowStored<T>);
  }
}

export const BITEMPORAL_TABLE_DDL = `
CREATE TABLE IF NOT EXISTS "bitemporal_record" (
  entity_id     TEXT NOT NULL,
  version       INTEGER NOT NULL,
  effective_from DATE NOT NULL,
  effective_to  DATE,
  known_date    DATE NOT NULL,
  data          JSONB NOT NULL,
  PRIMARY KEY (entity_id, version, known_date)
);
`;