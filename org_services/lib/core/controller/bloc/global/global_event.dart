part of 'global_bloc.dart';

abstract class GlobalEvent {
  const GlobalEvent();
}

class GlobalEventInit extends GlobalEvent {
  const GlobalEventInit();
}

class GlobalEventChangeTheme extends GlobalEvent {
  bool? isDark;
  GlobalEventChangeTheme({this.isDark = false});
}

class GlobalAuthGetEvent extends GlobalEvent {
  const GlobalAuthGetEvent();
}

class GlobalAuthSetEvent extends GlobalEvent {
  final LoginState authState;
  const GlobalAuthSetEvent({required this.authState});
}

class GlobalAuthLogoutEvent extends GlobalEvent {
  const GlobalAuthLogoutEvent();
}

class GlobalSessionOutEvent extends GlobalEvent {
  const GlobalSessionOutEvent();
}

class GlobalConnectivityChanged extends GlobalEvent {
  final bool isConnected;
  const GlobalConnectivityChanged(this.isConnected);
}

class UpdateOnboardingStatusEvent extends GlobalEvent {
  final bool showOnboarding;
  const UpdateOnboardingStatusEvent(this.showOnboarding);
}

class GlobalLocaleChangedEvent extends GlobalEvent {
  final Locale locale;
  const GlobalLocaleChangedEvent(this.locale);
}

class GlobalLocaleGetEvent extends GlobalEvent {
  const GlobalLocaleGetEvent();
}
