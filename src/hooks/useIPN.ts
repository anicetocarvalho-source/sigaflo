import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductiveProfile {
  id: string;
  type: 'farmer' | 'cooperative' | 'company';
  name: string;
  tradeName?: string;
  registrationNumber?: string;
  province?: string;
  municipality?: string;
  registrationDate?: string;
  isActive: boolean;
  
  // Aggregated stats
  totalProductionRecords: number;
  totalCertificates: number;
  totalArea: number;
  activeCertificates: number;
  
  // Reputation components
  productionScore: number;
  complianceScore: number;
  certificationScore: number;
  overallScore: number;
}

export interface ProductionRecord {
  id: string;
  module: 'agriculture' | 'forestry' | 'coffee';
  year: number;
  season?: string;
  product: string;
  quantity: number;
  unit: string;
  quality?: string;
  date: string;
}

export interface CertificationRecord {
  id: string;
  type: string;
  number: string;
  status: string;
  issueDate?: string;
  expiryDate?: string;
  crops?: string[];
}

export interface IncentiveRecord {
  id: string;
  type: 'subsidy' | 'incentive' | 'sanction';
  description: string;
  amount?: number;
  date: string;
  status: string;
}

// Calculate reputation score based on multiple factors
function calculateReputationScore(
  productionRecords: number,
  activeCertificates: number,
  totalCertificates: number,
  rejectedCertificates: number,
  sanctions: number
): { production: number; compliance: number; certification: number; overall: number } {
  // Production score (0-100): based on activity
  const productionScore = Math.min(100, productionRecords * 10);
  
  // Compliance score (0-100): penalized by sanctions
  const complianceScore = Math.max(0, 100 - (sanctions * 20));
  
  // Certification score (0-100): based on active vs rejected ratio
  const certificationScore = totalCertificates > 0
    ? Math.round((activeCertificates / totalCertificates) * 100 - (rejectedCertificates * 10))
    : 50; // Neutral if no certificates
  
  // Overall weighted score
  const overall = Math.round(
    (productionScore * 0.4) + 
    (complianceScore * 0.35) + 
    (Math.max(0, certificationScore) * 0.25)
  );
  
  return {
    production: productionScore,
    compliance: complianceScore,
    certification: Math.max(0, certificationScore),
    overall: Math.min(100, Math.max(0, overall))
  };
}

// Get all productive profiles
export function useProductiveProfiles(filters?: {
  type?: 'farmer' | 'cooperative' | 'company';
  provinceId?: string;
  minScore?: number;
}) {
  return useQuery({
    queryKey: ['ipn-profiles', filters],
    queryFn: async () => {
      // Fetch farmers
      let farmersQuery = supabase
        .from('farmers')
        .select(`
          id,
          name,
          trade_name,
          registration_number,
          farmer_type,
          province_id,
          municipality_id,
          registration_date,
          is_active,
          total_area_ha,
          provinces:province_id(name),
          municipalities:municipality_id(name)
        `);
      
      if (filters?.provinceId) {
        farmersQuery = farmersQuery.eq('province_id', filters.provinceId);
      }
      
      const { data: farmers, error: farmersError } = await farmersQuery;
      if (farmersError) throw farmersError;
      
      // Fetch production history counts per farmer
      const { data: productionCounts } = await supabase
        .from('production_history')
        .select('farmer_id');
      
      // Fetch certificates per farmer
      const { data: certificates } = await supabase
        .from('agricultural_certificates')
        .select('farmer_id, status');
      
      // Aggregate data
      const profiles: ProductiveProfile[] = (farmers || []).map(farmer => {
        const farmerProduction = (productionCounts || []).filter(p => p.farmer_id === farmer.id);
        const farmerCerts = (certificates || []).filter(c => c.farmer_id === farmer.id);
        const activeCerts = farmerCerts.filter(c => c.status === 'issued' || c.status === 'approved');
        const rejectedCerts = farmerCerts.filter(c => c.status === 'rejected');
        
        const scores = calculateReputationScore(
          farmerProduction.length,
          activeCerts.length,
          farmerCerts.length,
          rejectedCerts.length,
          0 // No sanctions tracking yet
        );
        
        const type = farmer.farmer_type === 'cooperative' ? 'cooperative' 
          : farmer.farmer_type === 'company' ? 'company' 
          : 'farmer';
        
        return {
          id: farmer.id,
          type,
          name: farmer.name,
          tradeName: farmer.trade_name,
          registrationNumber: farmer.registration_number,
          province: (farmer.provinces as any)?.name,
          municipality: (farmer.municipalities as any)?.name,
          registrationDate: farmer.registration_date,
          isActive: farmer.is_active ?? true,
          totalProductionRecords: farmerProduction.length,
          totalCertificates: farmerCerts.length,
          totalArea: farmer.total_area_ha || 0,
          activeCertificates: activeCerts.length,
          productionScore: scores.production,
          complianceScore: scores.compliance,
          certificationScore: scores.certification,
          overallScore: scores.overall
        };
      });
      
      // Apply filters
      let filtered = profiles;
      if (filters?.type) {
        filtered = filtered.filter(p => p.type === filters.type);
      }
      if (filters?.minScore !== undefined) {
        filtered = filtered.filter(p => p.overallScore >= filters.minScore);
      }
      
      return filtered.sort((a, b) => b.overallScore - a.overallScore);
    }
  });
}

