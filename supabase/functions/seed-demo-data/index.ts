import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Angola provinces with their IDs from database
const PROVINCES_MAP: Record<string, string> = {};

// Helper to generate random coordinates within Angola
const generateAngolaCoordinates = () => {
  const lat = -5.5 - Math.random() * 12; // -5.5 to -17.5
  const lng = 12 + Math.random() * 12; // 12 to 24
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

// Occurrence types
const climateTypes = ['drought', 'flood', 'frost', 'storm', 'heatwave', 'wildfire'];
const phytoTypes = ['pest', 'disease'];
const severities = ['low', 'medium', 'high', 'critical'];
const occurrenceStatuses = ['reported', 'investigating', 'confirmed', 'resolved'];

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
    const { data: provinces, error: provError } = await supabase
      .from('provinces')
      .select('id, name');
    
    if (provError) throw new Error(`Failed to fetch provinces: ${provError.message}`);
    if (!provinces?.length) throw new Error('No provinces found');

    provinces.forEach(p => PROVINCES_MAP[p.name] = p.id);
    const provinceIds = provinces.map(p => p.id);

    // 2. Get municipalities for each province
    const { data: municipalities, error: munError } = await supabase
      .from('municipalities')
      .select('id, name, province_id');
    
    if (munError) throw new Error(`Failed to fetch municipalities: ${munError.message}`);

    // Group municipalities by province
    const municipalitiesByProvince: Record<string, string[]> = {};
    municipalities?.forEach(m => {
      if (!municipalitiesByProvince[m.province_id]) {
        municipalitiesByProvince[m.province_id] = [];
      }
      municipalitiesByProvince[m.province_id].push(m.id);
    });

    // Get communes
    const { data: communes, error: comError } = await supabase
      .from('communes')
      .select('id, municipality_id');
    
    const communesByMunicipality: Record<string, string[]> = {};
    communes?.forEach(c => {
      if (!communesByMunicipality[c.municipality_id]) {
        communesByMunicipality[c.municipality_id] = [];
      }
      communesByMunicipality[c.municipality_id].push(c.id);
    });

    // ========== FARMERS ==========
    console.log('Seeding farmers...');
    const farmerTypes = ['small', 'family', 'cooperative', 'field_school'];
    const farmerStatuses = ['draft', 'submitted', 'validated', 'approved', 'rejected'];
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
      const farmerType = farmerTypes[Math.floor(Math.random() * farmerTypes.length)];
      const cropCount = Math.floor(Math.random() * 4) + 1;
      const selectedCrops = [...crops].sort(() => Math.random() - 0.5).slice(0, cropCount);

      farmers.push({
        full_name: generateName(),
        farmer_type: farmerType,
        document_type: Math.random() > 0.3 ? 'bi' : 'passport',
        document_number: `BI${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}LA`,
        phone: `+244 9${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        email: Math.random() > 0.5 ? `farmer${i}@demo.ao` : null,
        province_id: provinceId,
        municipality_id: municipalityId,
        commune_id: communeId,
        locality: `Localidade ${Math.floor(Math.random() * 100)}`,
        latitude: coords.lat,
        longitude: coords.lng,
        total_area_ha: parseFloat((Math.random() * 50 + 0.5).toFixed(2)),
        cultivated_area_ha: parseFloat((Math.random() * 30 + 0.5).toFixed(2)),
        crops: selectedCrops,
        status: farmerStatuses[Math.floor(Math.random() * farmerStatuses.length)],
        gender: Math.random() > 0.5 ? 'male' : 'female',
        birth_date: randomDate(new Date(1950, 0, 1), new Date(2000, 0, 1)).toISOString().split('T')[0],
        household_size: Math.floor(Math.random() * 10) + 1,
        family_workers: Math.floor(Math.random() * 5),
        hired_workers: Math.floor(Math.random() * 3),
        registration_date: randomDate(new Date(2022, 0, 1), new Date()).toISOString(),
      });
    }

    const { error: farmersError } = await supabase.from('farmers').insert(farmers);
    results.farmers = {
      inserted: farmersError ? 0 : farmers.length,
      errors: farmersError ? [farmersError.message] : []
    };

    // Get inserted farmers
    const { data: insertedFarmers } = await supabase
      .from('farmers')
      .select('id, province_id, crops')
      .limit(150);

    const farmerIds = insertedFarmers?.map(f => f.id) || [];

    // ========== PRODUCTION HISTORY ==========
    console.log('Seeding production history...');
    const productions: any[] = [];
    const seasons = ['main', 'secondary'];
    const qualities = ['premium', 'standard', 'basic'];

    for (const farmer of (insertedFarmers || [])) {
      const numRecords = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numRecords; i++) {
        const year = 2020 + Math.floor(Math.random() * 5);
        const cropType = (farmer.crops as string[])?.[0] || 'Milho';
        const areaHa = parseFloat((Math.random() * 10 + 0.5).toFixed(2));
        const yieldKg = parseFloat((areaHa * (Math.random() * 3000 + 500)).toFixed(2));

        productions.push({
          farmer_id: farmer.id,
          year,
          season: seasons[Math.floor(Math.random() * seasons.length)],
          crop_type: cropType,
          area_ha: areaHa,
          yield_kg: yieldKg,
          quality: qualities[Math.floor(Math.random() * qualities.length)],
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
      .limit(100);

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

    // ========== CLIMATE OCCURRENCES ==========
    console.log('Seeding climate occurrences...');
    const occurrences: any[] = [];
    const allOccurrenceTypes = [...climateTypes, ...phytoTypes];

    for (let i = 0; i < 100; i++) {
      const provinceId = provinceIds[Math.floor(Math.random() * provinceIds.length)];
      const provinceMunicipalities = municipalitiesByProvince[provinceId] || [];
      const municipalityId = provinceMunicipalities.length > 0 
        ? provinceMunicipalities[Math.floor(Math.random() * provinceMunicipalities.length)]
        : null;
      
      const coords = generateAngolaCoordinates();
      const occType = allOccurrenceTypes[Math.floor(Math.random() * allOccurrenceTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const status = occurrenceStatuses[Math.floor(Math.random() * occurrenceStatuses.length)];

      occurrences.push({
        title: `Ocorrência de ${occType} - ${provinces.find(p => p.id === provinceId)?.name || 'Angola'}`,
        occurrence_type: occType,
        severity,
        status,
        source: ['field_report', 'satellite', 'citizen', 'extension_agent'][Math.floor(Math.random() * 4)],
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

    // ========== RICE PRODUCTION ==========
    console.log('Seeding rice production...');
    const riceProduction: any[] = [];

    for (const province of provinces) {
      for (let year = 2020; year <= 2024; year++) {
        for (const season of seasons) {
          const cultivatedArea = parseFloat((Math.random() * 5000 + 500).toFixed(2));
          const harvestedArea = parseFloat((cultivatedArea * (0.7 + Math.random() * 0.25)).toFixed(2));
          const production = parseFloat((harvestedArea * (Math.random() * 3 + 1.5)).toFixed(2));
          const productivity = parseFloat((production / harvestedArea).toFixed(2));

          riceProduction.push({
            province_id: province.id,
            municipality_id: (municipalitiesByProvince[province.id] || [])[0] || null,
            year,
            season,
            cultivated_area_ha: cultivatedArea,
            harvested_area_ha: harvestedArea,
            production_tons: production,
            productivity_ton_ha: productivity,
            variety: ['Indica', 'Japonica', 'Híbrido', 'Local'][Math.floor(Math.random() * 4)],
            irrigation_type: ['rainfed', 'irrigated', 'mixed'][Math.floor(Math.random() * 3)],
            source: 'demo_data',
          });
        }
      }
    }

    const { error: riceError } = await supabase.from('rice_production').insert(riceProduction);
    results.rice_production = {
      inserted: riceError ? 0 : riceProduction.length,
      errors: riceError ? [riceError.message] : []
    };

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
          const volumeTons = parseFloat((Math.random() * 50000 + 5000).toFixed(2));
          const priceFob = parseFloat((Math.random() * 200 + 350).toFixed(2));
          const priceCif = parseFloat((priceFob * (1.1 + Math.random() * 0.15)).toFixed(2));

          riceImports.push({
            year,
            month,
            volume_tons: volumeTons,
            origin_country: countries[Math.floor(Math.random() * countries.length)],
            price_fob_usd: priceFob,
            price_cif_usd: priceCif,
            importer_name: importerNames[Math.floor(Math.random() * importerNames.length)],
            rice_type: ['Long grain', 'Medium grain', 'Broken rice', 'Parboiled'][Math.floor(Math.random() * 4)],
            source: 'demo_data',
          });
        }
      }
    }

    const { error: impError } = await supabase.from('rice_imports').insert(riceImports);
    results.rice_imports = {
      inserted: impError ? 0 : riceImports.length,
      errors: impError ? [impError.message] : []
    };

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
            source: 'demo_data',
          });
        }
      }
    }

    const { error: priceError } = await supabase.from('rice_prices').insert(ricePrices);
    results.rice_prices = {
      inserted: priceError ? 0 : ricePrices.length,
      errors: priceError ? [priceError.message] : []
    };

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
          total_population: population,
          total_consumption_tons: parseFloat(((population * perCapitaKg) / 1000).toFixed(2)),
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
        total_population: nationalPop,
        total_consumption_tons: parseFloat(((nationalPop * nationalPerCapita) / 1000).toFixed(2)),
        data_source: 'demo_data',
      });
    }

    const { error: consError } = await supabase.from('rice_consumption').insert(riceConsumption);
    results.rice_consumption = {
      inserted: consError ? 0 : riceConsumption.length,
      errors: consError ? [consError.message] : []
    };

    // ========== RICE ALERTS ==========
    console.log('Seeding rice alerts...');
    const riceAlerts: any[] = [];
    const alertTypes = ['price_spike', 'import_delay', 'production_shortage', 'stock_low', 'quality_issue'];
    const alertPriorities = ['low', 'medium', 'high', 'critical'];

    for (let i = 0; i < 30; i++) {
      const provinceId = provinceIds[Math.floor(Math.random() * provinceIds.length)];
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      riceAlerts.push({
        alert_type: alertType,
        priority: alertPriorities[Math.floor(Math.random() * alertPriorities.length)],
        title: `Alerta de ${alertType.replace('_', ' ')}`,
        message: `Alerta gerado automaticamente para demonstração. Tipo: ${alertType}`,
        province_id: provinceId,
        is_read: Math.random() > 0.5,
        is_resolved: Math.random() > 0.7,
        source: 'demo_system',
      });
    }

    const { error: alertError } = await supabase.from('rice_alerts').insert(riceAlerts);
    results.rice_alerts = {
      inserted: alertError ? 0 : riceAlerts.length,
      errors: alertError ? [alertError.message] : []
    };

    // ========== RICE PARAMETERS ==========
    console.log('Seeding rice parameters...');
    const riceParams = [
      { param_key: 'target_self_sufficiency', param_value: '60', description: 'Meta de autossuficiência (%)', category: 'production' },
      { param_key: 'critical_stock_days', param_value: '45', description: 'Dias críticos de estoque', category: 'stock' },
      { param_key: 'price_alert_threshold', param_value: '15', description: 'Limiar de alerta de preço (%)', category: 'price' },
      { param_key: 'import_dependency_max', param_value: '50', description: 'Dependência máxima de importação (%)', category: 'import' },
      { param_key: 'per_capita_target', param_value: '30', description: 'Meta consumo per capita (kg/ano)', category: 'consumption' },
    ];

    const { error: paramError } = await supabase.from('rice_parameters').insert(riceParams);
    results.rice_parameters = {
      inserted: paramError ? 0 : riceParams.length,
      errors: paramError ? [paramError.message] : []
    };

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
      }
    };

    console.log('Seed completed:', summary);

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
