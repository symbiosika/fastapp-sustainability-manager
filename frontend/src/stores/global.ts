import { defineStore } from 'pinia';
import {
  EquivalentEntry,
  FacilityEntry,
  ProjectEntry,
  ReportEntry,
  SiteEntry,
  TargetEntry,
} from './../services/types';
import dataprovider from './../services/dataprovider';

// simple hack to get the equivalent entries as a dict without the store
// should be changed in the future
export const equivalentsAsDict: { [key: string]: EquivalentEntry } = {};

export interface GlobalState {
  isLoading: boolean;
  isLoggedIn: boolean;
  requestPending: boolean;
  // layout and theme
  theme: 'light' | 'dark';
  showTooltips: boolean;
  displayInTons: boolean;
  // user information
  username: string;
  isGlobalAdmin: boolean;
  // equivalents
  equivalents: EquivalentEntry[];
  equivalentDict: { [key: string]: EquivalentEntry };
  equivalentFilters: {
    category: {
      all: string[];
      scope1: string[];
      scope2: string[];
      scope3: string[];
    };
    unit: {
      all: string[];
    };
    source: {
      all: string[];
    };
  };
  //
  facilities: FacilityEntry[];
  facilitiesDict: { [id: string]: FacilityEntry };
  // projects
  projects: ProjectEntry[];
  selectedProject: null | ProjectEntry;
  // sites
  sites: SiteEntry[];
  selectedSite: null | SiteEntry;
  // reports
  reports: ReportEntry[];
  selectedReport: null | ReportEntry;
  // targets
  targetOnSiteForProject: TargetEntry[];
}

export interface GlobalActions {
  initializeStore: () => Promise<void>;
  // equivalents
  refreshEquivalents: (force?: boolean) => Promise<void>;
  addEquivalent: (equivalent: EquivalentEntry) => Promise<EquivalentEntry>;
  updateEquivalent: (equivalent: EquivalentEntry) => Promise<EquivalentEntry>;
  dropEquivalent: (equivalent: EquivalentEntry) => Promise<void>;
  // projects
  refreshProjects: (force?: boolean) => Promise<void>;
  addProject: (project: ProjectEntry) => Promise<ProjectEntry>;
  updateProject: (project: ProjectEntry) => Promise<ProjectEntry>;
  dropProject: (project: ProjectEntry) => Promise<void>;
  changeProject: (project: ProjectEntry) => Promise<void>;
  // targets
  refreshTargets: () => Promise<void>;
  sortTargets: () => void;
  addTarget: (target: TargetEntry) => Promise<TargetEntry>;
  updateTarget: (target: TargetEntry) => Promise<TargetEntry>;
  dropTarget: (target: TargetEntry) => Promise<void>;
  copyTargets: (fromId: string, toId: string) => Promise<{ copied: number }>;
  // reports
  refreshReports: (force?: boolean) => Promise<void>;
  getNewReport: () => ReportEntry;
  ensureLatestReport: () => Promise<void>;
  addReport: (report: ReportEntry) => Promise<ReportEntry>;
  dropReport: (report: ReportEntry) => Promise<void>;
  updateReport: (report: ReportEntry) => Promise<ReportEntry>;
  changeReport: (report?: ReportEntry) => Promise<void>;
  // sites
  addSite: (site: SiteEntry) => Promise<SiteEntry>;
  updateSite: (site: SiteEntry) => Promise<SiteEntry>;
  dropSite: (site: SiteEntry) => Promise<void>;
  ensureSiteIsSelected: () => Promise<void>;
  changeSite: (site: SiteEntry) => Promise<void>;
  // facilities
  addFacility: (facility: FacilityEntry) => Promise<FacilityEntry>;
  updateFacility: (facility: FacilityEntry) => Promise<FacilityEntry>;
  dropFacility: (facility: FacilityEntry) => Promise<void>;
  refreshFacilities: () => Promise<void>;
  // ui
  changeTheme: (theme: 'light' | 'dark') => void;
  saveUserSettings: () => void;
  getUserSettings: () => void;
}

