import 'package:dio/dio.dart';

import '../../../app/utils/dependencies.dart';
import '../../../features/auth/models/refresh_token_response.dart';
import '../../../shared/services/database/shared_pref.dart';
import '../../controller/bloc/global/global_bloc.dart';
import '../api_request/api_request.dart';
import 'api_client.dart';

class AuthInterceptor extends Interceptor {
  final List<RequestOptions> _pendingRequests = [];

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final customToken = options.headers['X-Custom-Token'];
    if (customToken != null && customToken is String) {
      options.headers['Authorization'] = 'Bearer $customToken';
      options.headers.remove('X-Custom-Token');
    } else {
      final storedToken = await SharedPref.accessToken;
      if (storedToken != null && storedToken.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $storedToken';
        // options.headers['Authorization'] = 'Bearer ""';
      }
    }
    return handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401 && !resumeToken) {
      await _logout();
      return handler.next(err);
    }
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }
    resumeToken = true;
    try {
      final refreshToken = await SharedPref.refreshToken;
      if (refreshToken == null) {
        await _logout(clearAll: true);
        return handler.next(err);
      }

      final refreshTokenExpiry = await SharedPref.refreshTokenExpiry;
      if (refreshTokenExpiry != null &&
          refreshTokenExpiry.isBefore(DateTime.now())) {
        await _logout(clearAll: true);
        return handler.next(err);
      }

      final response = await getIt<ApiRequest>().refreshToken(
        refreshToken: refreshToken,
      );
      if (!response.isSuccess) {
        await _logout();
        return handler.next(err);
      }
      final refreshResponse = RefreshTokenResponse.fromJson(
        response.data as Map<String, dynamic>,
      );
      if (refreshResponse.data?.accessToken != null) {
        await SharedPref.addRefreshTokenData(refreshResponse);
      }
      err.requestOptions.headers['Authorization'] =
          'Bearer ${refreshResponse.data?.accessToken}';
      final newResponse = await getIt<ApiClient>().dio.fetch(
        err.requestOptions,
      );
      return handler.resolve(newResponse);
    } catch (e) {
      await _logout();
      return handler.next(err);
    } finally {
      for (var request in _pendingRequests) {
        request.headers['Authorization'] =
            'Bearer ${await SharedPref.accessToken}';
        final response = await getIt<ApiClient>().dio.fetch(request);
        handler.resolve(response);
      }
      _pendingRequests.clear();
    }
  }

  Future<void> _logout({bool clearAll = false}) async {
    if (clearAll) {
      SharedPref.clearAll;
    }
    // globalBloc.add(const GlobalSessionOutEvent());
    globalBloc.add(const GlobalAuthLogoutEvent());
  }

  Future<bool> check() async {
    final accessTokenExpiry = await SharedPref.accessTokenExpiry;
    final now = DateTime.now();
    return accessTokenExpiry != null && accessTokenExpiry.isBefore(now);
  }
}
