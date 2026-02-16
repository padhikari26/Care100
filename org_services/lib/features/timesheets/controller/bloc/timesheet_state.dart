part of 'timesheet_bloc.dart';

class TimesheetState {
  final bool isLoading;
  final bool isUpdating;
  final String? errorMessage;
  final DateTime fromDate;
  final DateTime toDate;
  final DateTime selectedDate;
  final String? cursor;
  final int? limit;
  final List<Timesheet>? timesheets;
  final List<Works>? works;
  final List<Clients>? clients;
  final bool isFetching;
  final bool isFetchingError;
  final List<TimesheetReason> reasons;
  final List<TimesheetReason> gps;
  final TextEditingController clientController;
  final TextEditingController dateController;
  final TextEditingController clockInController;
  final TextEditingController clockOutController;
  final DateTime? clockInTime;
  final DateTime? clockOutTime;
  final TextEditingController reasonController;
  final TextEditingController gpsController;
  final DateTime addedDate;
  final List<CompletedWorks> completedWorkIds;
  final String? selectedClientId;
  final GlobalKey<SfSignaturePadState> signaturePadKey;
  final String? signatureBase64;
  final String? timesheetId;
  final bool isDownloading;

  const TimesheetState({
    this.isLoading = false,
    this.errorMessage,
    required this.fromDate,
    required this.toDate,
    required this.selectedDate,
    this.cursor,
    this.limit,
    this.timesheets,
    this.works,
    this.clients,
    this.isUpdating = false,
    this.isFetching = false,
    this.isFetchingError = false,
    required this.reasons,
    required this.gps,
    required this.clientController,
    required this.dateController,
    required this.clockInController,
    required this.clockOutController,
    required this.reasonController,
    required this.gpsController,
    required this.signaturePadKey,
    required this.completedWorkIds,
    required this.addedDate,
    this.selectedClientId,
    this.signatureBase64,
    this.clockInTime,
    this.clockOutTime,
    this.timesheetId,
    this.isDownloading = false,
  });

  factory TimesheetState.initial() {
    final DateTime monday = DateTime.now().subtract(
      Duration(days: DateTime.now().weekday - 1),
    );

    final DateTime sunday = DateTime.now().add(
      Duration(days: DateTime.daysPerWeek - DateTime.now().weekday),
    );
    return TimesheetState(
      selectedDate: DateTime.now(),
      fromDate: monday,
      toDate: sunday,
      isLoading: false,
      errorMessage: null,

      cursor: null,
      limit: 7,
      timesheets: [],
      works: [],
      clients: [],
      isUpdating: false,
      isFetching: false,
      isFetchingError: false,
      isDownloading: false,
      reasons: [
        TimesheetReason(code: 'H', name: 'HHA not working'),
        TimesheetReason(code: 'I', name: 'Internet Problem'),
        TimesheetReason(code: 'O', name: 'Other'),
      ],
      gps: [
        TimesheetReason(code: 'H', name: 'Home'),
        TimesheetReason(code: 'O', name: 'Others'),
      ],
      clientController: TextEditingController(),
      dateController: TextEditingController(
        text: DateFormatter.formatStringDate(DateTime.now().toIso8601String()),
      ),
      clockInController: TextEditingController(),
      clockOutController: TextEditingController(),
      reasonController: TextEditingController(),
      gpsController: TextEditingController(),
      signaturePadKey: GlobalKey(),
      completedWorkIds: [],
      addedDate: DateTime.now(),
      selectedClientId: null,
      signatureBase64: null,
      clockInTime: null,
      clockOutTime: null,
      timesheetId: null,
    );
  }

  TimesheetState copyWith({
    bool? isLoading,
    String? errorMessage,
    DateTime? selectedDate,
    DateTime? fromDate,
    DateTime? toDate,
    String? cursor,
    bool? isDownloading,
    int? limit,
    List<Timesheet>? timesheets,
    List<Works>? works,
    List<Clients>? clients,
    bool? isUpdating,
    bool? isFetching,
    List<TimesheetReason>? reasons,
    List<TimesheetReason>? gps,
    TextEditingController? clientController,
    TextEditingController? dateController,
    TextEditingController? clockInController,
    TextEditingController? clockOutController,
    TextEditingController? reasonController,
    TextEditingController? gpsController,
    GlobalKey<SfSignaturePadState>? signaturePadKey,
    List<CompletedWorks>? completedWorkIds,
    DateTime? addedDate,
    String? selectedClientId,
    String? signatureBase64,
    DateTime? clockInTime,
    DateTime? clockOutTime,
    String? timesheetId,
    bool? isFetchingError,
  }) {
    return TimesheetState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
      selectedDate: selectedDate ?? this.selectedDate,
      fromDate: fromDate ?? this.fromDate,
      toDate: toDate ?? this.toDate,
      cursor: cursor ?? this.cursor,
      limit: limit ?? this.limit,
      timesheets: timesheets ?? this.timesheets,
      works: works ?? this.works,
      clients: clients ?? this.clients,
      isUpdating: isUpdating ?? this.isUpdating,
      isFetching: isFetching ?? this.isFetching,
      isDownloading: isDownloading ?? this.isDownloading,
      reasons: reasons ?? this.reasons,
      gps: gps ?? this.gps,
      clientController: clientController ?? this.clientController,
      dateController: dateController ?? this.dateController,
      clockInController: clockInController ?? this.clockInController,
      clockOutController: clockOutController ?? this.clockOutController,
      reasonController: reasonController ?? this.reasonController,
      gpsController: gpsController ?? this.gpsController,
      signaturePadKey: signaturePadKey ?? this.signaturePadKey,
      completedWorkIds: completedWorkIds ?? this.completedWorkIds,
      addedDate: addedDate ?? this.addedDate,
      selectedClientId: selectedClientId ?? this.selectedClientId,
      signatureBase64: signatureBase64 ?? this.signatureBase64,
      clockInTime: clockInTime ?? this.clockInTime,
      clockOutTime: clockOutTime ?? this.clockOutTime,
      timesheetId: timesheetId ?? this.timesheetId,
      isFetchingError: isFetchingError ?? this.isFetchingError,
    );
  }
}

class TimesheetReason {
  final String code;
  final String name;

  TimesheetReason({required this.code, required this.name});
}
