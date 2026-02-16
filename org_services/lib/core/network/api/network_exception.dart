import 'dart:io';

import 'package:dio/dio.dart';

import 'api_result.dart';

abstract class NetworkException {
  static String getMessage(dynamic error) {
    if (error is DioException) {
      return _handleDioError(error);
    }
    if (error is ApiResponse) {
      return error.formattedErrorMessage;
    }
    if (error is SocketException) {
      return 'No internet connection';
    }
    return error.toString();
  }

  static String _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Request timeout';
      case DioExceptionType.badResponse:
        return _parseErrorResponse(error.response);
      case DioExceptionType.cancel:
        return 'Request cancelled';
      case DioExceptionType.unknown:
        return 'No internet connection';
      default:
        return 'Server error occurred';
    }
  }

  static String _parseErrorResponse(Response? response) {
    if (response == null) return 'Unknown server error';

    final statusCode = response.statusCode;
    final data = response.data as Map<String, dynamic>?;

    final message = data?['message']?.toString() ?? 'Request failed';
    final errors = (data?['errors'] ?? data?['details'])?.toString() ?? '';

    return switch (statusCode) {
      400 => '$message. $errors'.trim(),
      401 => 'You have been logged out. Please log in again.',
      403 => 'Forbidden: $message',
      404 => 'Not found: $message',
      500 => 'Server error: $message',
      _ => '$message (Status: $statusCode)',
    };
  }
}
