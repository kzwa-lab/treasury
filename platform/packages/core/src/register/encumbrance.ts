import type { Amount } from "../model/types.js";
import type { BitemporalRecord, BitemporalStore } from "../store/bitemporal.js";

export type EncumbranceType = "PLEDGED" | "RECEIVED";

export type EncumbranceStatus = "ACTIVE" | "RELEASED";

export type EncumbranceSource = "EXTERNAL" | "DERIVED";

export interface Encumbrance {
  readonly id: string;
  readonly assetContractId: string;
  readonly type: EncumbranceType;
  readonly holder: string;
  readonly startedOn: string;
  readonly untilOn: string | null;
  readonly status: EncumbranceStatus;
  readonly source: EncumbranceSource;
  readonly financingContractId?: string;
  readonly rehypothecable?: boolean;
  readonly amount?: Amount;
}

interface StoredEncumbrance extends Encumbrance {
  readonly releasedOn?: string;
}

export interface ActiveEncumbrance {
  readonly encumbrance: Encumbrance;
  readonly releasedOn: string | null;
}

export class EncumbranceRegister {
  private readonly store: BitemporalStore;

  constructor(store: BitemporalStore) {
    this.store = store;
  }

  async pledge(encumbrance: Encumbrance, knownDate: string): Promise<void> {
    const stored: StoredEncumbrance = { ...encumbrance };
    await this.putVersion(stored, encumbrance.startedOn, encumbrance.untilOn, knownDate, 1);
  }

  async release(assetContractId: string, holder: string, releasedOn: string, knownDate: string): Promise<void> {
    const history = await this.store.history<StoredEncumbrance>(entityId(assetContractId, holder));
    const latest = history[history.length - 1];
    if (latest === undefined) {
      throw new Error(`No encumbrance to release for ${assetContractId} to ${holder}`);
    }
    const released: StoredEncumbrance = { ...latest.data, status: "RELEASED", releasedOn };
    await this.putVersion(released, latest.effectiveFrom, releasedOn, knownDate, latest.version + 1);
  }

  async activeAsOf(asOf: string, knownAsOf: string): Promise<ActiveEncumbrance[]> {
    const rows = await this.store.all<StoredEncumbrance>();
    const byEntity = new Map<string, BitemporalRecord<StoredEncumbrance>[]>();
    for (const row of rows) {
      const list = byEntity.get(row.entityId);
      if (list === undefined) {
        byEntity.set(row.entityId, [row]);
      } else {
        list.push(row);
      }
    }

    const active: ActiveEncumbrance[] = [];
    for (const [, versions] of byEntity) {
      const current = versions
        .filter((r) => r.knownDate <= knownAsOf)
        .sort((a, b) => a.knownDate.localeCompare(b.knownDate) || a.version - b.version)
        .at(-1);
      if (current === undefined) {
        continue;
      }
      if (current.effectiveFrom > asOf) {
        continue;
      }
      if (current.effectiveTo !== null && asOf >= current.effectiveTo) {
        continue;
      }
      const data = current.data;
      const encumbrance = data as Encumbrance;
      active.push({ encumbrance, releasedOn: data.releasedOn ?? null });
    }
    return active;
  }

  async isEncumbered(assetContractId: string, asOf: string, knownAsOf: string): Promise<boolean> {
    const active = await this.activeAsOf(asOf, knownAsOf);
    return active.some(
      (a) => a.encumbrance.assetContractId === assetContractId && a.encumbrance.status === "ACTIVE",
    );
  }

  async encumberedNotional(assetContractId: string, asOf: string, knownAsOf: string): Promise<Amount | null> {
    const active = await this.activeAsOf(asOf, knownAsOf);
    const match = active.find(
      (a) => a.encumbrance.assetContractId === assetContractId && a.encumbrance.amount !== undefined,
    );
    return match?.encumbrance.amount ?? null;
  }

  private async putVersion(
    data: StoredEncumbrance,
    effectiveFrom: string,
    effectiveTo: string | null,
    knownDate: string,
    version: number,
  ): Promise<void> {
    await this.store.put<StoredEncumbrance>({
      entityId: entityId(data.assetContractId, data.holder),
      version,
      effectiveFrom,
      effectiveTo,
      knownDate,
      data,
    });
  }
}

function entityId(assetContractId: string, holder: string): string {
  return `enc:${assetContractId}:${holder}`;
}