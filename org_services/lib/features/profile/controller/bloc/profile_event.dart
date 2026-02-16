part of 'profile_bloc.dart';

sealed class ProfileEvent extends Equatable {
  const ProfileEvent();

  @override
  List<Object> get props => [];
}

class ProfileEventInit extends ProfileEvent {
  const ProfileEventInit();
}

class ProfileErrorEvent extends ProfileEvent {
  final String errorMessage;
  const ProfileErrorEvent(this.errorMessage);
}

class FetchProfileEvent extends ProfileEvent {
  const FetchProfileEvent();
}

class FillProfileEvent extends ProfileEvent {
  const FillProfileEvent();
}

class OnSelectGenderEvent extends ProfileEvent {
  final String gender;

  const OnSelectGenderEvent(this.gender);
}

class OnChangeDOBEvent extends ProfileEvent {
  final String dob;

  const OnChangeDOBEvent(this.dob);
}

class UpdateProfileEvent extends ProfileEvent {
  const UpdateProfileEvent();
}

class AccountDeleteEvent extends ProfileEvent {
  const AccountDeleteEvent();
}

class SetSignatureEvent extends ProfileEvent {
  final String signatureBase64;

  const SetSignatureEvent(this.signatureBase64);
}
