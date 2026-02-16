import 'dart:async';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get/get.dart';
import '../../../../app/utils/constants.dart';
import '../../../../features/screen_cltr.dart';
import '../../../../shared/services/database/shared_pref.dart';
import '../../multi_bloc.dart';
part 'global_event.dart';
part 'global_state.dart';

late GlobalBloc globalBloc;

class GlobalBloc extends Bloc<GlobalEvent, GlobalState> {
  late final StreamSubscription _connectivitySub;

  GlobalBloc() : super(GlobalState.initial()) {
    globalBloc = this;
    on<GlobalEventChangeTheme>(_handleThemeChange);
    on<GlobalEventInit>(_handleInit);
    on<GlobalAuthGetEvent>(_handleAuthGet);
    on<GlobalAuthSetEvent>(_handleAuthSet);
    on<GlobalAuthLogoutEvent>(_handleAuthLogout);
    on<GlobalSessionOutEvent>(_handleSessionOutEvent);
  }

  void _handleSessionOutEvent(
    GlobalSessionOutEvent event,
    Emitter<GlobalState> emit,
  ) {
    _logOutWithoutTransition();
    SharedPref.setAccessToken("");
    MultiBlocPro.reset(cusCtx ?? Get.context!);
    add(GlobalAuthSetEvent(authState: LoginState.unauthenticate));
  }

  void _handleThemeChange(
    GlobalEventChangeTheme event,
    Emitter<GlobalState> emit,
  ) {
    emit(state.copyWith(isDarkTheme: !state.isDarkTheme));
  }

  void _handleInit(GlobalEventInit event, Emitter<GlobalState> emit) {
    emit(GlobalState.initial());
  }

  Future<void> _handleAuthGet(
    GlobalAuthGetEvent event,
    Emitter<GlobalState> emit,
  ) async {
    emit(state.copyWith(authState: LoginState.authenticating));
    final isAuth = await SharedPref.isAuth;
    // final isOnboarding = await SharedPref.showOnboarding;
    emit(
      state.copyWith(
        authState:
            isAuth
                ? LoginState.authenticate
                // : isOnboarding
                // ? LoginState.initial
                : LoginState.unauthenticate,
      ),
    );
    if (isAuth == false) {
      SharedPref.clear;
    }
  }

  Future<void> _handleAuthSet(
    GlobalAuthSetEvent event,
    Emitter<GlobalState> emit,
  ) async {
    SharedPref.setAuth = (event.authState == LoginState.authenticate);
    emit(state.copyWith(authState: event.authState));
  }

  Future<void> _handleAuthLogout(
    GlobalAuthLogoutEvent event,
    Emitter<GlobalState> emit,
  ) async {
    if (state.authState == LoginState.unauthenticate) return;
    emit(state.copyWith(authState: LoginState.authenticating));
    SharedPref.clear;
    MultiBlocPro.reset(cusCtx ?? Get.context!);
    _logOutWithoutTransition();
    emit(state.copyWith(authState: LoginState.unauthenticate));
  }

  @override
  void onEvent(GlobalEvent event) {
    super.onEvent(event);
  }

  @override
  void onChange(Change<GlobalState> change) {
    super.onChange(change);
  }

  @override
  void onError(Object error, StackTrace stackTrace) {
    super.onError(error, stackTrace);
  }

  @override
  Future<void> close() {
    _connectivitySub.cancel();
    return super.close();
  }

  void _logOutWithoutTransition() {
    if (Get.currentRoute != ScreenCltr.routeName) {
      Navigator.pushAndRemoveUntil(
        cusCtx ?? Get.context!,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => ScreenCltr(),
          transitionDuration: Duration.zero,
          transitionsBuilder:
              (context, animation, secondaryAnimation, child) => child,
        ),
        (route) => false,
      );
    }
  }
}

enum LoginState {
  initial,
  authenticating,
  authenticate,
  unauthenticate,
  unRegistered,
  deactivated,
  biometric,
}
