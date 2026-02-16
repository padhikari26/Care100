enum APIPath {
  login,
  refreshToken,
  getTimesheet,
  profile,
  addSectionList,
  addTimesheet,
  updateTimesheet,
  updateProfile,
  downloadTimesheet,
  changePassword,
  authAddSectionList,
  register,
}

class APIPathHelper {
  static const String baseUrlDev = 'http://localhost:3000/api';
  static const String baseUrlProd = 'https://thecaresnow.com/api';

  static String authAPIs(APIPath path, {String? keyword, String? id}) {
    switch (path) {
      case APIPath.login:
        return '/auth/employee-login';
      case APIPath.refreshToken:
        return '/auth/refresh';
      case APIPath.authAddSectionList:
        return '/auth/authAddSectionList';
      case APIPath.register:
        return '/auth/register';
      default:
        return '/';
    }
  }

  static String profileAPIs(APIPath path, {String? keyword, String? id}) {
    switch (path) {
      case APIPath.profile:
        return '/users/profile';
      case APIPath.updateProfile:
        return '/users/employee/profile/$id';
      case APIPath.changePassword:
        return '/users/changepassword';
      default:
        return '/';
    }
  }

  static String getTimesheetAPIs(
    APIPath path, {
    String? keyword,
    String? startDate,
    String? endDate,
    String? id,
    Map<String, String?>? queryParams,
  }) {
    switch (path) {
      case APIPath.getTimesheet:
        return '/timesheet/weekly?${_buildQueryParams({'startDate': startDate, 'endDate': endDate})}';
      case APIPath.addTimesheet:
        return '/timesheet';
      case APIPath.addSectionList:
        return '/timesheet/addSectionList';
      case APIPath.updateTimesheet:
        return '/timesheet/$id';
      case APIPath.downloadTimesheet:
        return '/timesheet/download/weekly';
      default:
        return '/';
    }
  }

  static String _buildQueryParams(Map<String, String?> params) {
    final queryParams = params.entries
        .where((entry) => entry.value != null)
        .map((entry) => '${entry.key}=${entry.value}')
        .join('&');

    return queryParams;
  }
}
