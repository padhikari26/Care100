import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';

import 'network_exception.dart';

class ApiResponse<T> {
  final T? data;
  final String? message;
  final int? statusCode;
  final List<String>? errors;
  final DioException? dioError;
  final Stream<String>? stream;

  const ApiResponse({
    this.data,
    this.message,
    this.statusCode,
    this.errors,
    this.dioError,
    this.stream,
  });

  bool get isSuccess =>
      statusCode != null && statusCode! >= 200 && statusCode! < 300;
  bool get hasError => !isSuccess || dioError != null;

  String get formattedErrorMessage {
    if (dioError != null) {
      return NetworkException.getMessage(dioError!);
    }
    final hasDetails = errors != null && errors!.isNotEmpty;
    if (hasDetails) {
      return errors!.join(', ');
    }
    if (message?.trim().isNotEmpty ?? false) {
      return message!.trim();
    }

    return 'Something went wrong';
  }

  factory ApiResponse.fromDioResponse(Response response) {
    try {
      final data = response.data as Map<String, dynamic>?;
      final message = data?['message']?.toString();
      final errors = _parseErrors(data?['errors'] ?? data?['details']);

      return ApiResponse<T>(
        data: data != null ? data as T : null,
        message: message,
        statusCode: response.statusCode,
        errors: errors,
      );
    } catch (e) {
      return ApiResponse<T>(
        statusCode: response.statusCode,
        message: 'Failed to parse response',
        errors: ['Response parsing error'],
      );
    }
  }

  static Future<ApiResponse> fromDioStreamResponse(Response response) async {
    try {
      if (response.statusCode == 201) {
        Stream<String>? stream;
        if (response.data is ResponseBody) {
          // Create a StreamTransformer from utf8.decoder
          final transformer = StreamTransformer<Uint8List, String>.fromHandlers(
            handleData: (Uint8List data, EventSink<String> sink) {
              sink.add(utf8.decode(data));
            },
            handleError: (error, stackTrace, sink) {
              sink.addError(error, stackTrace);
            },
            handleDone: (sink) {
              sink.close();
            },
          );

          // Handle ResponseBody by accessing its stream
          stream = (response.data as ResponseBody).stream.transform(
            transformer,
          );
        } else if (response.data is Stream) {
          // Handle Stream<List<int>> or other stream types
          stream = (response.data as Stream).transform(utf8.decoder);
        } else if (response.data is String) {
          // Handle single String response
          stream = Stream.value(response.data as String);
        } else {
          return ApiResponse(
            statusCode: response.statusCode,
            message: 'Invalid stream response data',
          );
        }

        return ApiResponse(statusCode: response.statusCode, stream: stream);
      }
      return ApiResponse.fromDioResponse(response);
    } catch (e) {
      return ApiResponse(
        statusCode: response.statusCode,
        message: 'Failed to process stream response',
      );
    }
  }

  factory ApiResponse.fromDioError(DioException error) {
    if (error.response != null) {
      return ApiResponse.fromDioResponse(error.response!);
    }

    return ApiResponse<T>(
      dioError: error,
      statusCode: error.response?.statusCode,
      message: error.message,
    );
  }

  static List<String> _parseErrors(dynamic errorData) {
    if (errorData == null) return [];
    if (errorData is String) return [errorData];
    if (errorData is List) return errorData.whereType<String>().toList();
    if (errorData is Map) {
      return errorData.values.whereType<String>().toList();
    }
    return [];
  }

  @override
  String toString() =>
      'ApiResponse('
      'statusCode: $statusCode, '
      'message: $message, '
      'errors: $errors, '
      'hasError: $hasError'
      ')';
}
