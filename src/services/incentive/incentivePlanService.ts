
import { S4_API_BASE_URL, s4Request } from '../base/s4BaseService';
import { IncentivePlan, Metadata } from '@/types/incentiveTypes';
import { MOCK_SCHEMES } from '@/constants/incentiveConstants';

/**
 * S/4 HANA Incentive Plan Service
 * Service for interacting with incentive plan data from S/4 HANA
 */

export type IncentiveStatus = 'DRAFT' | 'APPROVED' | 'SIMULATION' | 'PRODUCTION';

export interface IncentivePlanWithStatus extends IncentivePlan {
  status: IncentiveStatus;
  lastExecutionDate?: string;
  hasBeenExecuted?: boolean;
  metadata: Metadata; // Make metadata required in this interface
}

/**
 * Get incentive plans from S/4 HANA or HANA Cloud
 */
export const getIncentivePlans = async (statusFilter?: IncentiveStatus): Promise<IncentivePlanWithStatus[]> => {
  try {
    // In production, this would call your custom OData service or CDS view
    console.log('Fetching incentive plans from S/4 HANA');
    const response = await s4Request<any>(
      'GET',
      `${S4_API_BASE_URL}/zincentivenovo/IncentivePlan`,
      undefined,
      { 
        '$expand': 'CommissionStructure,MeasurementRules,CreditRules,CustomRules',
        '$filter': statusFilter ? `Status eq '${statusFilter}'` : undefined
      }
    );
    
    console.log('Raw response from IncentivePlan API:', response);
    
    // Check if response is valid (has a value property that's an array)
    if (response && response.value && Array.isArray(response.value) && response.value.length > 0) {
      console.log('Valid response structure with', response.value.length, 'plans');
      
      // Transform response to match IncentivePlanWithStatus interface
      return response.value.map((item: any) => ({
        name: item.Name || 'Unnamed Plan',
        description: item.Description || '',
        effectiveStart: item.EffectiveStart || new Date().toISOString().split('T')[0],
        effectiveEnd: item.EffectiveEnd || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        currency: item.Currency || 'USD',
        revenueBase: item.RevenueBase || 'salesOrders',
        participants: item.Participants ? item.Participants.split(',') : ['ALL'],
        status: item.Status || 'DRAFT',
        lastExecutionDate: item.LastExecutionDate,
        hasBeenExecuted: item.HasBeenExecuted || false,
        salesQuota: item.SalesQuota || 100000,
        commissionStructure: {
          tiers: Array.isArray(item.CommissionStructure) 
            ? item.CommissionStructure.map((tier: any) => ({
                from: tier.FromAmount || 0,
                to: tier.ToAmount || 0,
                rate: tier.Rate || 0
              }))
            : []
        },
        measurementRules: {
          primaryMetrics: Array.isArray(item.MeasurementRules?.PrimaryMetrics) 
            ? item.MeasurementRules.PrimaryMetrics.map((metric: any) => ({
                field: metric.Field || 'TotalAmount',
                operator: metric.Operator || '>',
                value: metric.Value || 0, 
                description: metric.Description || 'Net Revenue'
              }))
            : [{ 
                field: 'TotalAmount', 
                operator: '>', 
                value: 0,
                description: item.MeasurementRules?.PrimaryMetric || 'Net Revenue' 
              }],
          minQualification: item.MeasurementRules?.MinQualification || 0,
          adjustments: Array.isArray(item.MeasurementRules?.Adjustments) 
            ? item.MeasurementRules.Adjustments.map((adj: any) => ({
                field: adj.Field || '',
                operator: adj.Operator || '=',
                value: adj.Value || '',
                factor: adj.Factor || 1,
                description: adj.Description || ''
              }))
            : [],
          exclusions: Array.isArray(item.MeasurementRules?.Exclusions)
            ? item.MeasurementRules.Exclusions.map((excl: any) => ({
                field: excl.Field || '',
                operator: excl.Operator || '=',
                value: excl.Value || '',
                description: excl.Description || ''
              }))
            : []
        },
        creditRules: {
          levels: Array.isArray(item.CreditRules)
            ? item.CreditRules.map((cr: any) => ({
                name: cr.Name || '',
                percentage: cr.Percentage || 0
              }))
            : []
        },
        customRules: Array.isArray(item.CustomRules)
          ? item.CustomRules.map((rule: any) => ({
              name: rule.Name || '',
              description: rule.Description || '',
              conditions: Array.isArray(rule.Conditions)
                ? rule.Conditions.map((cond: any) => ({
                    period: cond.Period || 'monthly',
                    metric: cond.Metric || 'sales',
                    operator: cond.Operator || '>',
                    value: cond.Value || 0
                  }))
                : [],
              action: rule.Action || '',
              active: rule.Active || false
            }))
          : []
      }));
    } else {
      // If we get a response but it doesn't have the expected structure
      console.warn('Invalid response structure from incentive plans API, falling back to mock data');
      return getMockIncentivePlans();
    }
  } catch (error) {
    console.error('Error fetching incentive plans:', error);
    return getMockIncentivePlans();
  }
};