export const useGlobalStore = defineStore('global', {
  state: (): GlobalState => ({
    isLoading: true,
    isLoggedIn: false,
    requestPending: false,
    //
    username: '',
    isGlobalAdmin: false,
    theme: 'light' as 'light' | 'dark',
    showTooltips: false,
    displayInTons: true,
    //
    equivalents: [],
    equivalentDict: {},
    equivalentFilters: {
      category: {
        all: [],
        scope1: [],
        scope2: [],
        scope3: [],
      },
      unit: {
        all: [],
      },
      source: {
        all: [],
      },
    },
    //
    facilities: [],
    facilitiesDict: {},
    //
    projects: [],
    selectedProject: null,
    //
    sites: [],
    selectedSite: null,
    //
    reports: [],
    selectedReport: null,
    //
    targetOnSiteForProject: [],
  }),

  actions: {
    /**
     * MAIN FUNCTION when App is loaded.
     * This will load all necessary data from the backend and initialize the store.
     */
    async initializeStore() {
      this.isLoading = true;

      await dataprovider.ensureUserIsExisting();
      const user = await dataprovider.getUser();
      this.username = user.email;

      // get user settings
      this.getUserSettings();

      await this.refreshProjects();
      let projectHadToBeCreated = false;
      // check the last selected entries if they are still valid
      if (
        user.meta?.lastSelectedProject != null &&
        user.meta?.lastSelectedProject !== '' &&
        this.projects.length > 0 &&
        this.projects.find((p) => p.id === user.meta?.lastSelectedProject) !=
          null
      ) {
        const p = this.projects.find(
          (p) => p.id === user.meta?.lastSelectedProject,
        );
        if (p) this.selectedProject = p;
      } else {
        // select another project or create a new one
        projectHadToBeCreated = (await this.ensureProjectIsSelected())
          .projectHadToBeCreated;
      }

      // then refresh the sites
      this.sites = await dataprovider.readSitesForProject();
      await this.ensureSiteIsSelected();

      if (
        user.meta?.lastSelectedSite != null &&
        user.meta?.lastSelectedSite !== ''
      ) {
        const s = this.sites.find((s) => s.id === user.meta?.lastSelectedSite);
        if (s) this.selectedSite = s;
      } else {
        // select another site or create a new one
        await this.ensureSiteIsSelected();
      }
      // then refresh facilities
      await this.refreshFacilities();

      // then load reports for the selected project and site
      await this.refreshReports(true);
      if (
        user.meta?.lastSelectedReport != null &&
        user.meta?.lastSelectedReport !== ''
      ) {
        const r = this.reports.find(
          (r) => r.id === user.meta?.lastSelectedReport,
        );
        if (r) this.selectedReport = r;
      } else {
        this.selectedReport = null;
      }

      if (!this.selectedReport) {
        await this.ensureLatestReport();
        await this.refreshReports(true);
      }
      await this.refreshEquivalents(true);

      // load the targets for the selected report
      if (projectHadToBeCreated) {
        console.log(
          'A new project was created. Redirect to onboarding wizard and add the default target.',
        );
        dataprovider.createTarget({
          id: 'new',
          report: this.selectedReport?.id ?? '',
          year: 2040,
          percentage: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      await this.refreshTargets();

      this.isLoading = false;
      return {
        redirect: projectHadToBeCreated ? 'onboarding-wizard' : undefined,
      };
    },

    // *************************************************************
    // CRUD cache for "equivalents"
    // *************************************************************

    /**
     * reload the cache for "equivalents" from backend.
     * This will not overwrite it if still data in cache. (use force = true to overwrite)
     */
    async refreshEquivalents(force = false) {
      if (force || this.equivalents.length === 0) {
        this.equivalents = await dataprovider.readEquivalents();
        // sort by "name"
        this.equivalents.sort((a: EquivalentEntry, b: EquivalentEntry) =>
          a.specification1.localeCompare(b.specification1),
        );
        // create dict
        this.equivalentDict = this.equivalents.reduce(
          (acc, cur) => ({ ...acc, [cur.id]: cur }),
          {},
        );

        // create a list of all unique entries for category
        this.equivalentFilters.category.all = [];
        this.equivalents.forEach((equivalent: EquivalentEntry) => {
          if (
            !this.equivalentFilters.category.all.includes(equivalent.category)
          ) {
            this.equivalentFilters.category.all.push(equivalent.category);
          }
        });
        // create a list of all unique entries for category grouped by scope 1,2,3
        this.equivalentFilters.category.scope1 = [];
        this.equivalentFilters.category.scope2 = [];
        this.equivalentFilters.category.scope3 = [];

        // create a list of all unique entries for unit
        this.equivalentFilters.unit.all = [];

        // create a list of all unique entries for source
        this.equivalentFilters.source.all = [];

        this.equivalents.forEach((equivalent: EquivalentEntry) => {
          if (
            equivalent.scope === 1 &&
            !this.equivalentFilters.category.scope1.includes(
              equivalent.category,
            )
          ) {
            this.equivalentFilters.category.scope1.push(equivalent.category);
          }
          if (
            equivalent.scope === 2 &&
            !this.equivalentFilters.category.scope2.includes(
              equivalent.category,
            )
          ) {
            this.equivalentFilters.category.scope2.push(equivalent.category);
          }
          if (
            equivalent.scope === 3 &&
            !this.equivalentFilters.category.scope3.includes(
              equivalent.category,
            )
          ) {
            this.equivalentFilters.category.scope3.push(equivalent.category);
          }

          if (!this.equivalentFilters.unit.all.includes(equivalent.in)) {
            this.equivalentFilters.unit.all.push(equivalent.in);
          }

          if (!this.equivalentFilters.source.all.includes(equivalent.source)) {
            this.equivalentFilters.source.all.push(equivalent.source);
          }
        });
      }
    },

    /**
     * Add a new equivalent to the cache and backend.
     * This euquvalent will always be a project specific equivalent!
     */
    async addEquivalent(equivalent: EquivalentEntry) {
      const created = await dataprovider.createEquivalent(equivalent);
      // add equivalent to local store at position 0
      this.equivalents.push(created);
      // sort the local equivalents in store by "name"
      this.equivalents.sort((a: EquivalentEntry, b: EquivalentEntry) =>
        a.specification1.localeCompare(b.specification1),
      );
      this.equivalentDict[created.id] = created;
      return created;
    },

    /**
     * Update an equivalent in the cache and backend.
     * Only project specific equivalents can be updated.
     */
    async updateEquivalent(equivalent: EquivalentEntry) {
      const updated = await dataprovider.updateEquivalents(equivalent);
      // get index of existing equivalent
      const index = this.equivalents.findIndex(
        (e: EquivalentEntry) => e.id === equivalent.id,
      );
      // replace existing equivalent from store with updated equivalent
      if (index > -1) {
        this.equivalents.splice(index, 1, updated);
      }
      // also update the dict
      this.equivalentDict[equivalent.id] = updated;
      return updated;
    },

    /**
     * Drop an equivalent from the cache and backend.
     * Only project specific equivalents can be dropped.
     */
    async dropEquivalent(equivalent: EquivalentEntry) {
      await dataprovider.deleteEquivalent(equivalent.id);
      // drop equivalent from local store
      this.equivalents = this.equivalents.filter(
        (e: EquivalentEntry) => e.id !== equivalent.id,
      );
      delete this.equivalentDict[equivalent.id];
    },

    // *************************************************************
    // CRUD cache for "projects"
    // *************************************************************

    /**
     * ensure that a project is selected and that a project is existing.
     */
    async ensureProjectIsSelected() {
      // if a user has NO projects, he can not use the app
      // so we need to create one here

      let projectHadToBeCreated = false;

      if (this.projects.length === 0) {
        console.log('no projects found. create a new one');
        await this.addProject({
          id: 'new',
          name: 'Ihr Firmenname',
          logo: '',
          logoId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        projectHadToBeCreated = true;
        this.selectedProject = this.projects[0];
        this.targetOnSiteForProject = [];
      } else {
        // select the first project
        this.selectedProject = this.projects[0];
      }

      return { projectHadToBeCreated };
    },

    /**
     * reload the cache for "targets" from backend for selected project.
     */
    async refreshTargets() {
      this.targetOnSiteForProject = await dataprovider.readTargets();
      this.sortTargets();
    },

    /**
     * sort all targets by year in ascending order.
     */
    sortTargets() {
      this.targetOnSiteForProject.sort(
        (a: TargetEntry, b: TargetEntry) => a.year - b.year,
      );
    },

    /**
     * Add a new target to the cache and backend.
     */
    async addTarget(target: TargetEntry) {
      const created = await dataprovider.createTarget(target);
      this.targetOnSiteForProject.push(created);
      this.sortTargets();
      return created;
    },

    /**
     * Update a target in the cache and backend.
     */
    async updateTarget(target: TargetEntry) {
      const updated = await dataprovider.updateTarget(target);
      const index = this.targetOnSiteForProject.findIndex(
        (t: TargetEntry) => t.id === target.id,
      );
      if (index > -1) {
        this.targetOnSiteForProject[index] = updated;
      }
      this.sortTargets();
      return updated;
    },

    /**
     * Drop a target from the cache and backend.
     */
    async dropTarget(target: TargetEntry) {
      await dataprovider.deleteTarget(target.id);
      this.targetOnSiteForProject = this.targetOnSiteForProject.filter(
        (t: TargetEntry) => t.id !== target.id,
      );
      this.sortTargets();
    },

    /**
     * a function to copy all targets from one report to another.
     * will check if targets exist and skip all if some are already existing.
     */
    async copyTargets(fromId: string, toId: string) {
      // get all targets from the source report
      const targets = await dataprovider.readTargets(fromId);
      // check if targets are already existing in the target report
      const existing = await dataprovider.readTargets(toId);

      let copied = 0;

      if (existing.length < 1) {
        // copy all targets to the target report
        targets.forEach(async (target: TargetEntry) => {
          await dataprovider.createTarget({
            ...target,
            report: toId,
          });
        });
        // reload targets
        await this.refreshTargets();

        copied = targets.length;
      }
      return {
        copied,
      };
    },

    // *************************************************************
    // CRUD cache for "projects"
    // *************************************************************

    /**
     * reload the cache for "projects" from backend.
     * this will only be done if the cache is empty. (use force = true to overwrite)
     * this will only list projects that belong to the current user.
     */
    async refreshProjects(force = false) {
      if (force || this.projects.length === 0) {
        this.projects = await dataprovider.readProjects();
      }
    },

    /**
     * Add a new project to the cache and backend.
     * A user can only add projects that belong to him any can add users later.
     */
    async addProject(project: ProjectEntry) {
      const created = await dataprovider.createProject(project);
      // add this user to this project. Update user settings
      const user = await dataprovider.getUser();
      await dataprovider.updateUser({
        ...user,
      });
      // the user will be added to the project automatically in the backend

      this.projects.push(created);
      return created;
    },

    /**
     * Update a project in the cache and backend.
     * A user can only update projects that belong to him.
     */
    async updateProject(project: ProjectEntry) {
      const updated = await dataprovider.updateProject(project);
      const index = this.projects.findIndex(
        (p: ProjectEntry) => p.id === project.id,
      );
      if (index > -1) {
        this.projects[index] = updated;
      }
      return updated;
    },

    /**
     * Drop a project from the cache and backend.
     * A user can only drop projects that belong to him.
     */
    async dropProject(project: ProjectEntry) {
      await dataprovider.deleteProject(project.id);
      this.projects = this.projects.filter(
        (p: ProjectEntry) => p.id !== project.id,
      );
      this.ensureProjectIsSelected();
    },

    /**
     * Action to change the current project.
     * This will also reload the reports for the new project.
     * This will also reload the equivalents for the new project.
     */
    async changeProject(project: ProjectEntry) {
      // reset some variables
      this.sites = [];
      this.reports = [];

      // set new project
      this.selectedProject = project;

      // reload sites
      this.sites = await dataprovider.readSitesForProject();
      await this.ensureSiteIsSelected();
      // reload reports
      this.reports = await dataprovider.readReports();
      await this.ensureLatestReport();

      // reload also equivalents and targets
      await this.refreshEquivalents();
      await this.refreshTargets();

      // update user settings
      const user = await dataprovider.getUser();
      await dataprovider.updateUser({
        ...user,
        meta: {
          ...(user.meta ?? {}),
          lastSelectedProject: this.selectedProject?.id ?? '',
          lastSelectedSite: this.selectedSite?.id ?? '',
          lastSelectedReport: this.selectedReport?.id ?? '',
        },
      });
    },

    /**
     * Action to change the current site.
     * This will also reload the reports for the new site.
     */
    async changeSite(site: SiteEntry) {
      this.selectedSite = site;
      this.reports = [];
      this.reports = await dataprovider.readReports();
      await this.refreshFacilities();
      await this.ensureLatestReport();

      // update user settings
      const user = await dataprovider.getUser();
      await dataprovider.updateUser({
        ...user,
        meta: {
          ...(user.meta ?? {}),
          lastSelectedProject: this.selectedSite?.id ?? '',
          lastSelectedReport: this.selectedReport?.id ?? '',
        },
      });
    },

    // *************************************************************
    // CRUD cache for "reports"
    // *************************************************************

    /**
     * create an empty report object.
     */
    getNewReport(): ReportEntry {
      // check if a older report is existing
      if (this.reports.length > 0) {
        // get the latest report. so sort by year and get the last one
        const sorted = this.reports.sort(
          (a: ReportEntry, b: ReportEntry) => a.year - b.year,
        );
        const latest = sorted[sorted.length - 1];
        const report: ReportEntry = {
          ...latest,
          id: 'new',
          year: latest.year + 1,
        };
        return report;
      }
      const report: ReportEntry = {
        id: 'new',
        site: this.selectedSite?.id ?? '',
        year: new Date().getFullYear(),
        companyName: '',
        companyStreet: '',
        companyPostal: '',
        companyCity: '',
        companyCountry: '',
        companyDomain: '',
        contactName: '',
        contactTelephone: '',
        contactEmail: '',
        contactDomain: '',
        countEmployees: 0,
        businessTurnover: 0,
        baseYear: new Date().getFullYear(),
        sumEmissions: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return report;
    },

    /**
     * reload the cache for "reports" from backend.
     * this will only be done if the cache is empty. (use force = true to overwrite)
     * All projects belong to ONE project.
     */
    async refreshReports(force = false) {
      if (force || this.reports.length === 0) {
        this.reports = await dataprovider.readReports();
      }
    },

    /**
     * Load the report with the highest year.
     */
    async ensureLatestReport() {
      if (this.reports.length > 0) {
        this.selectedReport = this.reports.reduce(
          (a: ReportEntry, b: ReportEntry) => (a.year > b.year ? a : b),
        );
      } else {
        // create a new one since at least one report is needed
        this.selectedReport = await dataprovider.createReport(
          this.getNewReport(),
        );
      }
    },

    /**
     * Add a new report to the cache and backend.
     * A report belongs to the selected project.
     */
    async addReport(report: ReportEntry) {
      const created = await dataprovider.createReport(report);
      this.reports.push(created);
      this.selectedReport = created;
      return created;
    },

    /**
     * Drop a report from the cache and backend.
     * A user can only drop reports that belong to projects that belong to him.
     */
    async dropReport(report: ReportEntry) {
      await dataprovider.deleteReport(report.id);
      this.reports = this.reports.filter(
        (r: ReportEntry) => r.id !== report.id,
      );
    },

    /**
     * Update a report in the cache and backend.
     * A user can only update reports that belong to projects that belong to him.
     */
    async updateReport(report: ReportEntry) {
      const updated = await dataprovider.updateReport(report);
      const index = this.reports.findIndex(
        (r: ReportEntry) => r.id === report.id,
      );
      if (index > -1) {
        this.reports[index] = updated;
      }
      this.selectedReport = updated;
      return updated;
    },

    async changeReport(report?: ReportEntry) {
      if (report) {
        this.selectedReport = report;
      }
      // get the targets for the selected report
      this.refreshTargets();

      // update user settings
      const user = await dataprovider.getUser();
      await dataprovider.updateUser({
        ...user,
        meta: {
          ...(user.meta ?? {}),
          lastSelectedReport: this.selectedReport?.id ?? '',
        },
      });
    },

    // *************************************************************
    // CRUD cache for "sites"
    // *************************************************************

    /**
     * Add a new site to the cache and backend.
     */
    async addSite(site: SiteEntry) {
      const created = await dataprovider.createSite(site);
      this.sites.push(created);
      return created;
    },

    /**
     * Update a site in the cache and backend.
     */
    async updateSite(site: SiteEntry) {
      const updated = await dataprovider.updateSite(site);
      const index = this.sites.findIndex((s: SiteEntry) => s.id === site.id);
      if (index > -1) {
        this.sites[index] = updated;
      }
      return updated;
    },

    /**
     * Drop a site from the cache and backend.
     */
    async dropSite(site: SiteEntry) {
      await dataprovider.deleteSite(site.id);
      this.sites = this.sites.filter((s: SiteEntry) => s.id !== site.id);
      this.ensureSiteIsSelected();
    },

    /**
     * a helper to ensure that a site is selected.
     */
    async ensureSiteIsSelected() {
      if (this.sites.length === 0) {
        console.log('no sites found. create a new one');
        await this.addSite({
          id: 'new',
          name: 'Haupstandort',
          project: this.selectedProject?.id ?? '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        this.selectedSite = this.sites[0];
      } else {
        this.selectedSite = this.sites[0];
      }
    },

    // *************************************************************
    // CRUD cache for "facilities"
    // *************************************************************

    /**
     * Add a new facility to the cache and backend.
     */
    async addFacility(facility: FacilityEntry) {
      const created = await dataprovider.createFacility(facility);
      this.facilities.push(created);
      this.facilitiesDict[created.id] = created;
      return created;
    },

    /**
     * Update a facility in the cache and backend.
     */
    async updateFacility(facility: FacilityEntry) {
      const updated = await dataprovider.updateFacility(facility);
      const index = this.facilities.findIndex(
        (f: FacilityEntry) => f.id === facility.id,
      );
      if (index > -1) {
        this.facilities[index] = updated;
      }
      this.facilitiesDict[facility.id] = updated;
      return updated;
    },

    /**
     * Drop a facility from the cache and backend.
     */
    async dropFacility(facility: FacilityEntry) {
      await dataprovider.deleteFacility(facility.id);
      this.facilities = this.facilities.filter(
        (f: FacilityEntry) => f.id !== facility.id,
      );
      delete this.facilitiesDict[facility.id];
    },

    /**
     * reload the cache for "facilities" from backend.
     */
    async refreshFacilities() {
      if (this.facilities.length === 0) {
        this.facilities = await dataprovider.readFacilities();
        // create dict
        this.facilitiesDict = this.facilities.reduce(
          (acc, cur) => ({ ...acc, [cur.id]: cur }),
          {},
        );
      }
    },

    // *************************************************************
    // theme and ui
    // *************************************************************

    changeTheme(theme: 'light' | 'dark') {
      this.theme = theme;
    },

    /**
     * save the actual user settings in local storage.
     */
    saveUserSettings() {
      // store user settings in local storage
      localStorage.setItem('psm_mode', this.theme);
    },

    /**
     * get the users last settings from local storage.
     */
    getUserSettings() {
      // get user settings from local storage
      const mode = localStorage.getItem('psm_mode');
      if (mode && (mode === 'light' || mode === 'dark')) {
        this.theme = mode;
      }
    },
  },
});
