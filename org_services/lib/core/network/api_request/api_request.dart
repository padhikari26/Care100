import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:http/http.dart' as http;
import 'package:orgservice/env.dart';
import 'package:orgservice/features/auth/models/login_request_model.dart';
import 'package:orgservice/features/timesheets/model/all_timesheet_model.dart';

import '../../../app/utils/dependencies.dart';
import '../../../features/auth/models/login_response_model.dart';
import '../../../shared/services/database/shared_pref.dart';
import '../api/api_client.dart';
import '../api/api_constant.dart';
import '../api/api_result.dart';

class ApiRequest {
  final ApiClient _apiClient = getIt<ApiClient>();
  // final NetworkInfo _networkInfo = getIt<NetworkInfo>();

  Future<Map<String, String>> _defaultHeaders({String? contentType}) async {
    final token = await SharedPref.accessToken;
    return {
      HttpHeaders.contentTypeHeader: contentType ?? 'application/json',
      HttpHeaders.acceptHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer $token',
    };
  }

  Future<Map<String, String>> _mergeHeaders({
    String? contentType,
    Map<String, String>? additionalHeaders,
  }) async {
    final headers = await _defaultHeaders(contentType: contentType);
    if (additionalHeaders != null) {
      headers.addAll(additionalHeaders);
    }

    return headers;
  }

  // Future<bool> _isNetworkConnected() async {
  //   final isConnected = await _networkInfo.isConnected;
  //   if (!isConnected) {
  //     throw NetworkException.getMessage(
  //       SocketException('No internet connection'),
  //     );
  //   }
  //   return true;
  // }

  Future<ApiResponse> login(LoginRequestModel request) async {
    final response = await _apiClient.post(
      APIPathHelper.authAPIs(APIPath.login),
      data: request.toJson(),
      options: Options(headers: await _mergeHeaders()),
    );

    if (response.isSuccess) {
      return ApiResponse(data: response.data, statusCode: response.statusCode);
    }

    return response;
  }

  Future<ApiResponse> refreshToken({
    required String refreshToken,
    Map<String, String>? additionalHeaders,
  }) async {
    final response = await _apiClient.post(
      APIPathHelper.authAPIs(APIPath.refreshToken),
      data: {},
      options: Options(
        headers: await _mergeHeaders(
          additionalHeaders: {'X-Custom-Token': refreshToken},
        ),
      ),
    );

    if (response.isSuccess) {
      return ApiResponse(data: response.data, statusCode: response.statusCode);
    }
    return response;
  }

  Future<ApiResponse> getTimesheet({
    String? cursor,
    String? limit,
    DateTime? fromDate,
    DateTime? toDate,
    Map<String, String?>? queryParams,
  }) async {
    final response = await _apiClient.get(
      APIPathHelper.getTimesheetAPIs(
        APIPath.getTimesheet,
        startDate: fromDate?.toIso8601String(),
        endDate: toDate?.toIso8601String(),
        queryParams: queryParams,
      ),
      options: Options(headers: await _mergeHeaders()),
    );

    if (response.isSuccess) {
      return ApiResponse(data: response.data, statusCode: response.statusCode);
    }
    return response;
  }

  //getProfile
  Future<ApiResponse> getProfile({
    Map<String, String>? additionalHeaders,
  }) async {
    final response = await _apiClient.get(
      APIPathHelper.profileAPIs(APIPath.profile),
      options: Options(
        headers: await _mergeHeaders(additionalHeaders: additionalHeaders),
      ),
    );

    if (response.isSuccess) {
      return ApiResponse(data: response.data, statusCode: response.statusCode);
    }
    return response;
  }

  //updateProfile

  Future<ApiResponse> updateProfile({required UserData userData}) async {
    final data = {
      'name': userData.name,
      'email': userData.email,
      'signature': userData.signature,
      'role': userData.role,
      'reportingTo': userData.reportingTo,
      'contactNumber': userData.contactNumber,
      'address': userData.address,
      'gender': userData.gender,
      'dob': userData.birthDay,
    };
    final response = await _apiClient.post(
      APIPathHelper.profileAPIs(APIPath.updateProfile, id: userData.id),
      data: data,
      options: Options(headers: await _mergeHeaders()),
    );
    if (response.isSuccess) {
      return ApiResponse(data: response.data, statusCode: response.statusCode);
    }
    return response;
  }

