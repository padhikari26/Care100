import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/cupertino.dart';
import 'package:syncfusion_flutter_signaturepad/signaturepad.dart';
import '../../../../app/utils/dependencies.dart';
import '../../../../app/utils/toast.dart';
import '../../../../core/controller/bloc/connectivity/connectivity_bloc.dart';
import '../../../../core/network/api_request/api_request.dart';
import '../../../../shared/services/database/db/db_data.dart';
import '../../../auth/models/login_response_model.dart';
import '../../model/profile_model.dart';
part 'profile_event.dart';
part 'profile_state.dart';

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
late ProfileBloc profileBloc;

class ProfileBloc extends Bloc<ProfileEvent, ProfileState>
    with NetworkEventTransformer<ProfileEvent, ProfileState> {
  ApiRequest apiRequest = getIt<ApiRequest>();
  ProfileBloc() : super(ProfileState.initial()) {
    profileBloc = this;
    on<ProfileEventInit>(_onInit);
    on<ProfileErrorEvent>(_onError);
    on<OnSelectGenderEvent>(_onSelectGender);
    on<OnChangeDOBEvent>(_onChangeDOB);
    on<FetchProfileEvent>(
      _onFetchProfile,
      transformer: networkCheckTransformer(),
    );
    on<FillProfileEvent>(_onFillProfile);
    on<UpdateProfileEvent>(
      _onUpdateProfile,
      transformer: networkCheckTransformer(),
    );
    on<AccountDeleteEvent>(
      _onAccountDelete,
      transformer: networkCheckTransformer(),
    );
    on<SetSignatureEvent>(
      (event, emit) =>
          emit(state.copyWith(signatureBase64: event.signatureBase64)),
    );
  }

  void _onInit(ProfileEventInit event, Emitter<ProfileState> emit) async {
    emit(ProfileState.initial());
    final userInfo = await DbLocalData.getUserInfo();
    emit(state.copyWith(userData: userInfo));
  }

  void _onError(ProfileErrorEvent event, Emitter<ProfileState> emit) {
    emit(state.copyWith(isLoading: false, isUpdating: false));
    showFailureToast(message: event.errorMessage);
  }

  void _onSelectGender(OnSelectGenderEvent event, Emitter<ProfileState> emit) {
    emit(
      state.copyWith(
        genderController: TextEditingController(text: event.gender),
      ),
    );
  }

  void _onChangeDOB(OnChangeDOBEvent event, Emitter<ProfileState> emit) {
    emit(state.copyWith(dobController: TextEditingController(text: event.dob)));
  }

  void _onFetchProfile(
    FetchProfileEvent event,
    Emitter<ProfileState> emit,
  ) async {
    try {
      final res = await apiRequest.getProfile();

      if (!res.isSuccess) {
        add(ProfileErrorEvent(res.formattedErrorMessage));
        return;
      }
      ProfileModel profile = ProfileModel.fromJson(
        res.data as Map<String, dynamic>,
      );
      final userData = profile.data;
      await DbLocalData.updateUserInfo(userInfo: userData ?? UserData());
      emit(state.copyWith(userData: userData));
      add(FillProfileEvent());
    } catch (e) {
      emit(state.copyWith(isLoading: false));
    }
  }

  void _onFillProfile(
    FillProfileEvent event,
    Emitter<ProfileState> emit,
  ) async {
    emit(
      state.copyWith(
        isLoading: false,
        isUpdating: false,
        userData: state.userData,
        nameController: TextEditingController(text: state.userData?.name ?? ""),
        emailController: TextEditingController(
          text: state.userData?.email ?? "",
        ),
        dobController: TextEditingController(
          text: state.userData?.birthDay ?? "",
        ),
        genderController: TextEditingController(
          text: state.userData?.gender ?? "",
        ),
        signatureBase64: state.userData?.signature ?? "",

        addressController: TextEditingController(
          text: state.userData?.address ?? "",
        ),
        contactNumberController: TextEditingController(
          text: state.userData?.contactNumber ?? "",
        ),
        roleController: TextEditingController(text: state.userData?.role ?? ""),
        reportingToController: TextEditingController(
          text: state.userData?.reportingTo ?? "",
        ),
      ),
    );
  }

  void _onUpdateProfile(
    UpdateProfileEvent event,
    Emitter<ProfileState> emit,
  ) async {
    try {
      emit(state.copyWith(isUpdating: true));
      final res = await apiRequest.updateProfile(
        userData: UserData(
          id: state.userData?.id ?? "",
          name: state.nameController.text,
          email: state.emailController.text,
          signature: state.signatureBase64,
          gender: state.genderController.text,
          role: state.roleController.text,
          reportingTo: state.reportingToController.text,
          contactNumber: state.contactNumberController.text,
          address: state.addressController.text,
          birthDay: state.dobController.text,
        ),
      );
      if (!res.isSuccess) {
        add(ProfileErrorEvent(res.formattedErrorMessage));
        return;
      }
      //update userData
      final updatedUserData = state.userData?.copyWith(
        name: state.nameController.text,
        email: state.emailController.text,
        signature: state.signatureBase64,
        gender: state.genderController.text,
        role: state.roleController.text,
        reportingTo: state.reportingToController.text,
        contactNumber: state.contactNumberController.text,
        address: state.addressController.text,
        birthDay: state.dobController.text,
      );
      await DbLocalData.updateUserInfo(userInfo: updatedUserData!);
      emit(state.copyWith(isUpdating: false, userData: updatedUserData));
      showSuccessDiaglog(title: 'Your profile has been updated successfully!');
    } catch (e) {
      add(ProfileErrorEvent(e.toString()));
    }
  }

  void _onAccountDelete(
    AccountDeleteEvent event,
    Emitter<ProfileState> emit,
  ) async {
    // try {
    //   emit(state.copyWith(isLoading: true));
    //   final res = await apiRequest.deleteAccount(
    //     reason: state.reasonController.text,
    //   );
    //   if (!res.isSuccess) {
    //     add(ProfileErrorEvent(res.formattedErrorMessage));
    //     return;
    //   }
    //   emit(state.copyWith(isLoading: false));
    //   showSuccessToast(message: "Account deleted successfully");
    // } catch (e) {
    //   add(ProfileErrorEvent(e.toString()));
    // }
  }

  @override
  Future<void> close() {
    add(const ProfileEventInit());
    return super.close();
  }
}
