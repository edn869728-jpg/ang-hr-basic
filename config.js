window。ANG_HR_CONFIG = {
  edition: 'basic',
  editionName: 'ANG HR Basic',

  apiBaseUrl: 'https://script.google.com/macros/s/AKfycbylg5KENMMvwj6aqeK51ASk-uT6CsJLob6dix2ELmoP5rf8Yla5RnRKTiaVtkrA9dPm/exec',
  gasUrl: 'https://script.google.com/macros/s/AKfycbylg5KENMMvwj6aqeK51ASk-uT6CsJLob6dix2ELmoP5rf8Yla5RnRKTiaVtkrA9dPm/exec',

  defaultPage: 'employee',

  features: {
    employeeLogin: true,
    employeeHome: true,
    todayStatus: true,
    clockIn: true,
    clockOut: true,
    clockRecords: true,
    leave: true,
    clockFix: true,
    notices: true,
    themeSave: true,

    clock: true,
    gpsClock: true,
    fieldClock: true,
    overtimeClock: true,
    iosShortcut: true,

    salary: true,
    salaryPreview: true,
    salaryDraft: false,
    officialSalary: false,
    salaryExport: false,
    salarySlipDownload: false,

    adminHome: true,
    manager: true,
    reviews: true,
    leaveReview: true,
    clockFixReview: true,
    messageReview: true,
    noticePublish: true,

    people: true,
    peopleBasic: true,

    preselect: false,
    upload: false,
    uploadReview: false,
    schedule: false,
    scheduleCreate: false,
    schedulePublish: false,
    employeeScheduleCalendar: false,
    preselectSummary: false,
    shiftView: false,

    permissions: false,
    creatorPermissionCenter: false,
    laborInsurance: false,
    healthInsurance: false,
    pension: false,
    archive: false,
    driveExport: false,
    advancedSystemSettings: false,
    multiLevelReview: false,
    customReviewFlow: false,
    currentStepReview: false,

    multiBranch: false,
    branchManagement: false,
    crossBranchSupport: false,
    branchQuotaManagement: false,
    employeeQuotaManagement: false,

    roleManagement: false,
    permissionManagement: false,
    creatorMode: false,
    apiSettings: false,
    webhook: false,
    lineNotify: false,
    externalIntegration: false,
    dataCenter: false,
    dataExport: false,
    backup: false,
    apiLogs: false,
    errorLogs: false,
    driveUpload: false,
    driveAttachment: false,
    customDriveFolder: false,
    customSalaryRules: false,
    customOvertimeRules: false
  },

  limits: {
    includedBranches: 1,
    includedEmployees: 5,
    extraBranchPack: {
      branches: 1,
      employees: 5
    },
    extraEmployeePack: {
      employees: 10
    }
  }
};
