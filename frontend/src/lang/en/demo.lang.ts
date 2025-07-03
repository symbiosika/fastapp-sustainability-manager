export default {
  dashboardDemo: 'Demo for Dashboard DataEngine',
  main: 'Main',
  project: 'Project',
  chooseSites: 'Choose the Sites',
  selectSite: 'Select a Site',
  chooseYears: 'Choose Years',
  selectYear: 'Select a Year',
  filters: 'Filters',
  useFilter: 'Use Filter',
  scopes: 'Scopes',
  selectScope: 'Select a Scope',
  categories: 'Categories',
  selectCategory: 'Select a Category',
  facilities: 'Facilities',
  selectFacility: 'Select a Facility',
  aggregationType: 'Aggregation type',
  function: 'Function',
  selectFunction: 'Select a Function',
  groupBy: 'GroupBy',
  groupByQuestion: 'How to group the data?',
  stackedCharts: 'Stacked Charts?',
  horizontalBars: 'Horizontal Bars?',
  getData: 'Let’s get data!',
  plotData: 'Plot data',
  cannotPlot: 'This data cannot be plotted as a Chart here.',
  barChart: 'Bar',
  lineChart: 'Line-Chart',
  lineChartWarning:
    "The function 'getYearlyGroupedReportData' returns a three level data structure. It is not possible to plot this data as a Line chart.",
  radarChart: 'Radar-Chart',
  radarChartWarning:
    "The function 'getYearlyGroupedReportData' returns a three level data structure. It is not possible to plot this data as a Radar chart.",
  pieChart: 'Pie-Chart',
  pieChartWarning:
    "The function 'getYearlyGroupedReportData' returns a three level data structure. It is not possible to plot this data as a Pie chart.",
  poleAreaChart: 'Pole-Area-Chart',
  poleAreaChartWarning:
    "The function 'getYearlyGroupedReportData' returns a three level data structure. It is not possible to plot this data as a Pole-Area chart.",
  treeMap: 'TreeMap',
  treeMapChartWarning:
    "The function 'getYearlyGroupedReportData' returns a three level data structure. It is not possible to plot this data as a TreeMap chart.",
  data: 'Data',
  reportingEngine:
    'The reporting Engine works on cached data. So it should be no problem to handle many requests. So you can make one query for each diagram.',
  getPlainReportData:
    "This function 'getPlainReportData' returns a plain timeseries of the data like it is stored in the database with additional information added to which site and project the data belongs.",
  getGroupedReportData:
    "This function 'getGroupedReportData' returns a grouped data as sum for the selected groupBy. It will return simple timeseries based on the groupBy. The timeseries always returns one value per year.",
  noDataAvailable:
    'Unfortunately, no data is available for the selected settings.',
};
