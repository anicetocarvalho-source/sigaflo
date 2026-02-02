import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

export type ExportFormat = 'xlsx' | 'csv' | 'pdf';

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  columns: {
    key: string;
    header: string;
    width?: number;
  }[];
}

export interface ReportConfig {
  tableName: string;
  select: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending: boolean };
}

// Format value for export
function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value instanceof Date) return value.toLocaleDateString('pt-AO');
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') {
    // Handle nested objects (e.g., provinces.name)
    if (value.name) return value.name;
    return JSON.stringify(value);
  }
  return String(value);
}

// Get nested value from object
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

// Export to XLSX
export async function exportToXLSX(data: any[], options: ExportOptions): Promise<void> {
  const rows = data.map(item => {
    const row: Record<string, string> = {};
    options.columns.forEach(col => {
      row[col.header] = formatValue(getNestedValue(item, col.key));
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set column widths
  const colWidths = options.columns.map(col => ({ wch: col.width || 15 }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, options.title || 'Dados');
  
  XLSX.writeFile(workbook, `${options.filename}.xlsx`);
}

// Export to CSV
export async function exportToCSV(data: any[], options: ExportOptions): Promise<void> {
  const headers = options.columns.map(col => col.header);
  const rows = data.map(item => 
    options.columns.map(col => {
      const value = formatValue(getNestedValue(item, col.key));
      // Escape CSV special characters
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${options.filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Export to PDF
export async function exportToPDF(data: any[], options: ExportOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Add header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title || 'Relatório', 14, 20);

  if (options.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(options.subtitle, 14, 28);
  }

  // Add metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-AO')}`, 14, 36);
  doc.text(`Total de registos: ${data.length}`, 14, 42);

  // Prepare table data
  const headers = options.columns.map(col => col.header);
  const rows = data.map(item => 
    options.columns.map(col => formatValue(getNestedValue(item, col.key)))
  );

  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 48,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [34, 139, 34], // Forest green
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 48 },
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - SIGAF - Sistema de Gestão Agro-Florestal`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`${options.filename}.pdf`);
}

// Main export function
export async function exportReport(
  format: ExportFormat,
  data: any[],
  options: ExportOptions
): Promise<void> {
  switch (format) {
    case 'xlsx':
      await exportToXLSX(data, options);
      break;
    case 'csv':
      await exportToCSV(data, options);
      break;
    case 'pdf':
      await exportToPDF(data, options);
      break;
  }
}

// Fetch and export directly from database
export async function fetchAndExport(
  format: ExportFormat,
  config: ReportConfig,
  options: ExportOptions
): Promise<void> {
  // Build query using any to avoid type issues
  let query = (supabase as any)
    .from(config.tableName)
    .select(config.select);

  // Apply filters
  if (config.filters) {
    Object.entries(config.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query = query.eq(key, value);
      }
    });
  }

  // Apply ordering
  if (config.orderBy) {
    query = query.order(config.orderBy.column, { ascending: config.orderBy.ascending });
  }

  const { data, error } = await query;
  if (error) throw error;

  await exportReport(format, data || [], options);
}

// Pre-defined report configurations
export const REPORT_CONFIGS: Record<string, ReportConfig> = {
  farmers: {
    tableName: 'farmers',
    select: '*, provinces(name), municipalities(name)',
    orderBy: { column: 'created_at', ascending: false },
  },
  production: {
    tableName: 'production_history',
    select: '*, farmers(name), provinces(name)',
    orderBy: { column: 'created_at', ascending: false },
  },
  certificates: {
    tableName: 'agricultural_certificates',
    select: '*, farmers(name)',
    orderBy: { column: 'created_at', ascending: false },
  },
  coffee_lots: {
    tableName: 'coffee_lots',
    select: '*, provinces:origin_province_id(name)',
    orderBy: { column: 'created_at', ascending: false },
  },
  occurrences: {
    tableName: 'climate_occurrences',
    select: '*, provinces:province_id(name)',
    orderBy: { column: 'report_date', ascending: false },
  },
  infrastructure_agricultural: {
    tableName: 'agricultural_infrastructure',
    select: '*, provinces(name), municipalities(name)',
    orderBy: { column: 'created_at', ascending: false },
  },
  infrastructure_markets: {
    tableName: 'market_infrastructure',
    select: '*, provinces(name), municipalities(name)',
    orderBy: { column: 'created_at', ascending: false },
  },
};

// Column configurations for reports
export const REPORT_COLUMNS = {
  farmers: [
    { key: 'registration_number', header: 'Nº Registo', width: 15 },
    { key: 'name', header: 'Nome', width: 25 },
    { key: 'farmer_type', header: 'Tipo', width: 12 },
    { key: 'provinces.name', header: 'Província', width: 15 },
    { key: 'municipalities.name', header: 'Município', width: 15 },
    { key: 'total_area_ha', header: 'Área (ha)', width: 10 },
    { key: 'status', header: 'Estado', width: 12 },
    { key: 'phone', header: 'Telefone', width: 15 },
  ],
  production: [
    { key: 'farmers.name', header: 'Agricultor', width: 25 },
    { key: 'crop', header: 'Cultura', width: 15 },
    { key: 'season', header: 'Campanha', width: 12 },
    { key: 'year', header: 'Ano', width: 8 },
    { key: 'area_ha', header: 'Área (ha)', width: 10 },
    { key: 'quantity_kg', header: 'Quantidade (kg)', width: 15 },
    { key: 'yield_kg_ha', header: 'Rendimento (kg/ha)', width: 15 },
    { key: 'provinces.name', header: 'Província', width: 15 },
  ],
  certificates: [
    { key: 'certificate_number', header: 'Nº Certificado', width: 20 },
    { key: 'farmers.name', header: 'Agricultor', width: 25 },
    { key: 'certificate_type', header: 'Tipo', width: 15 },
    { key: 'year', header: 'Ano', width: 8 },
    { key: 'season', header: 'Campanha', width: 12 },
    { key: 'status', header: 'Estado', width: 12 },
    { key: 'issue_date', header: 'Data Emissão', width: 12 },
  ],
  coffee_lots: [
    { key: 'lot_code', header: 'Código Lote', width: 18 },
    { key: 'variety', header: 'Variedade', width: 15 },
    { key: 'volume_kg', header: 'Volume (kg)', width: 12 },
    { key: 'quality_grade', header: 'Qualidade', width: 12 },
    { key: 'provinces.name', header: 'Origem', width: 15 },
    { key: 'status', header: 'Estado', width: 12 },
    { key: 'destination_country', header: 'Destino', width: 12 },
  ],
  occurrences: [
    { key: 'title', header: 'Título', width: 25 },
    { key: 'occurrence_type', header: 'Tipo', width: 15 },
    { key: 'severity', header: 'Severidade', width: 12 },
    { key: 'provinces.name', header: 'Província', width: 15 },
    { key: 'affected_area_ha', header: 'Área Afectada (ha)', width: 15 },
    { key: 'report_date', header: 'Data', width: 12 },
    { key: 'status', header: 'Estado', width: 12 },
  ],
};
