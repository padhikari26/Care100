part of 'auth_bloc.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, failure }

enum ResetPasswordStatus {
  initial,
  sendingOtp,
  otpSent,
  verifyingOtp,
  otpVerified,
  resetting,
  success,
  failure,
}

class AuthState extends Equatable {
  final bool isLoading;
  final bool isPasswordVisible;
  final String? errorMessage;
  final String? email;
  final String? code;
  final String? resetPasswordToken;
  final User? user;
  final TextEditingController emailController;
  final TextEditingController otpController;
  final TextEditingController passwordController;
  final TextEditingController confirmPasswordController;
  final PageController pageController;
  final bool isConnected;
  final int timerDuration;
  final bool showResendOtpButton;
  final bool isTermAccepted;
  final String? reactivationToken;
  final bool isFromRegister;
  final bool isFetching;
  final List<Orgs> orgs;
  final bool isSubmitting;

  const AuthState({
    this.isLoading = false,
    required this.isPasswordVisible,
    this.errorMessage,
    this.email,
    this.code,
    this.resetPasswordToken,
    this.user,
    required this.emailController,
    required this.otpController,
    required this.passwordController,
    required this.pageController,
    this.isConnected = true,
    this.timerDuration = 30,
    this.showResendOtpButton = false,
    this.isTermAccepted = false,
    this.reactivationToken,
    this.isFromRegister = false,
    required this.confirmPasswordController,
    this.isFetching = false,
    required this.orgs,
    this.isSubmitting = false,
  });

  factory AuthState.initial() => AuthState(
    emailController: TextEditingController(),
    otpController: TextEditingController(),
    passwordController: TextEditingController(),
    pageController: PageController(),
    isPasswordVisible: false,
    isLoading: false,
    errorMessage: null,
    email: null,
    code: null,
    resetPasswordToken: null,
    user: null,
    isConnected: true,
    timerDuration: 30,
    showResendOtpButton: false,
    isTermAccepted: false,
    reactivationToken: null,
    isFromRegister: false,
    confirmPasswordController: TextEditingController(),
    isFetching: false,
    orgs: [],
    isSubmitting: false,
  );

  AuthState copyWith({
    final bool? isLoading,
    final bool? isPasswordVisible,
    final String? errorMessage,
    final String? email,
    final String? code,
    final String? resetPasswordToken,
    final User? user,
    final TextEditingController? emailController,
    final TextEditingController? otpController,
    final TextEditingController? passwordController,
    final TextEditingController? confirmPasswordController,
    final PageController? pageController,
    final bool? isConnected,
    final int? timerDuration,
    final bool? showResendOtpButton,
    final bool? isTermAccepted,
    final String? reactivationToken,
    final bool? isFromRegister,
    final bool? isFetching,
    final List<Orgs>? orgs,
    final bool? isSubmitting,
  }) {
    return AuthState(
      isPasswordVisible: isPasswordVisible ?? this.isPasswordVisible,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      email: email ?? this.email,
      code: code ?? this.code,
      resetPasswordToken: resetPasswordToken ?? this.resetPasswordToken,
      user: user ?? this.user,
      emailController: emailController ?? this.emailController,
      otpController: otpController ?? this.otpController,
      passwordController: passwordController ?? this.passwordController,
      pageController: pageController ?? this.pageController,
      isConnected: isConnected ?? this.isConnected,
      timerDuration: timerDuration ?? this.timerDuration,
      showResendOtpButton: showResendOtpButton ?? this.showResendOtpButton,
      isTermAccepted: isTermAccepted ?? this.isTermAccepted,
      reactivationToken: reactivationToken ?? this.reactivationToken,
      isFromRegister: isFromRegister ?? this.isFromRegister,
      confirmPasswordController:
          confirmPasswordController ?? this.confirmPasswordController,
      isFetching: isFetching ?? this.isFetching,
      orgs: orgs ?? this.orgs,
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }

  @override
  List<Object?> get props => [
    isPasswordVisible,
    isLoading,
    errorMessage,
    email,
    code,
    resetPasswordToken,
    user,
    emailController,
    otpController,
    passwordController,
    pageController,
    isConnected,
    timerDuration,
    showResendOtpButton,
    isTermAccepted,
    reactivationToken,
    isFromRegister,
    confirmPasswordController,
    isFetching,
    orgs,
    isSubmitting,
  ];
}