  Future<ApiResponse> addTimesheet({
    required Map<String, dynamic> data,
    Map<String, String>? additionalHeaders,
  }) async {
    final response = await _apiClient.post(
      APIPathHelper.getTimesheetAPIs(APIPath.addTimesheet),
      data: data,
      options: Options(
        headers: await _mergeHeaders(additionalHeaders: additionalHeaders),
      ),
    );

    if (response.isSuccess) {
      return ApiResponse(data: response.data, statusCode: response.statusCode);
    }
    return response;
  }

  Future<ApiResponse> updateTimesheet({
    required String id,
    required Map<String, dynamic> data,
    Map<String, String>? additionalHeaders,
  }) async {
    final response = await _apiClient.put(
      APIPathHelper.getTimesheetAPIs(APIPath.updateTimesheet, id: id),
      data: data,
      options: Options(
        headers: await _mergeHeaders(additionalHeaders: additionalHeaders),
      ),
    );

    if (response.isSuccess) {
      return ApiResponse(data: response.data, statusCode: response.statusCode);
    }
    return response;
  }

  Future<ApiResponse> addSectionList({
    Map<String, String>? additionalHeaders,
  }) async {
    final response = await _apiClient.get(
      APIPathHelper.getTimesheetAPIs(APIPath.addSectionList),
      options: Options(
        headers: await _mergeHeaders(additionalHeaders: additionalHeaders),
      ),
    );

    if (response.isSuccess) {
      return ApiResponse(data: response.data, statusCode: response.statusCode);
    }
    return response;
  }

  //downloadTimesheet
  Future<http.Response> downloadTimesheet({
    required String employeeId,
    DateTime? startDate,
    DateTime? endDate,
    Map<String, String>? additionalHeaders,
  }) async {
    try {
      final response = await http.post(
        Uri.parse("${AppEnviro.baseUrl}/timesheet/download/weekly"),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await SharedPref.accessToken}',
        },
        body: jsonEncode({
          'employeeId': employeeId,
          'startDate':
              "${startDate?.year}-${startDate?.month.toString().padLeft(2, '0')}-${startDate?.day.toString().padLeft(2, '0')}",
          'endDate':
              "${endDate?.year}-${endDate?.month.toString().padLeft(2, '0')}-${endDate?.day.toString().padLeft(2, '0')}",
        }),
      );
      return response;
    } catch (e) {
      log('Error downloading timesheet: $e');
      throw Exception('Failed to download timesheet: $e');
    }
  }

  //changePassword
  Future<ApiResponse> changePassword({
    required String oldPassword,
    required String newPassword,
    Map<String, String>? additionalHeaders,
  }) async {
    final data = {'currentPassword': oldPassword, 'newPassword': newPassword};
    final response = await _apiClient.post(
      APIPathHelper.profileAPIs(APIPath.changePassword),
      data: data,
      options: Options(
        headers: await _mergeHeaders(additionalHeaders: additionalHeaders),
      ),
    );

    if (response.isSuccess) {
      return ApiResponse(data: response.data, statusCode: response.statusCode);
    }
    return response;
  }

  //authAddSectionList
  Future<ApiResponse> authAddSectionList({
    Map<String, String>? additionalHeaders,
  }) async {
    final response = await _apiClient.get(
      APIPathHelper.authAPIs(APIPath.authAddSectionList),
      options: Options(
        headers: await _mergeHeaders(additionalHeaders: additionalHeaders),
      ),
    );

    if (response.isSuccess) {
      return ApiResponse(data: response.data, statusCode: response.statusCode);
    }
    return response;
  }

  //register
  Future<ApiResponse> register({
    required Map<String, dynamic> data,
    Map<String, String>? additionalHeaders,
  }) async {
    final response = await _apiClient.post(
      APIPathHelper.authAPIs(APIPath.register),
      data: data,
      options: Options(
        headers: await _mergeHeaders(additionalHeaders: additionalHeaders),
      ),
    );

    if (response.isSuccess) {
      return ApiResponse(data: response.data, statusCode: response.statusCode);
    }
    return response;
  }
}