/**
 * Helper function to generate mock incentive plans
 */
const getMockIncentivePlans = (): IncentivePlanWithStatus[] => {
  console.log('Using mock incentive plans data');
  return MOCK_SCHEMES.map(mock => ({
    name: mock.name,
    description: mock.description,
    status: 'APPROVED' as const,
    effectiveStart: '2023-01-01',
    effectiveEnd: '2023-12-31',
    currency: 'USD',
    revenueBase: 'salesOrders',
    participants: ['ALL'],
    salesQuota: 100000,
    commissionStructure: { 
      tiers: [
        { from: 0, to: 50000, rate: 0.01 },
        { from: 50001, to: 100000, rate: 0.02 },
        { from: 100001, to: -1, rate: 0.03 }
      ] 
    },
    measurementRules: { 
      primaryMetrics: [{ 
        field: 'TotalAmount', 
        operator: '>', 
        value: 0,
        description: 'Net Revenue' 
      }],
      minQualification: 0,
      adjustments: [],
      exclusions: []
    },
    creditRules: { levels: [] },
    customRules: [],
    hasBeenExecuted: false,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      status: 'APPROVED'
    }
  }));
};

/**
 * Save an incentive plan to S/4 HANA or HANA Cloud
 */
export const saveIncentivePlan = async (plan: IncentivePlanWithStatus): Promise<any> => {
  try {
    // Transform plan to match S/4 HANA entity structure
    const transformedPlan = {
      Name: plan.name,
      Description: plan.description,
      EffectiveStart: plan.effectiveStart,
      EffectiveEnd: plan.effectiveEnd,
      Currency: plan.currency,
      RevenueBase: plan.revenueBase,
      Participants: plan.participants.join(','),
      Status: plan.status || 'DRAFT',
      // Additional transformations would be done here based on your actual entity model
    };
    
    // Create or update the plan
    const response = await s4Request<any>(
      'POST',
      `${S4_API_BASE_URL}/zincentivenovo/IncentivePlan`,
      transformedPlan
    );
    
    return response;
  } catch (error) {
    console.error('Error saving incentive plan:', error);
    throw error;
  }
};

/**
 * Update the status of an incentive plan
 */
export const updateIncentiveStatus = async (
  planId: string, 
  status: IncentiveStatus
): Promise<any> => {
  try {
    return s4Request<any>(
      'PATCH',
      `${S4_API_BASE_URL}/zincentivenovo/IncentivePlan(${planId})`,
      {
        Status: status
      }
    );
  } catch (error) {
    console.error('Error updating incentive plan status:', error);
    throw error;
  }
};

/**
 * Mark a plan as executed
 */
export const markPlanAsExecuted = async (planId: string): Promise<any> => {
  try {
    return s4Request<any>(
      'PATCH',
      `${S4_API_BASE_URL}/zincentivenovo/IncentivePlan(${planId})`,
      {
        HasBeenExecuted: true,
        LastExecutionDate: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Error marking plan as executed:', error);
    throw error;
  }
};

/**
 * Simulate an incentive plan calculation based on real sales data
 */
export const simulateIncentivePlan = async (
  planId: string,
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  try {
    return s4Request<any>(
      'POST',
      `${S4_API_BASE_URL}/zincentivenovo/SimulateIncentive`,
      {
        PlanID: planId,
        EmployeeID: employeeId,
        StartDate: startDate,
        EndDate: endDate
      }
    );
  } catch (error) {
    console.error('Error simulating incentive plan:', error);
    throw error;
  }
};
