import { colors } from '@theme';
import type { IconName } from '@ui/Icon';

export interface ServiceSubcategory {
  id: string;
  name: string;
}

export interface PortServiceCategory {
  id: string;
  label: string;
  fullName: string;
  icon: IconName;
  bg: string;
  fg: string;
  subcategories: ServiceSubcategory[];
}

export const PORT_SERVICES: PortServiceCategory[] = [
  {
    id: 'ship-agent',
    label: 'Ship Agent',
    fullName: 'Ship Agent',
    icon: 'briefcase',
    bg: colors.primaryLight,
    fg: colors.primary,
    subcategories: [
      { id: 'sa-1', name: 'Husbanding Services' },
      { id: 'sa-2', name: 'Port Clearance & Documentation' },
      { id: 'sa-3', name: 'Crew Assistance' },
      { id: 'sa-4', name: 'Customs Coordination' },
      { id: 'sa-5', name: 'Vessel Scheduling' },
      { id: 'sa-6', name: 'Cargo Coordination' },
    ],
  },
  {
    id: 'stevedores',
    label: 'Stevedores',
    fullName: 'Stevedores / Cargo Handling',
    icon: 'package',
    bg: colors.accentLight,
    fg: colors.accent,
    subcategories: [
      { id: 'st-1', name: 'Loading & Unloading' },
      { id: 'st-2', name: 'Container Handling (FCL/LCL)' },
      { id: 'st-3', name: 'Bulk Cargo Operations' },
      { id: 'st-4', name: 'Break Bulk Cargo' },
      { id: 'st-5', name: 'RoRo Operations' },
      { id: 'st-6', name: 'Cargo Tallying & Survey' },
    ],
  },
  {
    id: 'ship-management',
    label: 'Ship Mgmt',
    fullName: 'Ship Management',
    icon: 'ship',
    bg: colors.successLight,
    fg: colors.success,
    subcategories: [
      { id: 'sm-1', name: 'Technical Management' },
      { id: 'sm-2', name: 'Crew Management' },
      { id: 'sm-3', name: 'Commercial Management' },
      { id: 'sm-4', name: 'ISM / ISPS Compliance' },
      { id: 'sm-5', name: 'Procurement & Supply' },
      { id: 'sm-6', name: 'Voyage Management' },
    ],
  },
  {
    id: 'ship-repair',
    label: 'Ship Repair',
    fullName: 'Ship Repair',
    icon: 'tool',
    bg: colors.warningLight,
    fg: colors.warning,
    subcategories: [
      { id: 'sr-1', name: 'Dry Docking Services' },
      { id: 'sr-2', name: 'Hull & Structural Repair' },
      { id: 'sr-3', name: 'Engine & Machinery Repair' },
      { id: 'sr-4', name: 'Electrical Systems' },
      { id: 'sr-5', name: 'Pipe & Valve Works' },
      { id: 'sr-6', name: 'Underwater Inspection' },
    ],
  },
  {
    id: 'ship-chandlers',
    label: 'Chandlers',
    fullName: 'Ship Chandlers',
    icon: 'clipboard',
    bg: colors.dangerLight,
    fg: colors.danger,
    subcategories: [
      { id: 'sc-1', name: 'Deck Stores & Supplies' },
      { id: 'sc-2', name: 'Engine Stores' },
      { id: 'sc-3', name: 'Provisions & Galley' },
      { id: 'sc-4', name: 'Safety Equipment' },
      { id: 'sc-5', name: 'Rope & Mooring Gear' },
      { id: 'sc-6', name: 'Spare Parts' },
    ],
  },
  {
    id: 'bunkering',
    label: 'Bunkering',
    fullName: 'Bunkering',
    icon: 'fuel',
    bg: colors.primaryLight,
    fg: colors.primary,
    subcategories: [
      { id: 'bu-1', name: 'HFO (Heavy Fuel Oil)' },
      { id: 'bu-2', name: 'MGO (Marine Gas Oil)' },
      { id: 'bu-3', name: 'LSFO (Low Sulphur FO)' },
      { id: 'bu-4', name: 'LNG Bunkering' },
      { id: 'bu-5', name: 'Lube Oil Supply' },
      { id: 'bu-6', name: 'Bunker Survey' },
    ],
  },
  {
    id: 'multi-modal',
    label: 'Transport',
    fullName: 'Multi Modal Transportation',
    icon: 'layers',
    bg: colors.accentLight,
    fg: colors.accent,
    subcategories: [
      { id: 'mm-1', name: 'Road Transportation' },
      { id: 'mm-2', name: 'Rail Freight' },
      { id: 'mm-3', name: 'Inland Waterway' },
      { id: 'mm-4', name: 'Air Freight' },
      { id: 'mm-5', name: 'Intermodal Logistics' },
      { id: 'mm-6', name: 'Last Mile Delivery' },
    ],
  },
  {
    id: 'storage-warehouse',
    label: 'Storage',
    fullName: 'Storage / Warehouse',
    icon: 'list',
    bg: colors.successLight,
    fg: colors.success,
    subcategories: [
      { id: 'sw-1', name: 'Container Yard (CY)' },
      { id: 'sw-2', name: 'Bulk Storage' },
      { id: 'sw-3', name: 'Cold Chain Storage' },
      { id: 'sw-4', name: 'Hazardous Cargo Storage' },
      { id: 'sw-5', name: 'CFS (Container Freight Station)' },
      { id: 'sw-6', name: 'Open Yard Storage' },
    ],
  },
  {
    id: 'legal-lawyers',
    label: 'Legal',
    fullName: 'Legal / Lawyers',
    icon: 'shield',
    bg: colors.warningLight,
    fg: colors.warning,
    subcategories: [
      { id: 'll-1', name: 'Maritime Litigation' },
      { id: 'll-2', name: 'P&I Club Representation' },
      { id: 'll-3', name: 'Cargo Claims' },
      { id: 'll-4', name: 'Ship Arrest & Release' },
      { id: 'll-5', name: 'Charter Party Disputes' },
      { id: 'll-6', name: 'Regulatory Compliance' },
    ],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    fullName: 'Insurance',
    icon: 'life-buoy',
    bg: colors.dangerLight,
    fg: colors.danger,
    subcategories: [
      { id: 'in-1', name: 'Hull & Machinery Insurance' },
      { id: 'in-2', name: 'P&I Insurance' },
      { id: 'in-3', name: 'Cargo Insurance' },
      { id: 'in-4', name: 'War Risk Insurance' },
      { id: 'in-5', name: 'Loss of Hire Insurance' },
      { id: 'in-6', name: 'Marine Liability' },
    ],
  },
];

export function getPortService(id: string): PortServiceCategory | undefined {
  return PORT_SERVICES.find(s => s.id === id);
}
