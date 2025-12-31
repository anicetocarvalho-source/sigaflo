import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to generate random coordinates within Angola
const generateAngolaCoordinates = () => {
  const lat = -5.5 - Math.random() * 12;
  const lng = 12 + Math.random() * 12;
  return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
};

// Helper to generate random date within range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Angolan names generator
const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Luísa', 'Miguel', 'Teresa', 'António', 'Francisca', 'Manuel', 'Rosa', 'José', 'Catarina', 'Paulo', 'Helena', 'Fernando', 'Isabel', 'Ricardo', 'Margarida'];
const lastNames = ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Sousa', 'Fernandes', 'Gonçalves', 'Gomes', 'Lopes', 'Almeida', 'Ribeiro', 'Pinto', 'Carvalho', 'Teixeira', 'Moreira', 'Correia'];

const generateName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

// Crop types common in Angola
const crops = ['Milho', 'Mandioca', 'Feijão', 'Arroz', 'Amendoim', 'Batata-doce', 'Sorgo', 'Banana', 'Café', 'Algodão'];

// Valid enum/constraint values from database
const FARMER_TYPES = ['individual', 'family', 'cooperative', 'field_school', 'company'];
const OCCURRENCE_TYPES = ['drought', 'flood', 'pest', 'disease', 'frost', 'hail', 'fire', 'other'];
const OCCURRENCE_SOURCES = ['backoffice', 'sms', 'ivr', 'mobile_app'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const OCCURRENCE_STATUSES = ['reported', 'investigating', 'confirmed', 'mitigating', 'resolved'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const results: Record<string, { inserted: number; errors: string[] }> = {};

    // 1. Get provinces
    console.log('Fetching provinces...');
    const { data: provinces, error: provError } = await supabase
      .from('provinces')
      .select('id, name');
    
    if (provError) throw new Error(`Failed to fetch provinces: ${provError.message}`);
    if (!provinces?.length) throw new Error('No provinces found');

    const provinceIds = provinces.map(p => p.id);
    console.log(`Found ${provinces.length} provinces`);

    // 2. Get municipalities for each province
    const { data: municipalities, error: munError } = await supabase
      .from('municipalities')
      .select('id, name, province_id');
    
    if (munError) throw new Error(`Failed to fetch municipalities: ${munError.message}`);

    const municipalitiesByProvince: Record<string, string[]> = {};
    municipalities?.forEach(m => {
      if (!municipalitiesByProvince[m.province_id]) {
        municipalitiesByProvince[m.province_id] = [];
      }
      municipalitiesByProvince[m.province_id].push(m.id);
    });

    // Get communes
    const { data: communes } = await supabase.from('communes').select('id, municipality_id');
    const communesByMunicipality: Record<string, string[]> = {};
    communes?.forEach(c => {
      if (!communesByMunicipality[c.municipality_id]) {
        communesByMunicipality[c.municipality_id] = [];
      }
      communesByMunicipality[c.municipality_id].push(c.id);
    });

    const currentYear = new Date().getFullYear();

    // ========== FARMERS ==========
    console.log('Seeding farmers...');
    const farmerStatuses = ['draft', 'submitted', 'validated', 'approved', 'rejected'];
    const irrigationTypes = ['sequeiro', 'irrigado', 'misto'];
    const farmers: any[] = [];

    for (let i = 0; i < 150; i++) {
      const provinceId = provinceIds[Math.floor(Math.random() * provinceIds.length)];
      const provinceMunicipalities = municipalitiesByProvince[provinceId] || [];
      const municipalityId = provinceMunicipalities.length > 0 
        ? provinceMunicipalities[Math.floor(Math.random() * provinceMunicipalities.length)]
        : null;
      
      let communeId = null;
      if (municipalityId) {
        const munCommunes = communesByMunicipality[municipalityId] || [];
        communeId = munCommunes.length > 0 
          ? munCommunes[Math.floor(Math.random() * munCommunes.length)]
          : null;
      }

      const coords = generateAngolaCoordinates();
      const farmerType = FARMER_TYPES[Math.floor(Math.random() * FARMER_TYPES.length)];
      const cropCount = Math.floor(Math.random() * 4) + 1;
      const selectedCrops = [...crops].sort(() => Math.random() - 0.5).slice(0, cropCount);
      const totalArea = parseFloat((Math.random() * 50 + 0.5).toFixed(2));

      farmers.push({
        name: generateName(),
        farmer_type: farmerType,
        bi_nif: `BI${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}LA`,
        phone: `+244 9${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        email: Math.random() > 0.5 ? `agricultor${i}@demo.ao` : null,
        province_id: provinceId,
        municipality_id: municipalityId,
        commune_id: communeId,
        village: `Aldeia ${Math.floor(Math.random() * 100)}`,
        address: `Rua Principal, nº ${Math.floor(Math.random() * 200)}`,
        latitude: coords.lat,
        longitude: coords.lng,
        total_area_ha: totalArea,
        cultivated_area_ha: parseFloat((totalArea * (0.5 + Math.random() * 0.4)).toFixed(2)),
        main_crops: selectedCrops,
        irrigation_type: irrigationTypes[Math.floor(Math.random() * irrigationTypes.length)],
        status: farmerStatuses[Math.floor(Math.random() * farmerStatuses.length)],
        is_active: Math.random() > 0.1,
        registration_date: randomDate(new Date(2022, 0, 1), new Date()).toISOString().split('T')[0],
        household_members_count: Math.floor(Math.random() * 10) + 1,
        dependents_count: Math.floor(Math.random() * 6),
        family_workers_count: Math.floor(Math.random() * 5),
        head_of_household: Math.random() > 0.3,
      });
    }

    // Insert farmers in smaller batches to avoid trigger conflicts
    let farmersInserted = 0;
    const batchSize = 10;
    const farmerErrors: string[] = [];
    
    for (let batch = 0; batch < farmers.length; batch += batchSize) {
      const farmerBatch = farmers.slice(batch, batch + batchSize);
      const { error: batchError } = await supabase.from('farmers').insert(farmerBatch);
      if (batchError) {
        farmerErrors.push(batchError.message);
      } else {
        farmersInserted += farmerBatch.length;
      }
    }
    
    results.farmers = {
      inserted: farmersInserted,
      errors: farmerErrors
    };

    // Get inserted farmers
    const { data: insertedFarmers } = await supabase
      .from('farmers')
      .select('id, province_id, main_crops')
      .order('created_at', { ascending: false })
      .limit(150);

    console.log(`Farmers: ${results.farmers.inserted} inserted`);

    // ========== PRODUCTION HISTORY ==========
    console.log('Seeding production history...');
    const productions: any[] = [];
    const seasons = ['main', 'secondary'];
    const qualityGrades = ['A', 'B', 'C'];

    for (const farmer of (insertedFarmers || [])) {
      const numRecords = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numRecords; i++) {
        const year = 2020 + Math.floor(Math.random() * 5);
        const cropType = (farmer.main_crops as string[])?.[0] || 'Milho';
        const areaPlanted = parseFloat((Math.random() * 10 + 0.5).toFixed(2));
        const expectedYield = parseFloat((areaPlanted * (Math.random() * 3000 + 500)).toFixed(2));
        const actualYield = parseFloat((expectedYield * (0.6 + Math.random() * 0.5)).toFixed(2));

        productions.push({
          farmer_id: farmer.id,
          year,
          season: seasons[Math.floor(Math.random() * seasons.length)],
          crop_type: cropType,
          area_planted_ha: areaPlanted,
          expected_yield_kg: expectedYield,
          actual_yield_kg: actualYield,
          quality_grade: qualityGrades[Math.floor(Math.random() * qualityGrades.length)],
          harvest_date: `${year}-${String(Math.floor(Math.random() * 6) + 4).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          notes: Math.random() > 0.7 ? 'Dados de demonstração' : null,
        });
      }
    }

    const { error: prodError } = await supabase.from('production_history').insert(productions);
    results.production_history = {
      inserted: prodError ? 0 : productions.length,
      errors: prodError ? [prodError.message] : []
    };

    // Get production records for certificates
    const { data: prodRecords } = await supabase
      .from('production_history')
      .select('id, farmer_id, year, season, crop_type')
      .order('created_at', { ascending: false })
      .limit(100);

    console.log(`Production: ${results.production_history.inserted} inserted`);

    // ========== AGRICULTURAL CERTIFICATES ==========
    console.log('Seeding certificates...');
    const certificates: any[] = [];
    const certStatuses = ['draft', 'submitted', 'validated', 'approved', 'issued', 'rejected'];
    const certTypes = ['producer', 'origin', 'organic', 'quality'];

    for (const prod of (prodRecords || []).slice(0, 80)) {
      const status = certStatuses[Math.floor(Math.random() * certStatuses.length)];
      const issueDate = status === 'issued' ? randomDate(new Date(2023, 0, 1), new Date()).toISOString() : null;
      
      certificates.push({
        farmer_id: prod.farmer_id,
        production_history_id: prod.id,
        certificate_number: `CERT-${prod.year}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
        certificate_type: certTypes[Math.floor(Math.random() * certTypes.length)],
        year: prod.year,
        season: prod.season,
        crops: [prod.crop_type],
        status,
        issue_date: issueDate,
        expiry_date: issueDate ? new Date(new Date(issueDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
        total_area_ha: parseFloat((Math.random() * 20 + 1).toFixed(2)),
        total_quantity_kg: parseFloat((Math.random() * 50000 + 1000).toFixed(2)),
      });
    }

    const { error: certError } = await supabase.from('agricultural_certificates').insert(certificates);
    results.agricultural_certificates = {
      inserted: certError ? 0 : certificates.length,
      errors: certError ? [certError.message] : []
    };

    console.log(`Certificates: ${results.agricultural_certificates.inserted} inserted`);

    // ========== CLIMATE OCCURRENCES ==========
    console.log('Seeding climate occurrences...');
    const occurrences: any[] = [];

    for (let i = 0; i < 100; i++) {
      const provinceId = provinceIds[Math.floor(Math.random() * provinceIds.length)];
      const provinceMunicipalities = municipalitiesByProvince[provinceId] || [];
      const municipalityId = provinceMunicipalities.length > 0 
        ? provinceMunicipalities[Math.floor(Math.random() * provinceMunicipalities.length)]
        : null;
      
      const coords = generateAngolaCoordinates();
      const occType = OCCURRENCE_TYPES[Math.floor(Math.random() * OCCURRENCE_TYPES.length)];
      const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
      const status = OCCURRENCE_STATUSES[Math.floor(Math.random() * OCCURRENCE_STATUSES.length)];
      const source = OCCURRENCE_SOURCES[Math.floor(Math.random() * OCCURRENCE_SOURCES.length)];

      occurrences.push({
        title: `Ocorrência de ${occType} - ${provinces.find(p => p.id === provinceId)?.name || 'Angola'}`,
        occurrence_type: occType,
        severity,
        status,
        source,
        province_id: provinceId,
        municipality_id: municipalityId,
        latitude: coords.lat,
        longitude: coords.lng,
        description: `Registo de ${occType} com severidade ${severity}. Dados de demonstração.`,
        affected_area_ha: parseFloat((Math.random() * 500 + 10).toFixed(2)),
        affected_farmers_count: Math.floor(Math.random() * 100) + 1,
        estimated_loss_aoa: parseFloat((Math.random() * 50000000 + 100000).toFixed(2)),
        report_date: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
        resolution_date: status === 'resolved' ? randomDate(new Date(2023, 6, 1), new Date()).toISOString() : null,
      });
    }

    const { error: occError } = await supabase.from('climate_occurrences').insert(occurrences);
    results.climate_occurrences = {
      inserted: occError ? 0 : occurrences.length,
      errors: occError ? [occError.message] : []
    };

    console.log(`Occurrences: ${results.climate_occurrences.inserted} inserted`);

    // ========== RICE PRODUCTION ==========
    console.log('Seeding rice production...');
    const riceProduction: any[] = [];

    for (const province of provinces) {
      for (let year = 2020; year <= 2024; year++) {
        for (const season of seasons) {
          const cultivatedArea = parseFloat((Math.random() * 5000 + 500).toFixed(2));
          const harvestedArea = parseFloat((cultivatedArea * (0.7 + Math.random() * 0.25)).toFixed(2));
          const productionTonnes = parseFloat((harvestedArea * (Math.random() * 3 + 1.5)).toFixed(2));
          const productivityKgHa = parseFloat(((productionTonnes * 1000) / harvestedArea).toFixed(2));

          riceProduction.push({
            province_id: province.id,
            municipality_id: (municipalitiesByProvince[province.id] || [])[0] || null,
            year,
            season,
            cultivated_area_ha: cultivatedArea,
            harvested_area_ha: harvestedArea,
            production_tonnes: productionTonnes,
            variety: ['Indica', 'Japonica', 'Híbrido', 'Local'][Math.floor(Math.random() * 4)],
            irrigation_type: ['rainfed', 'irrigated', 'mixed'][Math.floor(Math.random() * 3)],
          });
        }
      }
    }

    const { error: riceError } = await supabase.from('rice_production').insert(riceProduction);
    results.rice_production = {
      inserted: riceError ? 0 : riceProduction.length,
      errors: riceError ? [riceError.message] : []
    };

    console.log(`Rice production: ${results.rice_production.inserted} inserted`);

    // ========== RICE IMPORTS ==========
    console.log('Seeding rice imports...');
    const riceImports: any[] = [];
    const importerNames = ['Angola Rice Trading', 'Luanda Foods Import', 'Benguela Grains', 'Cabinda Trading Co.', 'Huambo Cereais'];
    const countries = ['Thailand', 'Vietnam', 'India', 'Pakistan', 'China', 'Brazil'];

    for (let year = 2020; year <= 2024; year++) {
      for (let month = 1; month <= 12; month++) {
        if (year === 2024 && month > new Date().getMonth() + 1) continue;
        
        const numImports = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numImports; i++) {
          const volumeTonnes = parseFloat((Math.random() * 50000 + 5000).toFixed(2));
          const priceFob = parseFloat((Math.random() * 200 + 350).toFixed(2));
          const priceCif = parseFloat((priceFob * (1.1 + Math.random() * 0.15)).toFixed(2));

          riceImports.push({
            year,
            month,
            volume_tonnes: volumeTonnes,
            origin_country: countries[Math.floor(Math.random() * countries.length)],
            price_fob_usd: priceFob,
            price_cif_usd: priceCif,
            total_value_usd: parseFloat((volumeTonnes * priceCif).toFixed(2)),
            importer_name: importerNames[Math.floor(Math.random() * importerNames.length)],
            rice_type: ['Long grain', 'Medium grain', 'Broken rice', 'Parboiled'][Math.floor(Math.random() * 4)],
          });
        }
      }
    }

    const { error: impError } = await supabase.from('rice_imports').insert(riceImports);
    results.rice_imports = {
      inserted: impError ? 0 : riceImports.length,
      errors: impError ? [impError.message] : []
    };

    console.log(`Rice imports: ${results.rice_imports.inserted} inserted`);

    // ========== RICE PRICES ==========
    console.log('Seeding rice prices...');
    const ricePrices: any[] = [];

    for (const province of provinces) {
      for (let year = 2023; year <= 2024; year++) {
        for (let month = 1; month <= 12; month++) {
          if (year === 2024 && month > new Date().getMonth() + 1) continue;

          const retailPrice = parseFloat((Math.random() * 300 + 400).toFixed(2));
          const wholesalePrice = parseFloat((retailPrice * (0.7 + Math.random() * 0.15)).toFixed(2));

          ricePrices.push({
            province_id: province.id,
            recorded_date: `${year}-${String(month).padStart(2, '0')}-15`,
            retail_price_aoa: retailPrice,
            wholesale_price_aoa: wholesalePrice,
            currency: 'AOA',
            rice_type: ['Local', 'Importado'][Math.floor(Math.random() * 2)],
            market_name: `Mercado Central de ${province.name}`,
          });
        }
      }
    }

    const { error: priceError } = await supabase.from('rice_prices').insert(ricePrices);
    results.rice_prices = {
      inserted: priceError ? 0 : ricePrices.length,
      errors: priceError ? [priceError.message] : []
    };

    console.log(`Rice prices: ${results.rice_prices.inserted} inserted`);

    // ========== RICE CONSUMPTION ==========
    console.log('Seeding rice consumption...');
    const riceConsumption: any[] = [];

    for (let year = 2020; year <= 2024; year++) {
      for (const province of provinces) {
        const population = Math.floor(Math.random() * 3000000 + 500000);
        const perCapitaKg = parseFloat((Math.random() * 15 + 20).toFixed(2));

        riceConsumption.push({
          year,
          province_id: province.id,
          per_capita_kg: perCapitaKg,
          population,
          data_source: 'demo_data',
        });
      }

      // National level
      const nationalPop = 35000000 + Math.floor(Math.random() * 2000000);
      const nationalPerCapita = parseFloat((Math.random() * 10 + 22).toFixed(2));
      
      riceConsumption.push({
        year,
        province_id: null,
        per_capita_kg: nationalPerCapita,
        population: nationalPop,
        data_source: 'demo_data',
      });
    }

    const { error: consError } = await supabase.from('rice_consumption').insert(riceConsumption);
    results.rice_consumption = {
      inserted: consError ? 0 : riceConsumption.length,
      errors: consError ? [consError.message] : []
    };

    console.log(`Rice consumption: ${results.rice_consumption.inserted} inserted`);

    // ========== RICE ALERTS ==========
    console.log('Seeding rice alerts...');
    const riceAlerts: any[] = [];
    const alertTypes = ['price_spike', 'import_delay', 'production_shortage', 'stock_low', 'quality_issue'];
    const alertSeverities = ['low', 'medium', 'high', 'critical'];

    for (let i = 0; i < 30; i++) {
      const provinceId = provinceIds[Math.floor(Math.random() * provinceIds.length)];
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      riceAlerts.push({
        alert_type: alertType,
        severity: alertSeverities[Math.floor(Math.random() * alertSeverities.length)],
        title: `Alerta de ${alertType.replace(/_/g, ' ')}`,
        message: `Alerta gerado automaticamente para demonstração. Tipo: ${alertType}`,
        province_id: provinceId,
        is_read: Math.random() > 0.5,
        is_resolved: Math.random() > 0.7,
      });
    }

    const { error: alertError } = await supabase.from('rice_alerts').insert(riceAlerts);
    results.rice_alerts = {
      inserted: alertError ? 0 : riceAlerts.length,
      errors: alertError ? [alertError.message] : []
    };

    console.log(`Rice alerts: ${results.rice_alerts.inserted} inserted`);

    // ========== RICE PARAMETERS ==========
    console.log('Seeding rice parameters...');
    const riceParams = [
      { parameter_name: 'target_self_sufficiency', parameter_value: '60', unit: '%', description: 'Meta de autossuficiência' },
      { parameter_name: 'critical_stock_days', parameter_value: '45', unit: 'dias', description: 'Dias críticos de estoque' },
      { parameter_name: 'price_alert_threshold', parameter_value: '15', unit: '%', description: 'Limiar de alerta de preço' },
      { parameter_name: 'import_dependency_max', parameter_value: '50', unit: '%', description: 'Dependência máxima de importação' },
      { parameter_name: 'per_capita_target', parameter_value: '30', unit: 'kg/ano', description: 'Meta consumo per capita' },
    ];

    // Use upsert to handle existing parameters
    const { error: paramError } = await supabase.from('rice_parameters').upsert(riceParams, { onConflict: 'parameter_name' });
    results.rice_parameters = {
      inserted: paramError ? 0 : riceParams.length,
      errors: paramError ? [paramError.message] : []
    };

    console.log(`Rice parameters: ${results.rice_parameters.inserted} inserted`);

    // ========== INCENTIVE PROGRAMS ==========
    console.log('Seeding incentive programs...');
    const incentivePrograms = [
      {
        code: 'PROG-AGR-001',
        name: 'Apoio à Pequena Agricultura Familiar',
        description: 'Programa de subsídios para agricultores familiares com menos de 5 hectares',
        program_type: 'subsidy',
        sector: 'agriculture',
        budget_aoa: 500000000,
        allocated_aoa: 250000000,
        disbursed_aoa: 150000000,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        status: 'active',
        target_beneficiaries: 1000,
        actual_beneficiaries: 450,
      },
      {
        code: 'PROG-ARZ-002',
        name: 'Incentivo à Produção de Arroz',
        description: 'Programa de crédito subsidiado para produtores de arroz',
        program_type: 'credit',
        sector: 'rice',
        budget_aoa: 750000000,
        allocated_aoa: 400000000,
        disbursed_aoa: 200000000,
        start_date: '2024-01-01',
        end_date: '2025-06-30',
        status: 'active',
        target_beneficiaries: 500,
        actual_beneficiaries: 180,
      },
      {
        code: 'PROG-CAF-003',
        name: 'Revitalização Cafeeira',
        description: 'Apoio técnico e financeiro para produtores de café',
        program_type: 'technical_support',
        sector: 'coffee',
        budget_aoa: 300000000,
        allocated_aoa: 200000000,
        disbursed_aoa: 100000000,
        start_date: '2023-06-01',
        end_date: '2025-12-31',
        status: 'active',
        target_beneficiaries: 300,
        actual_beneficiaries: 120,
      },
    ];

    const { error: progError } = await supabase.from('incentive_programs').upsert(incentivePrograms, { onConflict: 'code' });
    results.incentive_programs = {
      inserted: progError ? 0 : incentivePrograms.length,
      errors: progError ? [progError.message] : []
    };
    console.log(`Incentive programs: ${results.incentive_programs?.inserted || 0} inserted`);

    // ========== FINANCIAL PROFILES ==========
    console.log('Seeding financial profiles...');
    const financialProfiles: any[] = [];
    const farmerIdsForProfiles = (insertedFarmers || []).slice(0, 50).map(f => f.id);

    for (const farmerId of farmerIdsForProfiles) {
      const productionYears = Math.floor(Math.random() * 5) + 1;
      const creditScore = Math.floor(Math.random() * 60) + 30;
      const riskClass = creditScore >= 70 ? 'low' : creditScore >= 45 ? 'medium' : 'high';
      
      financialProfiles.push({
        farmer_id: farmerId,
        production_years: productionYears,
        production_stability_pct: Math.floor(Math.random() * 40) + 50,
        average_annual_production_kg: Math.floor(Math.random() * 10000) + 2000,
        main_crops: ['Milho', 'Feijão'].slice(0, Math.floor(Math.random() * 2) + 1),
        productive_area_ha: parseFloat((Math.random() * 20 + 1).toFixed(2)),
        climate_events_count: Math.floor(Math.random() * 5),
        territorial_risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        credit_score: creditScore,
        risk_classification: riskClass,
        is_credit_eligible: creditScore >= 40 && productionYears >= 2,
        is_insurance_eligible: productionYears >= 1,
        last_calculated_at: new Date().toISOString(),
      });
    }

    let profilesInserted = 0;
    for (const profile of financialProfiles) {
      const { error } = await supabase.from('farmer_financial_profiles').upsert(profile, { onConflict: 'farmer_id' });
      if (!error) profilesInserted++;
    }
    results.financial_profiles = {
      inserted: profilesInserted,
      errors: []
    };
    console.log(`Financial profiles: ${profilesInserted} inserted`);

    // ========== DATA LAB DATASETS ==========
    console.log('Seeding data lab datasets...');
    const datasets = [
      { code: 'DS-FARM', name: 'Agricultores', source_table: 'farmers', data_category: 'agriculture', sensitivity_level: 'medium', is_active: true },
      { code: 'DS-PROD', name: 'Produção Agrícola', source_table: 'production_history', data_category: 'agriculture', sensitivity_level: 'low', is_active: true },
      { code: 'DS-CERT', name: 'Certificados', source_table: 'agricultural_certificates', data_category: 'agriculture', sensitivity_level: 'low', is_active: true },
      { code: 'DS-RICE', name: 'Arroz - Produção', source_table: 'rice_production', data_category: 'rice', sensitivity_level: 'low', is_active: true },
      { code: 'DS-CLIM', name: 'Ocorrências Climáticas', source_table: 'climate_occurrences', data_category: 'climate', sensitivity_level: 'low', is_active: true },
    ];

    const { error: dsError } = await supabase.from('data_lab_datasets').upsert(datasets, { onConflict: 'code' });
    results.data_lab_datasets = {
      inserted: dsError ? 0 : datasets.length,
      errors: dsError ? [dsError.message] : []
    };
    console.log(`Data lab datasets: ${results.data_lab_datasets?.inserted || 0} inserted`);

    // ========== DATA LAB ORGANIZATIONS ==========
    console.log('Seeding data lab organizations...');
    const organizations = [
      { code: 'ORG-UAN', name: 'Universidade Agostinho Neto', organization_type: 'university', country: 'Angola', is_active: true },
      { code: 'ORG-IDA', name: 'Instituto de Desenvolvimento Agrário', organization_type: 'government', country: 'Angola', is_active: true },
      { code: 'ORG-FAO', name: 'FAO Angola', organization_type: 'international', country: 'Angola', is_active: true },
    ];

    const { error: orgError } = await supabase.from('data_lab_organizations').upsert(organizations, { onConflict: 'code' });
    results.data_lab_organizations = {
      inserted: orgError ? 0 : organizations.length,
      errors: orgError ? [orgError.message] : []
    };
    console.log(`Data lab organizations: ${results.data_lab_organizations?.inserted || 0} inserted`);

    // Summary
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      results,
      totals: {
        farmers: results.farmers?.inserted || 0,
        production_history: results.production_history?.inserted || 0,
        certificates: results.agricultural_certificates?.inserted || 0,
        climate_occurrences: results.climate_occurrences?.inserted || 0,
        rice_production: results.rice_production?.inserted || 0,
        rice_imports: results.rice_imports?.inserted || 0,
        rice_prices: results.rice_prices?.inserted || 0,
        rice_consumption: results.rice_consumption?.inserted || 0,
        rice_alerts: results.rice_alerts?.inserted || 0,
        rice_parameters: results.rice_parameters?.inserted || 0,
        incentive_programs: results.incentive_programs?.inserted || 0,
        financial_profiles: results.financial_profiles?.inserted || 0,
        data_lab_datasets: results.data_lab_datasets?.inserted || 0,
        data_lab_organizations: results.data_lab_organizations?.inserted || 0,
      }
    };

    console.log('Seed completed:', JSON.stringify(summary));

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Seed error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
