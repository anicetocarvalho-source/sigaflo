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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify the caller is an authenticated admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Autenticação necessária' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Sessão inválida' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin_national role
    const { data: roleData } = await authClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin_national')
      .maybeSingle();

    if (!roleData) {
      console.log(`Unauthorized seed attempt by user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Apenas administradores nacionais podem executar esta operação' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Seed initiated by admin: ${user.id}`);

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
    const certTypes = ['production', 'origin', 'organic', 'quality', 'good_practices'];

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

    // ========== FOREST OPERATORS ==========
    console.log('Seeding forest operators...');
    const operatorTypes = ['concessionaire', 'sawmill', 'exporter', 'transporter', 'processor'];
    const forestOperators: any[] = [];

    const companyNames = ['Madeiras Angola Lda', 'Floresta Verde SA', 'Cabinda Woods', 'TransLog Florestal', 'SerraMadeira Industrial', 'EcoTora Lda', 'MadeExport Angola', 'Florex Trading', 'Benguela Timber', 'Uíge Forest Products'];

    for (let i = 0; i < 20; i++) {
      const provinceId = provinceIds[Math.floor(Math.random() * provinceIds.length)];
      const provinceMuns = municipalitiesByProvince[provinceId] || [];
      const municipalityId = provinceMuns.length > 0 ? provinceMuns[Math.floor(Math.random() * provinceMuns.length)] : null;

      forestOperators.push({
        name: companyNames[i % companyNames.length] + (i >= companyNames.length ? ` ${i}` : ''),
        trade_name: companyNames[i % companyNames.length],
        nif: `5${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
        operator_type: operatorTypes[Math.floor(Math.random() * operatorTypes.length)],
        address: `Zona Industrial, Sector ${Math.floor(Math.random() * 10) + 1}`,
        province_id: provinceId,
        municipality_id: municipalityId,
        phone: `+244 2${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        email: `contacto@${companyNames[i % companyNames.length].toLowerCase().replace(/\s+/g, '').substring(0, 10)}.ao`,
        legal_representative: generateName(),
        is_active: Math.random() > 0.1,
      });
    }

    const { error: opError } = await supabase.from('forest_operators').insert(forestOperators);
    results.forest_operators = {
      inserted: opError ? 0 : forestOperators.length,
      errors: opError ? [opError.message] : []
    };
    console.log(`Forest operators: ${results.forest_operators?.inserted || 0} inserted`);

    // Get inserted operators
    const { data: insertedOperators } = await supabase.from('forest_operators').select('id').order('created_at', { ascending: false }).limit(20);
    const operatorIds = (insertedOperators || []).map(o => o.id);

    // ========== FOREST LICENSES ==========
    console.log('Seeding forest licenses...');
    const licenseTypes = ['exploitation', 'transport', 'export', 'sawmill', 'processing'];
    // Valid enum values: draft, submitted, under_review, approved, active, suspended, expired, revoked, rejected
    const licenseStatuses = ['draft', 'submitted', 'under_review', 'approved', 'active', 'suspended', 'expired', 'rejected'];
    const treeSpecies = ['Pau-preto', 'Tola', 'Umbila', 'Undianuno', 'Girassonde', 'Mutenguengue', 'Nsimba', 'Takula', 'Mussivi', 'Sapele'];
    const forestLicenses: any[] = [];

    for (let i = 0; i < 40; i++) {
      const provinceId = provinceIds[Math.floor(Math.random() * provinceIds.length)];
      const provinceMuns = municipalitiesByProvince[provinceId] || [];
      const municipalityId = provinceMuns.length > 0 ? provinceMuns[Math.floor(Math.random() * provinceMuns.length)] : null;
      const coords = generateAngolaCoordinates();
      const status = licenseStatuses[Math.floor(Math.random() * licenseStatuses.length)];
      const isActive = status === 'active' || status === 'expired';
      const issueDate = isActive ? randomDate(new Date(2023, 0, 1), new Date()) : null;
      const authorizedVolume = Math.floor(Math.random() * 5000) + 500;

      forestLicenses.push({
        license_type: licenseTypes[Math.floor(Math.random() * licenseTypes.length)],
        status,
        operator_id: operatorIds.length > 0 ? operatorIds[Math.floor(Math.random() * operatorIds.length)] : null,
        concession_area_name: `Concessão Florestal ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 100)}`,
        concession_area_ha: parseFloat((Math.random() * 10000 + 500).toFixed(2)),
        province_id: provinceId,
        municipality_id: municipalityId,
        latitude: coords.lat,
        longitude: coords.lng,
        authorized_species: treeSpecies.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 2),
        authorized_volume_m3: authorizedVolume,
        harvested_volume_m3: isActive ? parseFloat((authorizedVolume * Math.random() * 0.7).toFixed(2)) : 0,
        application_date: randomDate(new Date(2022, 0, 1), new Date()).toISOString(),
        issue_date: issueDate?.toISOString() || null,
        start_date: issueDate?.toISOString() || null,
        expiry_date: issueDate ? new Date(issueDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
        license_fee_aoa: parseFloat((Math.random() * 5000000 + 500000).toFixed(2)),
        fee_paid: isActive,
      });
    }

    let licensesInserted = 0;
    const licenseErrors: string[] = [];
    for (let batch = 0; batch < forestLicenses.length; batch += 5) {
      const licenseBatch = forestLicenses.slice(batch, batch + 5);
      const { error: licBatchErr } = await supabase.from('forest_licenses').insert(licenseBatch);
      if (licBatchErr) {
        licenseErrors.push(licBatchErr.message);
      } else {
        licensesInserted += licenseBatch.length;
      }
    }
    results.forest_licenses = { inserted: licensesInserted, errors: licenseErrors };
    console.log(`Forest licenses: ${licensesInserted} inserted`);

    // Get inserted licenses for trees/logs
    const { data: insertedLicenses } = await supabase.from('forest_licenses').select('id').order('created_at', { ascending: false }).limit(40);
    const licenseIds = (insertedLicenses || []).map(l => l.id);

    // ========== FOREST TREES ==========
    console.log('Seeding forest trees...');
    // Valid tracking_status: at_origin, felled, logged, in_transport, at_checkpoint, at_sawmill, processed, in_storage, exported, at_destination
    const treeStatuses = ['at_origin', 'felled', 'logged', 'processed'];
    const healthStatuses = ['healthy', 'good', 'fair', 'poor'];
    const forestTrees: any[] = [];

    for (let i = 0; i < 100; i++) {
      const coords = generateAngolaCoordinates();
      const estimatedVolume = parseFloat((Math.random() * 10 + 1).toFixed(2));
      const status = treeStatuses[Math.floor(Math.random() * treeStatuses.length)];
      const treeCode = `ARV-${currentYear}-${String(Date.now()).slice(-6)}${String(i).padStart(3, '0')}`;

      forestTrees.push({
        tree_code: treeCode,
        license_id: licenseIds.length > 0 ? licenseIds[Math.floor(Math.random() * licenseIds.length)] : null,
        species: treeSpecies[Math.floor(Math.random() * treeSpecies.length)],
        wood_class: ['precious', 'first_class', 'second_class', 'common'][Math.floor(Math.random() * 4)],
        estimated_volume_m3: estimatedVolume,
        actual_volume_m3: status === 'felled' || status === 'processed' ? parseFloat((estimatedVolume * (0.8 + Math.random() * 0.3)).toFixed(2)) : null,
        latitude: coords.lat,
        longitude: coords.lng,
        plot_number: `P${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
        status,
        diameter_cm: parseFloat((Math.random() * 100 + 30).toFixed(1)),
        height_m: parseFloat((Math.random() * 30 + 10).toFixed(1)),
        health_status: healthStatuses[Math.floor(Math.random() * healthStatuses.length)],
        marked_at: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
        felled_at: status === 'felled' || status === 'processed' ? randomDate(new Date(2023, 6, 1), new Date()).toISOString() : null,
      });
    }

    const { error: treeError } = await supabase.from('forest_trees').insert(forestTrees);
    results.forest_trees = {
      inserted: treeError ? 0 : forestTrees.length,
      errors: treeError ? [treeError.message] : []
    };
    console.log(`Forest trees: ${results.forest_trees?.inserted || 0} inserted`);

    // Get trees for logs
    const { data: insertedTrees } = await supabase.from('forest_trees').select('id').order('created_at', { ascending: false }).limit(100);
    const treeIds = (insertedTrees || []).map(t => t.id);

    // ========== FOREST LOGS ==========
    console.log('Seeding forest logs...');
    const logStatuses = ['at_origin', 'in_transport', 'at_checkpoint', 'at_sawmill', 'processed', 'exported'];
    const sawmillNames = ['Serraria Industrial Luanda', 'Cabinda Madeiras', 'Benguela Wood Processing'];
    const forestLogs: any[] = [];

    for (let i = 0; i < 80; i++) {
      const coords = generateAngolaCoordinates();
      const volume = parseFloat((Math.random() * 5 + 0.5).toFixed(2));
      const logCode = `LOG-${currentYear}-${String(Date.now()).slice(-6)}${String(i).padStart(3, '0')}`;

      forestLogs.push({
        log_code: logCode,
        tree_id: treeIds.length > 0 ? treeIds[Math.floor(Math.random() * treeIds.length)] : null,
        license_id: licenseIds.length > 0 ? licenseIds[Math.floor(Math.random() * licenseIds.length)] : null,
        species: treeSpecies[Math.floor(Math.random() * treeSpecies.length)],
        wood_class: ['precious', 'first_class', 'second_class', 'common'][Math.floor(Math.random() * 4)],
        volume_m3: volume,
        length_m: parseFloat((Math.random() * 4 + 2).toFixed(2)),
        diameter_cm: parseFloat((Math.random() * 60 + 20).toFixed(1)),
        status: logStatuses[Math.floor(Math.random() * logStatuses.length)],
        current_latitude: coords.lat,
        current_longitude: coords.lng,
        current_location_name: `Ponto ${Math.floor(Math.random() * 20) + 1}`,
        destination_name: sawmillNames[Math.floor(Math.random() * sawmillNames.length)],
        logged_at: randomDate(new Date(2023, 6, 1), new Date()).toISOString(),
      });
    }

    const { error: logError } = await supabase.from('forest_logs').insert(forestLogs);
    results.forest_logs = {
      inserted: logError ? 0 : forestLogs.length,
      errors: logError ? [logError.message] : []
    };
    console.log(`Forest logs: ${results.forest_logs?.inserted || 0} inserted`);

    // ========== COFFEE LOTS ==========
    console.log('Seeding coffee lots...');
    const coffeeVarieties = ['Robusta', 'Arábica Catimor', 'Arábica Bourbon', 'Arábica Typica', 'Conilon'];
    const processingMethods = ['Natural', 'Lavado', 'Honey', 'Semi-lavado'];
    const qualityGradesCoffee = ['Specialty', 'Premium', 'Commercial Plus', 'Commercial', 'Standard'];
    const coffeeStatuses = ['registered', 'processing', 'certified', 'dispatched', 'exported'];
    const buyerNames = ['Starbucks Reserve', 'Blue Bottle Coffee', 'Counter Culture', 'Intelligentsia', 'Local Roasters Angola'];
    const destinations = ['USA', 'Germany', 'Italy', 'Japan', 'Portugal', 'France', 'UK', 'Belgium'];
    const coffeeLots: any[] = [];

    // Get coffee provinces (Cuanza Sul, Uíge, Bengo, Cabinda)
    const coffeeProvinceNames = ['Cuanza Sul', 'Uíge', 'Bengo', 'Cabinda', 'Huambo', 'Bié'];
    const coffeeProvinces = provinces.filter(p => coffeeProvinceNames.some(n => p.name.includes(n) || n.includes(p.name)));
    const coffeeProvinceIds = coffeeProvinces.length > 0 ? coffeeProvinces.map(p => p.id) : provinceIds.slice(0, 4);

    for (let i = 0; i < 60; i++) {
      const provinceId = coffeeProvinceIds[Math.floor(Math.random() * coffeeProvinceIds.length)];
      const provinceMuns = municipalitiesByProvince[provinceId] || [];
      const municipalityId = provinceMuns.length > 0 ? provinceMuns[Math.floor(Math.random() * provinceMuns.length)] : null;
      const status = coffeeStatuses[Math.floor(Math.random() * coffeeStatuses.length)];
      const isExported = status === 'exported';
      const volume = Math.floor(Math.random() * 10000 + 500);

      coffeeLots.push({
        lot_code: `CAFE-LOT-${currentYear}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        origin_province_id: provinceId,
        origin_municipality_id: municipalityId,
        origin_location: `Fazenda ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 100)}`,
        producers_count: Math.floor(Math.random() * 50) + 5,
        volume_kg: volume,
        bags_count: Math.floor(volume / 60),
        variety: coffeeVarieties[Math.floor(Math.random() * coffeeVarieties.length)],
        quality_grade: qualityGradesCoffee[Math.floor(Math.random() * qualityGradesCoffee.length)],
        harvest_year: currentYear - Math.floor(Math.random() * 2),
        harvest_season: ['Main', 'Fly'][Math.floor(Math.random() * 2)],
        processing_method: processingMethods[Math.floor(Math.random() * processingMethods.length)],
        exporter_name: operatorIds.length > 0 ? null : companyNames[Math.floor(Math.random() * companyNames.length)],
        buyer_name: isExported ? buyerNames[Math.floor(Math.random() * buyerNames.length)] : null,
        destination_country: isExported ? destinations[Math.floor(Math.random() * destinations.length)] : null,
        status,
        registered_at: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
        dispatched_at: status === 'dispatched' || isExported ? randomDate(new Date(2023, 6, 1), new Date()).toISOString() : null,
        exported_at: isExported ? randomDate(new Date(2024, 0, 1), new Date()).toISOString() : null,
      });
    }

    const { error: coffeeError } = await supabase.from('coffee_lots').insert(coffeeLots);
    results.coffee_lots = {
      inserted: coffeeError ? 0 : coffeeLots.length,
      errors: coffeeError ? [coffeeError.message] : []
    };
    console.log(`Coffee lots: ${results.coffee_lots?.inserted || 0} inserted`);

    // ========== FOREST COMPLAINTS ==========
    console.log('Seeding forest complaints...');
    const complaintTypes = ['illegal_logging', 'unauthorized_transport', 'document_fraud', 'environmental_damage', 'license_violation'];
    const complaintStatuses = ['received', 'under_investigation', 'verified', 'action_taken', 'resolved', 'dismissed'];
    const forestComplaints: any[] = [];

    for (let i = 0; i < 30; i++) {
      const provinceId = provinceIds[Math.floor(Math.random() * provinceIds.length)];
      const provinceMuns = municipalitiesByProvince[provinceId] || [];
      const municipalityId = provinceMuns.length > 0 ? provinceMuns[Math.floor(Math.random() * provinceMuns.length)] : null;
      const coords = generateAngolaCoordinates();
      const isAnonymous = Math.random() > 0.6;

      forestComplaints.push({
        status: complaintStatuses[Math.floor(Math.random() * complaintStatuses.length)],
        is_anonymous: isAnonymous,
        complainant_name: isAnonymous ? null : generateName(),
        complainant_phone: isAnonymous ? null : `+244 9${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        province_id: provinceId,
        municipality_id: municipalityId,
        latitude: coords.lat,
        longitude: coords.lng,
        location_description: `Zona florestal próxima à aldeia ${Math.floor(Math.random() * 100)}`,
        complaint_type: complaintTypes[Math.floor(Math.random() * complaintTypes.length)],
        description: 'Denúncia gerada automaticamente para demonstração do sistema SIGAFLO.',
        occurrence_date: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
        received_at: randomDate(new Date(2023, 3, 1), new Date()).toISOString(),
      });
    }

    let complaintsInserted = 0;
    for (const complaint of forestComplaints) {
      const { error } = await supabase.from('forest_complaints').insert(complaint);
      if (!error) complaintsInserted++;
    }
    results.forest_complaints = { inserted: complaintsInserted, errors: [] };
    console.log(`Forest complaints: ${complaintsInserted} inserted`);

    // ========== FOREST INFRACTIONS ==========
    console.log('Seeding forest infractions...');
    // Valid infraction_type: illegal_cutting, transport_without_license, exceeded_quota, protected_species, false_declaration, document_forgery, unauthorized_area, environmental_damage, other
    const infractionTypes = ['illegal_cutting', 'transport_without_license', 'exceeded_quota', 'protected_species', 'false_declaration', 'document_forgery', 'environmental_damage', 'other'];
    // Valid infraction_status: reported, investigating, confirmed, contested, sanctioned, appealed, closed, archived
    const infractionStatuses = ['reported', 'investigating', 'confirmed', 'sanctioned', 'closed', 'archived'];
    const infractionSeverities = ['minor', 'moderate', 'major', 'critical'];
    const forestInfractions: any[] = [];

    for (let i = 0; i < 25; i++) {
      const provinceId = provinceIds[Math.floor(Math.random() * provinceIds.length)];
      const provinceMuns = municipalitiesByProvince[provinceId] || [];
      const municipalityId = provinceMuns.length > 0 ? provinceMuns[Math.floor(Math.random() * provinceMuns.length)] : null;
      const coords = generateAngolaCoordinates();
      const status = infractionStatuses[Math.floor(Math.random() * infractionStatuses.length)];
      const fineAmount = parseFloat((Math.random() * 10000000 + 500000).toFixed(2));

      forestInfractions.push({
        infraction_type: infractionTypes[Math.floor(Math.random() * infractionTypes.length)],
        status,
        severity: infractionSeverities[Math.floor(Math.random() * infractionSeverities.length)],
        operator_id: operatorIds.length > 0 ? operatorIds[Math.floor(Math.random() * operatorIds.length)] : null,
        infractor_name: companyNames[Math.floor(Math.random() * companyNames.length)],
        infractor_document: `5${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
        province_id: provinceId,
        municipality_id: municipalityId,
        latitude: coords.lat,
        longitude: coords.lng,
        location_description: `Área de concessão ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}`,
        description: 'Auto de infracção gerado automaticamente para demonstração.',
        occurrence_date: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
        fine_amount_aoa: fineAmount,
        fine_paid: status === 'closed',
        fine_paid_at: status === 'closed' ? randomDate(new Date(2024, 0, 1), new Date()).toISOString() : null,
      });
    }

    let infractionsInserted = 0;
    for (const infraction of forestInfractions) {
      const { error } = await supabase.from('forest_infractions').insert(infraction);
      if (!error) infractionsInserted++;
    }
    results.forest_infractions = { inserted: infractionsInserted, errors: [] };
    console.log(`Forest infractions: ${infractionsInserted} inserted`);

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
        forest_operators: results.forest_operators?.inserted || 0,
        forest_licenses: results.forest_licenses?.inserted || 0,
        forest_trees: results.forest_trees?.inserted || 0,
        forest_logs: results.forest_logs?.inserted || 0,
        coffee_lots: results.coffee_lots?.inserted || 0,
        forest_complaints: results.forest_complaints?.inserted || 0,
        forest_infractions: results.forest_infractions?.inserted || 0,
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
