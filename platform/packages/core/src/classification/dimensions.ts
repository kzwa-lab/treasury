export const NOT_APPLICABLE = "NA";

export const DIMENSIONS = [
  "contractualMaturityBucket",
  "behaviouralMaturityBucket",
  "repricingBasis",
  "currency",
  "glLine",
  "counterpartyType",
  "accountingClassification",
  "regulatoryClassification",
  "bookIntent",
  "hedgeDesignation",
  "primaryRiskType",
  "eclStage",
  "heldForSale",
  "capitalInstrumentClassification",
  "issuerObligorId",
] as const;

export type ClassificationDimension = (typeof DIMENSIONS)[number];

export type Classification = Readonly<Record<ClassificationDimension, string>>;

export type InputVector = Readonly<Record<string, string | boolean | number>>;

export const RISK_BEHAVIOUR_DIMENSIONS: readonly ClassificationDimension[] = [
  "contractualMaturityBucket",
  "behaviouralMaturityBucket",
  "repricingBasis",
  "currency",
  "glLine",
  "counterpartyType",
  "accountingClassification",
  "regulatoryClassification",
];

export const PRESENTATION_ACCOUNTING_DIMENSIONS: readonly ClassificationDimension[] = [
  "bookIntent",
  "hedgeDesignation",
  "primaryRiskType",
  "eclStage",
  "heldForSale",
  "capitalInstrumentClassification",
  "issuerObligorId",
];

export const EMPTY_CLASSIFICATION: Classification = Object.freeze({
  contractualMaturityBucket: "UNCLASSIFIED",
  behaviouralMaturityBucket: "UNCLASSIFIED",
  repricingBasis: "UNCLASSIFIED",
  currency: "UNCLASSIFIED",
  glLine: "UNCLASSIFIED",
  counterpartyType: "UNCLASSIFIED",
  accountingClassification: "UNCLASSIFIED",
  regulatoryClassification: "UNCLASSIFIED",
  bookIntent: "UNCLASSIFIED",
  hedgeDesignation: "UNCLASSIFIED",
  primaryRiskType: "UNCLASSIFIED",
  eclStage: "UNCLASSIFIED",
  heldForSale: "UNCLASSIFIED",
  capitalInstrumentClassification: "UNCLASSIFIED",
  issuerObligorId: "UNCLASSIFIED",
});