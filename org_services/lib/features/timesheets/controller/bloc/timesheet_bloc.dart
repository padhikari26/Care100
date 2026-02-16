import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:orgservice/app/utils/constants.dart';
import 'package:orgservice/app/utils/date_formatter.dart';
import 'package:orgservice/app/utils/helper.dart';
import 'package:orgservice/app/utils/toast.dart';
import 'package:orgservice/features/timesheets/model/add_section_list.dart';
import 'package:syncfusion_flutter_signaturepad/signaturepad.dart';

import '../../../../app/utils/dependencies.dart';
import '../../../../core/network/api_request/api_request.dart';
import '../../../auth/controllers/bloc/auth_bloc.dart';
import '../../model/all_timesheet_model.dart';

part 'timesheet_event.dart';
part 'timesheet_state.dart';

class TimesheetBloc extends Bloc<TimesheetEvent, TimesheetState>
    with NetworkEventTransformer<TimesheetEvent, TimesheetState> {
  final ApiRequest _apiRequest = getIt<ApiRequest>();
  TimesheetBloc() : super(TimesheetState.initial()) {
    on<TimesheetInitialEvent>(_handleInitialState);
    on<TimesheetDateChangedEvent>(_handleDateChanged);
    on<TimesheetFailureEvent>(_handleFailure);
    on<GetTimesheetEvent>(_handleGetTimesheet);
    on<OnWeeklyDateChangeEvent>(_handleWeeklyDateChange);
    on<GetAddSectionListEvent>(_handleGetAddSectionList);
    on<ToggleCompletedWorkEvent>(_toggleCompletedWork);
    on<FillFormEvent>(_handleFillForm);
    on<ClearFormEvent>(_handleClearForm);
    on<SelectClientEvent>(_handleSelectClient);
    on<SelectFormDateEvent>(_handleSelectFormDate);
    on<SetSignatureEvent>(_handleSetSignature);
    on<TimesheetSubmitEvent>(
      _handleSubmitTimesheet,
      transformer: networkCheckTransformer(),
    );
    on<SetClockInTimeEvent>(_handleSetClockInTime);
    on<SetClockOutTimeEvent>(_handleSetClockOutTime);
    on<SetTimesheetIdEvent>(_handleSetTimesheetId);
    on<DownloadTimesheetEvent>(_handleDownloadTimesheet);
  }

  void _handleDownloadTimesheet(
    DownloadTimesheetEvent event,
    Emitter<TimesheetState> emit,
  ) async {
    try {
      final status = await Helper.requestStoragePermissions();
      if (status != true) {
        showFailureToast(message: "Storage permission is required to download");
        return;
      }
      emit(state.copyWith(isDownloading: true));
      final res = await _apiRequest.downloadTimesheet(
        employeeId: event.employeeId,
        startDate: event.startDate,
        endDate: event.endDate,
      );
      if (res.statusCode != 200) {
        add(TimesheetFailureEvent('Download failed'));
        return;
      }
      Helper.downloadFile(res.bodyBytes, 'timesheet_${state.fromDate}.pdf');
      emit(state.copyWith(isDownloading: false));
    } catch (e) {
      add(TimesheetFailureEvent("Something went wrong"));
    }
  }

  void _handleSetTimesheetId(
    SetTimesheetIdEvent event,
    Emitter<TimesheetState> emit,
  ) {
    emit(state.copyWith(timesheetId: event.timesheetId));
  }

  void _handleSetClockInTime(
    SetClockInTimeEvent event,
    Emitter<TimesheetState> emit,
  ) {
    emit(
      state.copyWith(
        clockInTime: event.clockInTime,
        clockInController: TextEditingController(
          text: DateFormatter.formatTime(event.clockInTime),
        ),
      ),
    );
  }

  void _handleSetClockOutTime(
    SetClockOutTimeEvent event,
    Emitter<TimesheetState> emit,
  ) {
    emit(
      state.copyWith(
        clockOutTime: event.clockOutTime,
        clockOutController: TextEditingController(
          text: DateFormatter.formatTime(event.clockOutTime),
        ),
      ),
    );
  }

  void _handleSetSignature(
    SetSignatureEvent event,
    Emitter<TimesheetState> emit,
  ) {
    emit(state.copyWith(signatureBase64: event.signatureBase64));
  }

  void _handleSelectFormDate(
    SelectFormDateEvent event,
    Emitter<TimesheetState> emit,
  ) {
    emit(
      state.copyWith(
        addedDate: event.date,
        dateController: TextEditingController(
          text: DateFormatter.formatStringDate(event.date.toIso8601String()),
        ),
      ),
    );
  }

  void _handleSelectClient(
    SelectClientEvent event,
    Emitter<TimesheetState> emit,
  ) {
    emit(
      state.copyWith(
        selectedClientId: event.client?.id ?? '',
        clientController: TextEditingController(text: event.client?.name ?? ''),
      ),
    );
  }

  void _handleInitialState(
    TimesheetInitialEvent event,
    Emitter<TimesheetState> emit,
  ) {
    emit(TimesheetState.initial());
  }

  void _handleDateChanged(
    TimesheetDateChangedEvent event,
    Emitter<TimesheetState> emit,
  ) {
    emit(state.copyWith(selectedDate: event.selectedDate));
  }

  void _handleFailure(
    TimesheetFailureEvent event,
    Emitter<TimesheetState> emit,
  ) {
    emit(
      state.copyWith(
        isLoading: false,
        errorMessage: event.errorMessage,
        isDownloading: false,
        isUpdating: false,
      ),
    );
    showFailureToast(message: event.errorMessage);
  }

  void _handleGetTimesheet(
    GetTimesheetEvent event,
    Emitter<TimesheetState> emit,
  ) async {
    try {
      emit(state.copyWith(isLoading: true, timesheets: []));
      final res = await _apiRequest.getTimesheet(
        fromDate: state.fromDate,
        toDate: state.toDate,
      );
      if (!res.isSuccess) {
        add(TimesheetFailureEvent(res.formattedErrorMessage));
        return;
      }
      final response = AllTimesheetModel.fromJson(res.data);
      emit(state.copyWith(isLoading: false, timesheets: response.timesheets));
    } catch (e) {
      add(TimesheetFailureEvent("Something went wrong"));
    }
  }

  void _handleWeeklyDateChange(
    OnWeeklyDateChangeEvent event,
    Emitter<TimesheetState> emit,
  ) {
    final DateTime newSelectedDate = event.date;
    final DateTime monday = newSelectedDate.subtract(
      Duration(days: newSelectedDate.weekday - 1),
    );
    final DateTime sunday = newSelectedDate.add(
      Duration(days: DateTime.daysPerWeek - newSelectedDate.weekday),
    );
    emit(
      state.copyWith(
        selectedDate: newSelectedDate,
        fromDate: monday,
        toDate: sunday,
        isLoading: true,
      ),
    );
    add(GetTimesheetEvent());
  }

  void _handleGetAddSectionList(
    GetAddSectionListEvent event,
    Emitter<TimesheetState> emit,
  ) async {
    try {
      emit(state.copyWith(isFetching: true));
      final res = await _apiRequest.addSectionList();
      if (!res.isSuccess) {
        emit(state.copyWith(isFetchingError: true));
        add(TimesheetFailureEvent(res.formattedErrorMessage));
        return;
      }
      final response = TimesheetAddSectionList.fromJson(res.data);
      emit(
        state.copyWith(
          isFetching: false,
          works: response.works,
          isFetchingError: false,
          clients: response.clients ?? [],
        ),
      );
    } catch (e) {
      emit(state.copyWith(isFetchingError: true));
      add(TimesheetFailureEvent("Something went wrong"));
    }
  }

  void _toggleCompletedWork(
    ToggleCompletedWorkEvent event,
    Emitter<TimesheetState> emit,
  ) {
    final List<CompletedWorks> updatedCompletedWorkIds = List.from(
      state.completedWorkIds,
    );
    final index = updatedCompletedWorkIds.indexWhere(
      (cw) => cw.workId == event.work.workId,
    );
    if (index != -1) {
      updatedCompletedWorkIds.removeAt(index);
    } else {
      updatedCompletedWorkIds.add(
        CompletedWorks(
          workId: event.work.workId,
          code: event.work.code,
          completed: true,
        ),
      );
    }
    emit(state.copyWith(completedWorkIds: updatedCompletedWorkIds));
  }

  void _handleFillForm(FillFormEvent event, Emitter<TimesheetState> emit) {
    emit(
      state.copyWith(
        clientController: TextEditingController(
          text: event.timesheet.client?.name ?? '',
        ),
        completedWorkIds:
            event.timesheet.completedWorks
                ?.map(
                  (e) => CompletedWorks(
                    workId: e.workId,
                    code: e.code,
                    completed: e.completed ?? false,
                  ),
                )
                .toList() ??
            [],

        dateController: TextEditingController(
          text: DateFormatter.formatStringDate(
            event.timesheet.date ?? DateTime.now().toIso8601String(),
          ),
        ),
        clockInController: TextEditingController(
          text: DateFormatter.formatTime(
            Helper.dateToLocalDateTime(
              event.timesheet.clockIn ?? DateTime.now().toIso8601String(),
            ),
          ),
        ),
        clockOutController: TextEditingController(
          text: DateFormatter.formatTime(
            Helper.dateToLocalDateTime(
              event.timesheet.clockOut ?? DateTime.now().toIso8601String(),
            ),
          ),
        ),
        reasonController: TextEditingController(
          text: event.timesheet.reason ?? '',
        ),
        gpsController: TextEditingController(text: event.timesheet.gps ?? ''),
        signaturePadKey: GlobalKey<SfSignaturePadState>(),
        addedDate: DateTime.parse(
          event.timesheet.date ?? DateTime.now().toIso8601String(),
        ),
        selectedClientId: event.timesheet.clientId ?? '',
        signatureBase64:
            event.timesheet.clientSignature?.contains('data:image') ?? false
                ? (event.timesheet.clientSignature?.split(',').length == 2
                    ? event.timesheet.clientSignature?.split(',')[1]
                    : event.timesheet.clientSignature)
                : '${event.timesheet.clientSignature}',
      ),
    );
  }

  void _handleClearForm(ClearFormEvent event, Emitter<TimesheetState> emit) {
    emit(
      state.copyWith(
        clientController: TextEditingController(),
        dateController: TextEditingController(
          text: DateFormatter.formatStringDate(
            DateTime.now().toIso8601String(),
          ),
        ),
        clockInController: TextEditingController(),
        clockOutController: TextEditingController(),
        reasonController: TextEditingController(),
        gpsController: TextEditingController(),
        signaturePadKey: GlobalKey<SfSignaturePadState>(),
        completedWorkIds: [],
        addedDate: DateTime.now(),
        selectedClientId: '',
        signatureBase64: '',
        isUpdating: false,
        isFetching: false,
        isLoading: false,
        timesheetId: "",
      ),
    );
  }

  void _handleSubmitTimesheet(
    TimesheetSubmitEvent event,
    Emitter<TimesheetState> emit,
  ) async {
    try {
      emit(state.copyWith(isLoading: true));
      final data = {
        "clientId": state.selectedClientId,
        "date": state.addedDate.toIso8601String(),
        "clockIn": state.clockInTime?.toIso8601String(),
        "clockOut": state.clockOutTime?.toIso8601String(),
        "reason": state.reasonController.text,
        "gps": state.gpsController.text,
        "completedWorks": state.completedWorkIds,
        "clientSignature": state.signatureBase64,
      };
      final res =
          state.timesheetId?.isNotEmpty ?? false
              ? await _apiRequest.updateTimesheet(
                id: state.timesheetId ?? "",
                data: data,
              )
              : await _apiRequest.addTimesheet(data: data);
      if (!res.isSuccess) {
        add(TimesheetFailureEvent(res.formattedErrorMessage));
        return;
      } else {
        add(GetTimesheetEvent());
        showSuccessToast(message: "Timesheet submitted successfully");
        add(ClearFormEvent());
        Navigator.canPop(cusCtx!) ? Navigator.pop(cusCtx!) : null;
      }
    } catch (e) {
      add(TimesheetFailureEvent("Something went wrong"));
    }
  }
}
