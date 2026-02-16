part of 'timesheet_bloc.dart';

sealed class TimesheetEvent extends Equatable {
  const TimesheetEvent();

  @override
  List<Object> get props => [];
}

class TimesheetInitialEvent extends TimesheetEvent {
  const TimesheetInitialEvent();
}

class TimesheetDateChangedEvent extends TimesheetEvent {
  final DateTime selectedDate;

  const TimesheetDateChangedEvent(this.selectedDate);

  @override
  List<Object> get props => [selectedDate];
}

class TimesheetFailureEvent extends TimesheetEvent {
  final String errorMessage;

  const TimesheetFailureEvent(this.errorMessage);

  @override
  List<Object> get props => [errorMessage];
}

class GetTimesheetEvent extends TimesheetEvent {
  const GetTimesheetEvent();
}

class OnWeeklyDateChangeEvent extends TimesheetEvent {
  final DateTime date;
  const OnWeeklyDateChangeEvent({required this.date});
}

class GetAddSectionListEvent extends TimesheetEvent {}

class ToggleCompletedWorkEvent extends TimesheetEvent {
  final CompletedWorks work;

  const ToggleCompletedWorkEvent({required this.work});
}

class FillFormEvent extends TimesheetEvent {
  final Timesheet timesheet;
  const FillFormEvent({required this.timesheet});
}

class ClearFormEvent extends TimesheetEvent {
  const ClearFormEvent();
}

class SelectClientEvent extends TimesheetEvent {
  final Clients? client;

  const SelectClientEvent({this.client});
}

class SelectFormDateEvent extends TimesheetEvent {
  final DateTime date;

  const SelectFormDateEvent({required this.date});

  @override
  List<Object> get props => [date];
}

class SetSignatureEvent extends TimesheetEvent {
  final String signatureBase64;

  const SetSignatureEvent({required this.signatureBase64});

  @override
  List<Object> get props => [signatureBase64];
}

class TimesheetSubmitEvent extends TimesheetEvent {}

class SetClockInTimeEvent extends TimesheetEvent {
  final DateTime clockInTime;

  const SetClockInTimeEvent({required this.clockInTime});

  @override
  List<Object> get props => [clockInTime];
}

class SetClockOutTimeEvent extends TimesheetEvent {
  final DateTime clockOutTime;

  const SetClockOutTimeEvent({required this.clockOutTime});

  @override
  List<Object> get props => [clockOutTime];
}

class SetTimesheetIdEvent extends TimesheetEvent {
  final String timesheetId;

  const SetTimesheetIdEvent({required this.timesheetId});

  @override
  List<Object> get props => [timesheetId];
}

class DownloadTimesheetEvent extends TimesheetEvent {
  final String employeeId;
  final DateTime? startDate;
  final DateTime? endDate;

  const DownloadTimesheetEvent({
    required this.employeeId,
    this.startDate,
    this.endDate,
  });
}
