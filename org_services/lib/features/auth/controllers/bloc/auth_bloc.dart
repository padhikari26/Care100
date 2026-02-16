import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:orgservice/app/utils/constants.dart';
import 'package:orgservice/features/auth/models/auth_add_section.dart';
import 'package:orgservice/features/auth/models/login_response_model.dart';
import 'package:orgservice/shared/services/database/db/db_data.dart';

import '../../../../app/utils/toast.dart';
import '../../../../core/controller/bloc/connectivity/connectivity_bloc.dart';
import '../../../../core/controller/bloc/global/global_bloc.dart';
import '../../../../core/network/api_request/api_request.dart';
import '../../../../shared/services/database/shared_pref.dart';
import '../../models/login_request_model.dart';
import '../../models/refresh_token_response.dart';

part 'auth_event.dart';
part 'auth_state.dart';

mixin NetworkEventTransformer<Event, State> on Bloc<Event, State> {
  EventTransformer<E> networkCheckTransformer<E>() {
    return (events, mapper) {
      return events.asyncExpand((event) async* {
        networkBloc.add(CheckConnectivity());
        await Future.delayed(const Duration(milliseconds: 100));
        if (networkBloc.state.isConnected) {
          yield* mapper(event);
        }
      });
    };
  }
}

class AuthBloc extends Bloc<AuthEvent, AuthState>
    with NetworkEventTransformer<AuthEvent, AuthState> {
  final ApiRequest _apiRequest;
  Timer? _timer;

  AuthBloc({
    FirebaseAuth? firebaseAuth,
    ApiRequest? apiRequest,
    Connectivity? connectivity,
  }) : _apiRequest = apiRequest ?? ApiRequest(),
       super(AuthState.initial()) {
    on<LoginPasswordVisibilityEvent>(_handlePasswordVisibility);
    on<LoginInitialEvent>(_handleInitialState);
    on<LoginSubmitEvent>(
      _handleLoginApi,
      transformer: networkCheckTransformer(),
    );

    // on<LoginWithGoogle>(
    //   _handleGoogleSignIn,
    //   transformer: networkCheckTransformer(),
    // );
    on<LoginFailureEvent>(_handleLoginFailure);
    on<ConnectivityChangedEvent>(_handleConnectivityChanged);
    on<ClearOtpEvent>((event, emit) {
      _timer?.cancel();
      emit(state.copyWith(otpController: TextEditingController()));
    });
    on<UpdateTimerDurationEvent>((event, emit) {
      emit(state.copyWith(timerDuration: event.duration));
    });
    on<UpdateResendOtpButtonEvent>((event, emit) {
      emit(state.copyWith(showResendOtpButton: event.showResendOtpButton));
    });
    on<StartTimerEvent>((event, emit) {
      emit(state.copyWith(timerDuration: 30, showResendOtpButton: false));
      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (state.timerDuration == 0) {
          timer.cancel();
          _timer?.cancel();
          add(const UpdateResendOtpButtonEvent(true));
        } else {
          add(UpdateTimerDurationEvent(state.timerDuration - 1));
        }
      });
    });
    on<ChangeState>((event, emit) {
      emit(event.newState);
    });
    on<RefreshTokenEvent>(
      _handleRefreshToken,
      transformer: networkCheckTransformer(),
    );
    on<RegisterTermEvent>((event, emit) {
      emit(state.copyWith(isTermAccepted: event.isTermAccepted));
    });
    on<ClearErrorEvent>((event, emit) {
      emit(state.copyWith(errorMessage: null));
    });
    on<GetAuthAddSectionListEvent>(
      _handleAuthAddSectionList,
      transformer: networkCheckTransformer(),
    );
    on<RegisterSubmitEvent>(
      _handleRegister,
      transformer: networkCheckTransformer(),
    );
  }

  Future<void> _handleRegister(
    RegisterSubmitEvent event,
    Emitter<AuthState> emit,
  ) async {
    try {
      emit(state.copyWith(isSubmitting: true));
      final response = await _apiRequest.register(data: event.data);
      if (!response.isSuccess) {
        emit(state.copyWith(isFetching: false, isSubmitting: false));
        showFailureToast(message: response.formattedErrorMessage);
        return;
      }
      showSuccessDiaglog(
        title: 'Employee Registration Successfull',
        onOk: () {
          Navigator.canPop(cusCtx!) ? Navigator.pop(cusCtx!) : null;
        },
      );
    } catch (e) {
      showFailureToast(message: 'Something went wrong');
      add(LoginFailureEvent('Something went wrong'));
    }
  }

  Future<void> _handleAuthAddSectionList(
    GetAuthAddSectionListEvent event,
    Emitter<AuthState> emit,
  ) async {
    try {
      emit(state.copyWith(isFetching: true));
      final response = await _apiRequest.authAddSectionList();
      if (!response.isSuccess) {
        emit(
          state.copyWith(
            errorMessage: response.formattedErrorMessage,
            isFetching: false,
          ),
        );
        showFailureToast(message: response.formattedErrorMessage);
        return;
      }
      final res = AuthAddSectionList.fromJson(
        response.data as Map<String, dynamic>,
      );
      emit(state.copyWith(isFetching: false, orgs: res.orgs ?? []));
    } catch (e) {
      add(LoginFailureEvent('Failed to fetch section list'));
    }
  }

  Future<void> _handleRefreshToken(
    RefreshTokenEvent event,
    Emitter<AuthState> emit,
  ) async {
    try {
      final refreshToken = await SharedPref.refreshToken;
      if (refreshToken == null) {
        return;
      }

      emit(state.copyWith(isLoading: true));
      final response = await _apiRequest.refreshToken(
        refreshToken: refreshToken,
      );
      if (!response.isSuccess) {
        SharedPref.clearAll;
        emit(
          state.copyWith(
            errorMessage: response.formattedErrorMessage,
            isLoading: false,
          ),
        );
        showFailureToast(message: response.formattedErrorMessage);
        return;
      }

      final refreshResponse = RefreshTokenResponse.fromJson(
        response.data as Map<String, dynamic>,
      );
      SharedPref.addRefreshTokenData(refreshResponse);
      SharedPref.setAuth = true;
      emit(state.copyWith(isLoading: false));
      globalBloc.add(
        const GlobalAuthSetEvent(authState: LoginState.authenticate),
      );
    } catch (e) {
      add(const LoginFailureEvent('Failed to refresh token'));
    }
  }

  void _handleLoginFailure(LoginFailureEvent event, Emitter<AuthState> emit) {
    emit(
      state.copyWith(
        errorMessage:
            event.errorMessage?.contains("invalid-credential") ?? false
                ? 'Invalid username or password'
                : event.errorMessage,
        isLoading: false,
        isFetching: false,
        isSubmitting: false,
      ),
    );
  }

  void _handleConnectivityChanged(
    ConnectivityChangedEvent event,
    Emitter<AuthState> emit,
  ) {
    emit(state.copyWith(isConnected: event.isConnected));
    if (!event.isConnected) {
      add(LoginFailureEvent("No internet connection"));
    }
  }

  void _handlePasswordVisibility(
    LoginPasswordVisibilityEvent event,
    Emitter<AuthState> emit,
  ) {
    emit(state.copyWith(isPasswordVisible: event.isVisible));
  }

  void _handleInitialState(LoginInitialEvent event, Emitter<AuthState> emit) {
    emit(AuthState.initial());
  }

  Future<void> _handleLoginApi(
    LoginSubmitEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, errorMessage: null));
    final res = await _apiRequest.login(
      LoginRequestModel(code: state.passwordController.text.trim()),
    );
    if (!res.isSuccess) {
      add(LoginFailureEvent(res.formattedErrorMessage));
      return;
    }
    final response = LoginResponseModel.fromJson(res.data);

    await DbLocalData.updateUserInfo(
      loginResponse: response,
      userInfo: response.user ?? UserData(),
    );
    globalBloc.add(GlobalAuthSetEvent(authState: LoginState.authenticate));
    add(LoginInitialEvent());
  }

  // Future<void> _handleGoogleSignIn(
  //   LoginWithGoogle event,
  //   Emitter<AuthState> emit,
  // ) async {
  //   emit(state.copyWith(isLoading: true, errorMessage: null));
  //   try {
  //     final googleUser = await _googleSignIn.signIn();
  //     if (googleUser == null) {
  //       add(const LoginFailureEvent('Google sign-in aborted'));
  //       return;
  //     }

  //     final googleAuth = await googleUser.authentication;
  //     final credential = GoogleAuthProvider.credential(
  //       accessToken: googleAuth.accessToken,
  //       idToken: googleAuth.idToken,
  //     );
  //     final userCredential = await _firebaseAuth.signInWithCredential(
  //       credential,
  //     );
  //     final user = _firebaseAuth.currentUser;
  //     final token = await user?.getIdToken();

  //     emit(state.copyWith(code: token, user: userCredential.user));
  //     add(const LoginSubmitEvent());
  //   } catch (e) {
  //     add(const LoginFailureEvent('Google sign-in failed'));
  //   }
  // }

  @override
  Future<void> close() {
    _timer?.cancel();
    return super.close();
  }
}
