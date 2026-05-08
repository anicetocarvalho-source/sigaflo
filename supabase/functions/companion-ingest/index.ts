// SIGAFLO — Companion Ingest
// Receives field captures from Companion devices (NFC + biometric).
// Validates GPS against Angola's geographic bounds and inserts into
// public.field_captures using the service role (append-only).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-device-key',
};

// Angola continental + Cabinda bounding box (with small buffer).
// Lat: -18.05 .. -4.30   Lng: 11.65 .. 24.10
const ANGOLA_BOUNDS = {
  minLat: -18.05,
  maxLat: -4.30,
  minLng: 11.65,
  maxLng: 24.10,
};

const ALLOWED_CAPTURE_TYPES = new Set([
  'nfc_scan',
  'biometric_match',
  'biometric_enroll',
  'gps_checkpoint',
  'license_check',
  'transport_check',
]);

interface CapturePayload {
  device_serial?: string;
  device_id?: string;
  operator_id?: string;
  capture_type: string;
  latitude: number;
  longitude: number;
  match_score?: number;
  captured_at?: string;
  raw_payload?: Record<string, unknown>;
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isFiniteNum(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

function validate(p: any): { ok: true; data: CapturePayload } | { ok: false; error: string; field?: string } {
  if (!p || typeof p !== 'object') return { ok: false, error: 'Payload inválido' };

  if (typeof p.capture_type !== 'string' || !ALLOWED_CAPTURE_TYPES.has(p.capture_type)) {
    return { ok: false, error: 'capture_type inválido', field: 'capture_type' };
  }

  if (!isFiniteNum(p.latitude) || !isFiniteNum(p.longitude)) {
    return { ok: false, error: 'GPS obrigatório (latitude/longitude numéricos)', field: 'gps' };
  }

  // Plausibility check.
  if (p.latitude < -90 || p.latitude > 90 || p.longitude < -180 || p.longitude > 180) {
    return { ok: false, error: 'Coordenadas fora do intervalo geográfico válido', field: 'gps' };
  }

  // Angola boundary enforcement.
  if (
    p.latitude < ANGOLA_BOUNDS.minLat ||
    p.latitude > ANGOLA_BOUNDS.maxLat ||
    p.longitude < ANGOLA_BOUNDS.minLng ||
    p.longitude > ANGOLA_BOUNDS.maxLng
  ) {
    return {
      ok: false,
      error: `Captura rejeitada: GPS fora dos limites de Angola (lat ${p.latitude}, lng ${p.longitude})`,
      field: 'gps',
    };
  }

  if (p.match_score !== undefined && p.match_score !== null) {
    if (!isFiniteNum(p.match_score) || p.match_score < 0 || p.match_score > 100) {
      return { ok: false, error: 'match_score deve estar entre 0 e 100', field: 'match_score' };
    }
  }

  if (p.captured_at !== undefined && p.captured_at !== null) {
    const t = Date.parse(p.captured_at);
    if (Number.isNaN(t)) return { ok: false, error: 'captured_at inválido', field: 'captured_at' };
    // Reject obviously wrong clocks: more than 24h in the future.
    if (t - Date.now() > 24 * 3600 * 1000) {
      return { ok: false, error: 'captured_at no futuro', field: 'captured_at' };
    }
  }

  return {
    ok: true,
    data: {
      device_serial: p.device_serial ? String(p.device_serial).slice(0, 128) : undefined,
      device_id: p.device_id ? String(p.device_id) : undefined,
      operator_id: p.operator_id ? String(p.operator_id) : undefined,
      capture_type: p.capture_type,
      latitude: p.latitude,
      longitude: p.longitude,
      match_score: p.match_score ?? undefined,
      captured_at: p.captured_at,
      raw_payload: p.raw_payload && typeof p.raw_payload === 'object' ? p.raw_payload : undefined,
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'JSON inválido' });
  }

  const v = validate(body);
  if (!v.ok) {
    return json(422, { error: v.error, field: v.field, code: 'gps_out_of_bounds' });
  }
  const data = v.data;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  // Resolve device_id from device_serial when needed and validate the device.
  let deviceId = data.device_id ?? null;
  if (!deviceId && data.device_serial) {
    const { data: dev, error: devErr } = await supabase
      .from('companion_devices')
      .select('id, status')
      .eq('serial_number', data.device_serial)
      .maybeSingle();
    if (devErr) return json(500, { error: 'Falha a resolver dispositivo' });
    if (!dev) return json(403, { error: 'Dispositivo não registado' });
    if (dev.status && dev.status !== 'active') {
      return json(403, { error: `Dispositivo inactivo (${dev.status})` });
    }
    deviceId = dev.id;
  }

  const { data: inserted, error } = await supabase
    .from('field_captures')
    .insert({
      device_id: deviceId,
      operator_id: data.operator_id ?? null,
      capture_type: data.capture_type,
      latitude: data.latitude,
      longitude: data.longitude,
      match_score: data.match_score ?? null,
      raw_payload: data.raw_payload ?? null,
      captured_at: data.captured_at ?? new Date().toISOString(),
    })
    .select('id, captured_at')
    .single();

  if (error) {
    console.error('companion-ingest insert error', error);
    return json(500, { error: 'Falha a registar captura' });
  }

  return json(201, { success: true, capture: inserted });
});
