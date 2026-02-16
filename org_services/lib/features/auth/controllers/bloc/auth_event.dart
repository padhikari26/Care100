part of 'auth_bloc.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class LoginPasswordVisibilityEvent extends AuthEvent {
  final bool isVisible;
  const LoginPasswordVisibilityEvent(this.isVisible);

  @override
  List<Object?> get props => [isVisible];
}

class LoginInitialEvent extends AuthEvent {
  const LoginInitialEvent();
}

class LoginSubmitEvent extends AuthEvent {
  final bool providerLogin;
  final bool isVerified;
  final bool isFromRegister;
  const LoginSubmitEvent({
    this.providerLogin = false,
    this.isVerified = true,
    this.isFromRegister = false,
  });
}

class LoginWithGoogle extends AuthEvent {
  const LoginWithGoogle();
}

class StartTimerEvent extends AuthEvent {
  const StartTimerEvent();
}

class UpdateResendOtpButtonEvent extends AuthEvent {
  final bool showResendOtpButton;
  const UpdateResendOtpButtonEvent(this.showResendOtpButton);
}

class UpdateTimerDurationEvent extends AuthEvent {
  final int duration;
  const UpdateTimerDurationEvent(this.duration);
}

class LoginFailureEvent extends AuthEvent {
  final String? errorMessage;
  const LoginFailureEvent(this.errorMessage);

  @override
  List<Object?> get props => [errorMessage];
}

class ConnectivityChangedEvent extends AuthEvent {
  final bool isConnected;
  const ConnectivityChangedEvent(this.isConnected);

  @override
  List<Object?> get props => [isConnected];
}

class RefreshTokenEvent extends AuthEvent {
  final bool requireFaceId;
  const RefreshTokenEvent({this.requireFaceId = false});
}

class RegisterTermEvent extends AuthEvent {
  final bool isTermAccepted;
  const RegisterTermEvent(this.isTermAccepted);

  @override
  List<Object?> get props => [isTermAccepted];
}

class ClearErrorEvent extends AuthEvent {
  const ClearErrorEvent();
}

class ClearOtpEvent extends AuthEvent {
  const ClearOtpEvent();
}

class ChangeState extends AuthEvent {
  final AuthState newState;
  const ChangeState(this.newState);

  @override
  List<Object?> get props => [newState];
}

class GetAuthAddSectionListEvent extends AuthEvent {
  const GetAuthAddSectionListEvent();
}

class RegisterSubmitEvent extends AuthEvent {
  final Map<String, String> data;

  const RegisterSubmitEvent({required this.data});
}
