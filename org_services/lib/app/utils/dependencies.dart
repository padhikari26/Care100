import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import '../../core/controller/bloc/connectivity/connectivity_bloc.dart';
import '../../env.dart';
import '../../core/network/api/api_client.dart';
import '../../core/network/api/api_constant.dart';
import '../../core/network/api/auth_interceptor.dart';
import '../../core/network/api_request/api_request.dart';

final getIt = GetIt.instance;
bool resumeToken = false;

void setupDependencies({bool isProduction = false}) {
  AppEnviro.setupEnv(isProduction ? Enviroment.prod : Enviroment.dev);

  // Prevent re-registration of dependencies
  if (getIt.isRegistered<Dio>()) return;

  // Dio configuration
  final dio = Dio(
    BaseOptions(
      baseUrl:
          isProduction ? APIPathHelper.baseUrlProd : APIPathHelper.baseUrlDev,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    ),
  );

  // Register Dio
  getIt.registerSingleton<Dio>(dio);

  // Register AuthInterceptor
  getIt.registerSingleton<AuthInterceptor>(AuthInterceptor());

  getIt.registerSingleton<ConnectivityBloc>(
    ConnectivityBloc()..add(CheckConnectivity()),
  );

  // Register ApiClient
  getIt.registerSingleton<ApiClient>(
    ApiClient(
      baseUrl:
          isProduction ? APIPathHelper.baseUrlProd : APIPathHelper.baseUrlDev,
    ),
  );

  getIt.registerSingleton<Connectivity>(Connectivity());

  getIt.registerSingleton<ApiRequest>(ApiRequest());
}
