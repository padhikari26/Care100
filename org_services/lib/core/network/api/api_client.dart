import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:dio_curl_logger/dio_curl_logger.dart';
import 'package:flutter/foundation.dart';

import '../../../env.dart';
import 'api_result.dart';
import 'auth_interceptor.dart';

class ApiClient {
  final Dio _dio;
  final String baseUrl;

  Dio get dio => _dio;

  ApiClient({required this.baseUrl}) : _dio = Dio() {
    _dio.options = BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    );

    _dio.interceptors.add(AuthInterceptor());
    AppEnviro.enviroment == Enviroment.dev
        ? _dio.interceptors.add(
          CurlLoggingInterceptor(
            showRequestLog: kDebugMode,
            showResponseLog: kDebugMode,
          ),
        )
        : null;
    (_dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
      final client = HttpClient();
      client.badCertificateCallback = (certificate, host, port) => true;
      return client;
    };
  }

  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? query,
    Options? options,
  }) async {
    return _request<T>(
      () => _dio.get(path, queryParameters: query, options: options),
    );
  }

  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? query,
    Options? options,
  }) async {
    return _request<T>(
      () =>
          _dio.post(path, data: data, queryParameters: query, options: options),
    );
  }

  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? query,
    Options? options,
  }) async {
    return _request<T>(
      () =>
          _dio.put(path, data: data, queryParameters: query, options: options),
    );
  }

  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? query,
    Options? options,
  }) async {
    return _request<T>(
      () => _dio.patch(
        path,
        data: data,
        queryParameters: query,
        options: options,
      ),
    );
  }

  Future<ApiResponse<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? query,
    Options? options,
  }) async {
    return _request<T>(
      () => _dio.delete(
        path,
        data: data,
        queryParameters: query,
        options: options,
      ),
    );
  }

  //stream
  Future<Response> stream(
    String path, {
    dynamic data,
    Map<String, dynamic>? query,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: query,
        options: options,
        cancelToken: cancelToken,
      );
      return response;
    } on DioException catch (e) {
      if (CancelToken.isCancel(e)) {
        return Response(
          statusCode: null,
          statusMessage: 'Request cancelled',
          requestOptions: e.requestOptions,
        );
      }
      return Response(
        statusCode: e.response?.statusCode,
        statusMessage: e.message,
        requestOptions: e.requestOptions,
      );
    } catch (e) {
      return Response(
        statusCode: 500,
        statusMessage: 'Unexpected error occurred',
        requestOptions: RequestOptions(path: path),
      );
    }
  }

  Future<ApiResponse<T>> _request<T>(
    Future<Response> Function() request,
  ) async {
    try {
      final response = await request();
      return ApiResponse<T>.fromDioResponse(response);
    } on DioException catch (e) {
      return ApiResponse<T>.fromDioError(e);
    } catch (e) {
      return ApiResponse<T>(
        message: 'Unexpected error occurred',
        errors: [e.toString()],
      );
    }
  }
}
