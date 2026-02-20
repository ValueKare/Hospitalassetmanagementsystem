// Central export file for all stores
export { useSuperAdminStore } from './useSuperAdminStore';
export type {
  SuperAdminState,
  HospitalInfo,
  DashboardSummary,
  DepartmentData,
  UtilizationData,
  CostData,
  AlertData,
  EntityInfo,
} from './useSuperAdminStore';

export { useAssetStore } from './useAssetStore';
export type {
  AssetState,
  Asset,
  AssetMetadata,
  HospitalAssetSummary,
} from './useAssetStore';
