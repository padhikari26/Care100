part of 'connectivity_bloc.dart';

abstract class ConnectivityEvent extends Equatable {
  const ConnectivityEvent();

  @override
  List<Object> get props => [];
}

class CheckConnectivity extends ConnectivityEvent {
  final List<ConnectivityResult> connectivityResult;

  const CheckConnectivity({this.connectivityResult = const []});

  @override
  List<Object> get props => [connectivityResult];
}

class VerifyConnectionQuality extends ConnectivityEvent {
  final bool forceCheck;

  const VerifyConnectionQuality({this.forceCheck = false});

  @override
  List<Object> get props => [forceCheck];
}
