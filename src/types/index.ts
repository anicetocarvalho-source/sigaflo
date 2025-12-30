// SIGAFLO Type Definitions

export type UserRole = 
  | 'admin_nacional'
  | 'admin_provincial' 
  | 'admin_municipal'
  | 'tecnico_ine'
  | 'tecnico_inca'
  | 'tecnico_idf'
  | 'tecnico_inamet'
  | 'fiscal_florestal'
  | 'exportador'
  | 'publico';

export type WorkflowStatus = 
  | 'draft'
  | 'submitted'
  | 'validated'
  | 'approved'
  | 'issued'
  | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  province?: string;
  municipality?: string;
  avatar?: string;
}

export interface Province {
  id: string;
  name: string;
  code: string;
}

export interface Municipality {
  id: string;
  name: string;
  provinceId: string;
}

export interface Commune {
  id: string;
  name: string;
  municipalityId: string;
}

// Farmer Types
export type FarmerType = 'small' | 'family' | 'large';

export interface Farmer {
  id: string;
  name: string;
  type: FarmerType;
  documentNumber: string;
  phone?: string;
  provinceId: string;
  municipalityId: string;
  communeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  totalArea: number;
  registrationDate: string;
  status: WorkflowStatus;
}

// Agricultural Certificate
export interface AgriculturalCertificate {
  id: string;
  farmerId: string;
  type: string;
  issueDate: string;
  expiryDate: string;
  status: WorkflowStatus;
  qrCode: string;
}

// Climate/Phytosanitary Occurrence
export interface ClimateOccurrence {
  id: string;
  type: 'drought' | 'flood' | 'pest' | 'disease' | 'frost' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportDate: string;
  provinceId: string;
  municipalityId: string;
  description: string;
  affectedArea: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: 'reported' | 'investigating' | 'confirmed' | 'resolved';
}

// Forest Management
export interface ForestLicense {
  id: string;
  type: 'exploitation' | 'transport' | 'export';
  applicantId: string;
  area?: number;
  species?: string[];
  volume?: number;
  issueDate: string;
  expiryDate: string;
  status: WorkflowStatus;
}

export interface TimberLog {
  id: string;
  licenseId: string;
  species: string;
  volume: number;
  originCoordinates: {
    lat: number;
    lng: number;
  };
  harvestDate: string;
  transportDocumentId?: string;
  destinationId?: string;
  trackingCode: string;
}

// Coffee Chain (INCA)
export type CoffeeSemaphore = 'green' | 'yellow' | 'red';

export interface CoffeeLot {
  id: string;
  producerId: string;
  variety: string;
  weight: number;
  harvestDate: string;
  processingMethod: string;
  qualityGrade: string;
  semaphore: CoffeeSemaphore;
  trackingCode: string;
  exportReady: boolean;
}

// Rice Production Module
export interface RiceProduction {
  id: string;
  provinceId: string;
  municipalityId: string;
  year: number;
  season: 'main' | 'secondary';
  cultivatedArea: number;
  harvestedArea: number;
  production: number;
  productivity: number;
  variety?: string;
}

export interface RiceImport {
  id: string;
  year: number;
  month: number;
  volume: number;
  originCountry: string;
  priceCIF: number;
  priceFOB: number;
  averageRealCost: number;
  importer: string;
}

export interface RicePrice {
  id: string;
  provinceId: string;
  date: string;
  retailPrice: number;
  wholesalePrice: number;
  currency: 'AOA' | 'USD';
}

export interface RiceConsumption {
  id: string;
  year: number;
  provinceId?: string;
  perCapitaKg: number;
  totalPopulation: number;
  totalConsumption: number;
}

// KPI Types
export interface KPIData {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
  icon?: string;
}

// Audit Trail
export interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress?: string;
  deviceInfo?: string;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
}
