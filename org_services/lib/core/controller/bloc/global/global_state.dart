part of 'global_bloc.dart';

class GlobalState extends Equatable {
  final bool isDarkTheme;
  final LoginState? authState;
  final bool isLoading;
  final bool? biometricEnabled;
  final bool? showOnboarding;
  final Locale? locale;
  final bool? showBiometricLogin;

  const GlobalState({
    required this.isDarkTheme,
    required this.authState,
    this.isLoading = false,
    this.biometricEnabled,
    this.showOnboarding,
    this.showBiometricLogin,
    this.locale,
  });

  GlobalState copyWith({
    bool? isDarkTheme,
    LoginState? authState,
    bool? noNetwork,
    bool? isLoading,
    bool? resumeToken,
    bool? biometricEnabled,
    bool? showOnboarding,
    bool? showBiometricLogin,
    Locale? locale,
  }) {
    return GlobalState(
      isDarkTheme: isDarkTheme ?? this.isDarkTheme,
      authState: authState ?? this.authState,
      isLoading: isLoading ?? this.isLoading,
      biometricEnabled: biometricEnabled ?? this.biometricEnabled,
      showOnboarding: showOnboarding ?? this.showOnboarding,
      locale: locale ?? this.locale,
      showBiometricLogin: showBiometricLogin ?? this.showBiometricLogin,
    );
  }

  factory GlobalState.initial() {
    return GlobalState(
      isDarkTheme: false,
      authState: LoginState.unauthenticate,
      isLoading: false,
      biometricEnabled: false,
      showOnboarding: true,
      locale: const Locale('en', 'US'),
      showBiometricLogin: false,
    );
  }
  @override
  List<Object?> get props => [
    isDarkTheme,
    authState,
    isLoading,
    biometricEnabled,
    showOnboarding,
    locale,
    showBiometricLogin,
  ];
}
