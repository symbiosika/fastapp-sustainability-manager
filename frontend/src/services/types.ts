// table "equivalents"
export interface EquivalentEntry {
  id: string;
  category: string;
  scope: number; // 1-3
  specification1: string;
  specification2: string;
  specification3: string;
  addName1: string;
  comment: string;
  source: string;
  avgValue: number;
  monthlyValues: boolean;
  jan: null | number;
  feb: null | number;
  mar: null | number;
  apr: null | number;
  may: null | number;
  jun: null | number;
  jul: null | number;
  aug: null | number;
  sep: null | number;
  oct: null | number;
  nov: null | number;
  dec: null | number;
  parent: null | string; // reference on table equivalents. if set a calculation chain is used
  in: string; // input unit
  out: string; // output unit
  project: null | string; // reference on table projects. system values will be NULL
  createdAt: string; // date
  updatedAt: string; // date
}

// table "inputs"
export interface InputEntry {
  id: string;
  name: string;
  scope: number; // 1-3
  comment: string;
  sumValue: number;
  equivalent: null | string; // reference on table equivalents
  report: string; // reference on table reports
  category: null | string;
  facility: null | string; // references on table facilities 1:n
  parent: null | string; // reference on table inputs. set if the input belongs to a group
  rawValue: number;
  monthlyValues: boolean;
  rawValueJan: number;
  rawValueFeb: number;
  rawValueMar: number;
  rawValueApr: number;
  rawValueMay: number;
  rawValueJun: number;
  rawValueJul: number;
  rawValueAug: number;
  rawValueSep: number;
  rawValueOct: number;
  rawValueNov: number;
  rawValueDec: number;
  createdAt: string; // date
  updatedAt: string; // date
}

// table "inputs" with expanded report and site
export interface InputEntryWithExpandedReportAndSite
  extends Omit<InputEntry, 'report' | 'facility' | 'site'> {
  report: {
    id: string;
    baseYear: number;
    year: number;
    site: {
      id: string;
      name: string;
      project: string; // reference on table projects
    };
  };
  facility: {
    id: string;
    name: string;
  };
}

// query object for table "inputs"
export interface UserInputQuery {
  scope?: number[];
  category?: string[];
  facility?: string[];
}

// table "reports"
export interface ReportEntry {
  [key: string]: any;
  id: string;
  site: string; // reference on table sites
  year: number;
  companyName: string;
  companyStreet: string;
  companyPostal: string;
  companyCity: string;
  companyCountry: string;
  companyDomain: string;
  contactName: string;
  contactTelephone: string;
  contactEmail: string;
  contactDomain: string;
  countEmployees: number;
  businessTurnover: number;
  baseYear: number;
  sumEmissions: number; // kann ggf. später weg?!
  createdAt: string; // date
  updatedAt: string; // date
}

// table "projects"
export interface ProjectEntry {
  id: string;
  name: string;
  logo: string; // url to the logo
  logoId: null | string; // reference on table files
  createdAt: string; // date
  updatedAt: string; // date
}

// table "user_projects"
export interface UserProjectEntry {
  userId: string; // reference on table users
  projectId: string; // reference on table projects
}

// table "sites"
export interface SiteEntry {
  id: string;
  name: string;
  project: string; // reference on table projects
  createdAt: string; // date
  updatedAt: string; // date
}

// table "actions"
export interface ActionEntry {
  id: string;

  // PM
  responsible: string;
  status: 'open' | 'inProgress' | 'finished' | 'canceled';
  progress: number; // 0-100

  relevant: boolean; // if false the action is not used in the calculation
  site: string; // reference on table sites
  name: string; // normal text

  descriptionBefore: string; // rich text
  descriptionAfter: string; // rich text

  targetValueAbsolutPlanned: number; // planned target value to save
  targetValueAbsolutIs: number; // actual target value to save
  descriptionTargetValue: string; // rich text

  finishedUntilPlanned: string | Date | null; // date
  finishedUntilIs: string | Date | null; // date

  category: string;

  costsPlanned: number;
  costsIs: number;
  roi: number; // return of investment
  descriptionCosts: string; // description of costs
  avoidanceCosts: number; // de="vermeidungskosten"

  createdAt: string; // date
  updatedAt: string; // date
}

export interface ActionWithPercentage extends ActionEntry {
  targetValuePlanned: number;
  targetValueIs: number;
}

// table facilities
export interface FacilityEntry {
  id: string;
  site: string; // reference on table sites
  name: string;
  manufacturer: string;
  model: null | string;
  description: string;
  shutdownDate: null | string | Date; // if null or empty the facility is in use
  createdAt: string; // date
  updatedAt: string; // date
}

// table "users"
export interface UserEntry {
  id: string;
  extUserId: string;
  email: string;
  emailVerified: boolean;
  profileImageName: null | string;
  firstname: string;
  surname: string;
  lastOrganisationId: string;
  phoneNumber: string;
  phoneNumberAsNumber: null | number;
  phoneNumberVerified: boolean;
  phonePinNumber: null | string;
  meta?: {
    // preferences:
    displayInTons?: boolean;
    lastSelectedProject?: null | string; // reference on table projects. can be empty
    lastSelectedSite?: null | string; // reference on table sites. can be empty
    lastSelectedReport?: null | string; // reference on table reports. can be empty
    selectedTheme?: string; // dark | light
    // admin
    isGlobalAdmin?: boolean;
    canManageProjects?: number;
    // user settings
    department?: string;
    role?: string;
  };
  createdAt: string; // date
  updatedAt: string; // date
}

// table "targets"
export interface TargetEntry {
  id: string;
  report: string; // reference on table reports
  year: number;
  percentage: number; // 0-100
  createdAt: string; // date
  updatedAt: string; // date
}
