part of 'connectivity_bloc.dart';

abstract class ConnectivityState extends Equatable {
  final bool isConnected;
  final ConnectionType connectionType;
  final DateTime lastChecked;

  const ConnectivityState({
    required this.isConnected,
    this.connectionType = ConnectionType.none,
    required this.lastChecked,
  });

  @override
  List<Object> get props => [isConnected, connectionType, lastChecked];
}

class ConnectivityInitial extends ConnectivityState {
  ConnectivityInitial() : super(isConnected: true, lastChecked: DateTime.now());
}

class ConnectivityConnected extends ConnectivityState {
  final Duration? latency;

  const ConnectivityConnected({
    required super.connectionType,
    this.latency,
    required super.lastChecked,
  }) : super(isConnected: true);

  @override
  List<Object> get props => [...super.props, if (latency != null) latency!];
}

class ConnectivityDisconnected extends ConnectivityState {
  const ConnectivityDisconnected({required super.lastChecked})
    : super(isConnected: false, connectionType: ConnectionType.none);
}

class ConnectivityWeak extends ConnectivityState {
  final Duration latency;

  const ConnectivityWeak({
    required this.latency,
    required super.connectionType,
    required super.lastChecked,
  }) : super(isConnected: true);

  @override
  List<Object> get props => [...super.props, latency];
}

enum ConnectionType { wifi, mobile, ethernet, vpn, bluetooth, other, none }
