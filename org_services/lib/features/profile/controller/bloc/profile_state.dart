part of 'profile_bloc.dart';

class ProfileState {
  final bool isLoading;
  final bool isUpdating;
  final String? errorMessage;
  final UserData? userData;
  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController roleController;
  final TextEditingController reportingToController;
  final TextEditingController contactNumberController;
  final TextEditingController addressController;
  final TextEditingController genderController;
  final TextEditingController dobController;
  final List<String> genders;
  final String? avatarUrl;
  final GlobalKey<SfSignaturePadState> signaturePadKey;
  final String signatureBase64;

  ProfileState({
    required this.nameController,
    required this.emailController,
    required this.roleController,
    required this.reportingToController,
    required this.contactNumberController,
    required this.addressController,
    required this.genderController,
    required this.dobController,
    this.genders = const ['Male', 'Female', 'Other'],
    this.isUpdating = false,
    this.avatarUrl,
    this.isLoading = false,
    this.errorMessage,
    this.userData,
    required this.signaturePadKey,
    required this.signatureBase64,
  });

  ProfileState copyWith({
    TextEditingController? nameController,
    TextEditingController? emailController,
    TextEditingController? signatureController,
    TextEditingController? roleController,
    TextEditingController? reportingToController,
    TextEditingController? contactNumberController,
    TextEditingController? addressController,
    TextEditingController? genderController,
    TextEditingController? dobController,
    List<String>? genders,
    bool? isUpdating,
    String? avatarUrl,
    bool? isLoading,
    String? errorMessage,
    UserData? userData,
    GlobalKey<SfSignaturePadState>? signaturePadKey,
    String? signatureBase64,
  }) {
    return ProfileState(
      nameController: nameController ?? this.nameController,
      emailController: emailController ?? this.emailController,
      roleController: roleController ?? this.roleController,
      reportingToController:
          reportingToController ?? this.reportingToController,
      contactNumberController:
          contactNumberController ?? this.contactNumberController,
      addressController: addressController ?? this.addressController,
      genderController: genderController ?? this.genderController,
      dobController: dobController ?? this.dobController,
      genders: genders ?? this.genders,
      isUpdating: isUpdating ?? this.isUpdating,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
      userData: userData ?? this.userData,
      signaturePadKey: signaturePadKey ?? this.signaturePadKey,
      signatureBase64: signatureBase64 ?? this.signatureBase64,
    );
  }

  factory ProfileState.initial() {
    return ProfileState(
      nameController: TextEditingController(),
      emailController: TextEditingController(),
      roleController: TextEditingController(),
      reportingToController: TextEditingController(),
      contactNumberController: TextEditingController(),
      addressController: TextEditingController(),
      genderController: TextEditingController(),
      dobController: TextEditingController(),
      isLoading: false,
      isUpdating: false,
      errorMessage: null,
      userData: null,
      signatureBase64: "",
      signaturePadKey: GlobalKey(),
    );
  }
}
