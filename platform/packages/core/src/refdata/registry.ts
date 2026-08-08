import type { BitemporalStore } from "../store/bitemporal.js";
import { VersionedReference } from "./versioned.js";
import type {
  Book,
  CalendarDef,
  ConnectedClient,
  CounterpartyMaster,
  CurrencyDef,
  EconomicGroup,
  FallbackDefinition,
  GlLine,
  IndexDefinition,
  LegalEntity,
  ProductDefinition,
} from "./domains.js";

/**
 * P0-01 bitemporal reference data core. One typed store per D1 domain, each
 * independently versioned. Cross-domain lookups resolve here so
 * consumers get a version-addressable read from a single entry point.
 */
export class ReferenceData {
  readonly legalEntities: VersionedReference<LegalEntity>;
  readonly counterparts: VersionedReference<CounterpartyMaster>;
  readonly economicGroups: VersionedReference<EconomicGroup>;
  readonly connectedClients: VersionedReference<ConnectedClient>;
  readonly books: VersionedReference<Book>;
  readonly calendars: VersionedReference<CalendarDef>;
  readonly indexes: VersionedReference<IndexDefinition>;
  readonly fallbacks: VersionedReference<FallbackDefinition>;
  readonly currencies: VersionedReference<CurrencyDef>;
  readonly glLines: VersionedReference<GlLine>;
  readonly products: VersionedReference<ProductDefinition>;

  private readonly store: BitemporalStore;

  constructor(store: BitemporalStore, actor = "refdata-admin") {
    this.store = store;
    this.legalEntities = new VersionedReference(store, "legal", actor);
    this.counterparts = new VersionedReference(store, "counterparty", actor);
    this.economicGroups = new VersionedReference(store, "economic-group", actor);
    this.connectedClients = new VersionedReference(store, "connected-client", actor);
    this.books = new VersionedReference(store, "book", actor);
    this.calendars = new VersionedReference(store, "calendar", actor);
    this.indexes = new VersionedReference(store, "index", actor);
    this.fallbacks = new VersionedReference(store, "fallback", actor);
    this.currencies = new VersionedReference(store, "currency", actor);
    this.glLines = new VersionedReference(store, "gl", actor);
    this.products = new VersionedReference(store, "product", actor);
  }
}