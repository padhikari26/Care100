import 'dart:async';
import 'dart:io';
import 'package:bloc/bloc.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:equatable/equatable.dart';
part 'connectivity_event.dart';
part 'connectivity_state.dart';

late ConnectivityBloc networkBloc;

class ConnectivityBloc extends Bloc<ConnectivityEvent, ConnectivityState> {
  final Connectivity _connectivity;
  StreamSubscription? _connectivitySubscription;

  ConnectivityBloc({Connectivity? connectivity})
    : _connectivity = connectivity ?? Connectivity(),
      super(ConnectivityInitial()) {
    networkBloc = this;
    on<CheckConnectivity>(_onCheckConnectivity);
    on<VerifyConnectionQuality>(_onVerifyConnectionQuality);

    add(const CheckConnectivity());

    _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
      (result) => add(CheckConnectivity(connectivityResult: result)),
    );
  }

  Future<void> _onCheckConnectivity(
    CheckConnectivity event,
    Emitter<ConnectivityState> emit,
  ) async {
    final results =
        event.connectivityResult.isNotEmpty
            ? event.connectivityResult
            : await _connectivity.checkConnectivity();

    if (results.isEmpty || results.first == ConnectivityResult.none) {
      emit(ConnectivityDisconnected(lastChecked: DateTime.now()));
      return;
    }
    add(const VerifyConnectionQuality());
  }

  Future<void> _onVerifyConnectionQuality(
    VerifyConnectionQuality event,
    Emitter<ConnectivityState> emit,
  ) async {
    final stopwatch = Stopwatch()..start();
    try {
      final type = _determineConnectionType(
        await _connectivity.checkConnectivity(),
      );

      // Test with a lightweight request
      final response = await InternetAddress.lookup(
        'google.com',
      ).timeout(const Duration(seconds: 3));

      stopwatch.stop();

      if (response.isEmpty || response[0].rawAddress.isEmpty) {
        emit(ConnectivityDisconnected(lastChecked: DateTime.now()));
      } else if (stopwatch.elapsedMilliseconds > 1000) {
        emit(
          ConnectivityWeak(
            latency: stopwatch.elapsed,
            connectionType: type,
            lastChecked: DateTime.now(),
          ),
        );
      } else {
        emit(
          ConnectivityConnected(
            connectionType: type,
            latency: stopwatch.elapsed,
            lastChecked: DateTime.now(),
          ),
        );
      }
    } on SocketException catch (_) {
      emit(ConnectivityDisconnected(lastChecked: DateTime.now()));
    } on TimeoutException catch (_) {
      emit(
        ConnectivityWeak(
          latency: stopwatch.elapsed,
          connectionType: ConnectionType.none,
          lastChecked: DateTime.now(),
        ),
      );
    }
  }

  ConnectionType _determineConnectionType(List<ConnectivityResult> results) {
    if (results.contains(ConnectivityResult.wifi)) return ConnectionType.wifi;
    if (results.contains(ConnectivityResult.mobile)) {
      return ConnectionType.mobile;
    }
    if (results.contains(ConnectivityResult.ethernet)) {
      return ConnectionType.ethernet;
    }
    if (results.contains(ConnectivityResult.vpn)) return ConnectionType.vpn;
    if (results.contains(ConnectivityResult.bluetooth)) {
      return ConnectionType.bluetooth;
    }
    return ConnectionType.other;
  }

  @override
  Future<void> close() {
    _connectivitySubscription?.cancel();
    return super.close();
  }
}
