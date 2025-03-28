
export interface Tier {
  from: number;
  to: number;
  rate: number;
}

export interface Adjustment {
  field: string;
  operator: string;
  value: number;
  factor: number;
  description: string;
}

export interface Exclusion {
  field: string;
  operator: string;
  value: number;
  description: string;
}

export interface PrimaryMetric {
  field: string;
  operator: string;
  value: number;
  description: string;
}

export interface CreditLevel {
  name: string;
  percentage: number;
}

export interface RuleCondition {
  period: string;
  metric: string;
  operator: string;
  value: number;
  field?: string;
}

export interface CustomRule {
  name: string;
  description: string;
  conditions: RuleCondition[];
  action: string;
  active: boolean;
  factor?: number;
  value?: number;
}

export interface MeasurementRules {
  primaryMetrics: PrimaryMetric[];
  minQualification: number;
  adjustments: Adjustment[];
  exclusions: Exclusion[];
}

export interface CommissionStructure {
  tiers: Tier[];
}

export interface CreditRules {
  levels: CreditLevel[];
}

export interface Metadata {
  createdAt: string;
  updatedAt: string;
  version: number;
  status: string;
}

export interface IncentivePlan {
  name: string;
  description: string;
  effectiveStart: string;
  effectiveEnd: string;
  currency: string;
  revenueBase: string;
  participants: string[];
  commissionStructure: {
    tiers: Tier[];
  };
  measurementRules: MeasurementRules;
  creditRules: {
    levels: CreditLevel[];
  };
  customRules: CustomRule[];
  salesQuota: number;
  metadata?: Metadata;
  schemeId?: string;
}