// Get single productive profile with full details
export function useProductiveProfile(id: string) {
  return useQuery({
    queryKey: ['ipn-profile', id],
    queryFn: async () => {
      // Fetch farmer details
      const { data: farmer, error: farmerError } = await supabase
        .from('farmers')
        .select(`
          *,
          provinces:province_id(name),
          municipalities:municipality_id(name),
          communes:commune_id(name)
        `)
        .eq('id', id)
        .single();
      
      if (farmerError) throw farmerError;
      
      // Fetch production history
      const { data: production } = await supabase
        .from('production_history')
        .select('*')
        .eq('farmer_id', id)
        .order('year', { ascending: false });
      
      // Fetch certificates
      const { data: certificates } = await supabase
        .from('agricultural_certificates')
        .select('*')
        .eq('farmer_id', id)
        .order('created_at', { ascending: false });
      
      const activeCerts = (certificates || []).filter(c => c.status === 'issued' || c.status === 'approved');
      const rejectedCerts = (certificates || []).filter(c => c.status === 'rejected');
      
      const scores = calculateReputationScore(
        (production || []).length,
        activeCerts.length,
        (certificates || []).length,
        rejectedCerts.length,
        0
      );
      
      const type = farmer.farmer_type === 'cooperative' ? 'cooperative' 
        : farmer.farmer_type === 'company' ? 'company' 
        : 'farmer';
      
      return {
        profile: {
          id: farmer.id,
          type,
          name: farmer.name,
          tradeName: farmer.trade_name,
          registrationNumber: farmer.registration_number,
          biNif: farmer.bi_nif,
          phone: farmer.phone,
          email: farmer.email,
          province: (farmer.provinces as any)?.name,
          municipality: (farmer.municipalities as any)?.name,
          commune: (farmer.communes as any)?.name,
          address: farmer.address,
          village: farmer.village,
          registrationDate: farmer.registration_date,
          isActive: farmer.is_active ?? true,
          totalArea: farmer.total_area_ha || 0,
          cultivatedArea: farmer.cultivated_area_ha || 0,
          mainCrops: farmer.main_crops || [],
          irrigationType: farmer.irrigation_type,
          latitude: farmer.latitude,
          longitude: farmer.longitude,
          productionScore: scores.production,
          complianceScore: scores.compliance,
          certificationScore: scores.certification,
          overallScore: scores.overall
        },
        productionHistory: (production || []).map(p => ({
          id: p.id,
          module: 'agriculture' as const,
          year: p.year,
          season: p.season,
          product: p.crop_type,
          quantity: p.actual_yield_kg || p.expected_yield_kg || 0,
          unit: 'kg',
          quality: p.quality_grade,
          date: p.harvest_date || p.created_at
        })),
        certificationHistory: (certificates || []).map(c => ({
          id: c.id,
          type: c.certificate_type,
          number: c.certificate_number,
          status: c.status,
          issueDate: c.issue_date,
          expiryDate: c.expiry_date,
          crops: c.crops
        })),
        incentivesHistory: [] as IncentiveRecord[] // Placeholder for future integration
      };
    },
    enabled: !!id
  });
}

// Get IPN statistics
export function useIPNStats() {
  return useQuery({
    queryKey: ['ipn-stats'],
    queryFn: async () => {
      const { data: farmers } = await supabase
        .from('farmers')
        .select('id, farmer_type, is_active');
      
      const { data: production } = await supabase
        .from('production_history')
        .select('farmer_id');
      
      const { data: certificates } = await supabase
        .from('agricultural_certificates')
        .select('farmer_id, status');
      
      const totalProfiles = (farmers || []).length;
      const activeProfiles = (farmers || []).filter(f => f.is_active).length;
      const cooperatives = (farmers || []).filter(f => f.farmer_type === 'cooperative').length;
      const companies = (farmers || []).filter(f => f.farmer_type === 'company').length;
      
      // Calculate average scores
      const farmersWithProduction = new Set((production || []).map(p => p.farmer_id)).size;
      const farmersWithCerts = new Set((certificates || []).map(c => c.farmer_id)).size;
      
      const productionCoverage = totalProfiles > 0 
        ? Math.round((farmersWithProduction / totalProfiles) * 100) 
        : 0;
      
      const certificationCoverage = totalProfiles > 0 
        ? Math.round((farmersWithCerts / totalProfiles) * 100) 
        : 0;
      
      return {
        totalProfiles,
        activeProfiles,
        cooperatives,
        companies,
        individuals: totalProfiles - cooperatives - companies,
        totalProductionRecords: (production || []).length,
        totalCertificates: (certificates || []).length,
        productionCoverage,
        certificationCoverage
      };
    }
  });
}
