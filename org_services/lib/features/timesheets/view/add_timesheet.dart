import 'dart:convert';
import 'dart:ui';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:orgservice/features/timesheets/controller/bloc/timesheet_bloc.dart';
import 'package:syncfusion_flutter_signaturepad/signaturepad.dart';
import 'package:orgservice/app/utils/size_config.dart';
import 'package:orgservice/shared/widgets/button/custom_button.dart';
import 'package:orgservice/shared/widgets/custom_page_scaffold.dart';
import 'package:orgservice/shared/widgets/formfields/custom_cupertino_form_field.dart';
import 'package:orgservice/shared/widgets/loading.dart';
import '../../../app/theme/theme.dart';
import '../model/add_section_list.dart';
import '../model/all_timesheet_model.dart';

class AddTimesheet extends StatefulWidget {
  const AddTimesheet({super.key});

  @override
  State<AddTimesheet> createState() => _AddTimesheetState();
}

class _AddTimesheetState extends State<AddTimesheet> {
  late TimesheetBloc timesheetBloc;
  final _formKey = GlobalKey<CupertinoFormState>();
  @override
  void initState() {
    super.initState();
    timesheetBloc = BlocProvider.of<TimesheetBloc>(context);
    timesheetBloc.add(GetAddSectionListEvent());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TimesheetBloc, TimesheetState>(
      builder: (context, state) {
        return CustomPageScaffold(
          backgroundColor: Colors.white,
          navigationBar: CupertinoNavigationBar(
            middle: Text(
              (state.timesheetId?.isNotEmpty ?? false)
                  ? 'Update Timesheet'
                  : 'Add Timesheet',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF1F2937),
              ),
            ),
            backgroundColor: Colors.white,
            border: Border(
              bottom: BorderSide(color: Colors.grey.shade200, width: 1),
            ),
            leading: CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: () => Navigator.pop(context),
              child: Icon(CupertinoIcons.back, color: kPrimaryColor),
            ),
          ),
          child: Processing(
            loading: state.isFetching || state.isUpdating,
            child:
                state.isFetching
                    ? Container()
                    : state.isFetchingError
                    ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Failed to load data. Please try again.',
                            style: TextStyle(color: kErrorColor, fontSize: 16),
                          ),
                          SizedBox(height: 16),
                          CustomButton.filled(
                            text: 'Retry',
                            isLoading: state.isFetching,
                            backgroundColor: kPrimaryColor,
                            onPressed: () {
                              timesheetBloc.add(GetAddSectionListEvent());
                            },
                          ),
                        ],
                      ),
                    )
                    : SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.all(16.0),
                      child: CupertinoForm(
                        key: _formKey,
                        formKey: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            (state.timesheetId?.isNotEmpty ?? false)
                                ? SizedBox.shrink()
                                : _buildHeader(),
                            SizedBox(height: 2.hs),
                            _buildFormCard(state: state),
                            SizedBox(height: 2.hs),
                            _buildWorksSection(state: state),
                            SizedBox(height: 2.hs),
                            _buildSignatureSection(state: state),
                            SizedBox(height: 3.hs),
                            CustomButton.filled(
                              width: double.maxFinite,
                              text:
                                  (state.timesheetId?.isNotEmpty ?? false)
                                      ? 'Update Timesheet'
                                      : 'Submit Timesheet',
                              backgroundColor: kPrimaryColor,
                              onPressed: () {
                                if (!_formKey.currentState!.validate()) {
                                  return;
                                }
                                if (state.completedWorkIds.isEmpty &&
                                    (state.signatureBase64?.isEmpty ?? true)) {
                                  showCupertinoDialog(
                                    context: context,
                                    builder:
                                        (context) => CupertinoAlertDialog(
                                          title: const Text(
                                            'Some fields are missing',
                                          ),
                                          content: const Text(
                                            'Please select at least one completed work or provide a signature.',
                                          ),
                                          actions: [
                                            CupertinoDialogAction(
                                              onPressed:
                                                  () => Navigator.pop(context),
                                              child: const Text('OK'),
                                            ),
                                          ],
                                        ),
                                  );
                                  return;
                                }
                                timesheetBloc.add(TimesheetSubmitEvent());
                              },
                            ),
                            SizedBox(height: 2.hs),
                          ],
                        ),
                      ),
                    ),
          ),
        );
      },
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kPrimaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              CupertinoIcons.add_circled,
              color: kPrimaryColor,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'New Timesheet Entry',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Fill in your work details for today',
                  style: TextStyle(fontSize: 14, color: kSecondaryColor),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormCard({required TimesheetState state}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('Basic Information'),
            const SizedBox(height: 16),
            CupertinoFormField(
              controller: state.clientController,
              labelText: 'Select Client',
              hintText: 'Choose a client',
              isReadOnly: true,
              suffix: Icon(CupertinoIcons.chevron_down, color: kSecondaryColor),
              onTap: () {
                _showClientSelection(state: state);
              },
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please select a client';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            CupertinoFormField(
              controller: state.dateController,
              labelText: 'Date',
              hintText: 'Select date',
              isReadOnly: true,
              suffix: Icon(CupertinoIcons.calendar, color: kSecondaryColor),
              onTap: () => _showDatePicker(state: state),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please select a date';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: CupertinoFormField(
                    controller: state.clockInController,
                    labelText: 'Clock In',
                    hintText: 'Select time',
                    isReadOnly: true,
                    suffix: Icon(CupertinoIcons.time, color: kSuccessColor),
                    onTap: () => _showTimePicker(true, state),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please select clock in time';
                      }
                      return null;
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: CupertinoFormField(
                    controller: state.clockOutController,
                    labelText: 'Clock Out',
                    hintText: 'Select time',
                    isReadOnly: true,
                    suffix: Icon(CupertinoIcons.time, color: kErrorColor),
                    onTap: () => _showTimePicker(false, state),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please select clock out time';
                      }
                      return null;
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Reason Field
            CupertinoFormField(
              controller: state.reasonController,
              labelText: 'Reason',
              hintText: 'Select reason',
              maxLines: 1,
              isReadOnly: true,
              keyboardType: TextInputType.multiline,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please select a reason';
                }
                return null;
              },
              onTap: () {
                showCupertinoModalPopup(
                  context: context,
                  builder: (context) {
                    return CupertinoActionSheet(
                      title: Text('Select Reason'),
                      actions:
                          state.reasons.map((reason) {
                            return CupertinoActionSheetAction(
                              onPressed: () {
                                setState(() {
                                  state.reasonController.text = reason.code;
                                });
                                Navigator.pop(context);
                              },
                              child: Text(reason.name),
                            );
                          }).toList(),
                      cancelButton: CupertinoActionSheetAction(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                    );
                  },
                );
              },
            ),
            //gps
            const SizedBox(height: 16),
            CupertinoFormField(
              controller: state.gpsController,
              labelText: 'GPS',
              hintText: 'Select GPS',
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please select GPS';
                }
                return null;
              },
              isReadOnly: true,
              suffix: Icon(CupertinoIcons.location, color: kSecondaryColor),
              onTap: () {
                showCupertinoModalPopup(
                  context: context,
                  builder: (context) {
                    return CupertinoActionSheet(
                      title: Text('Select GPS'),
                      actions:
                          state.gps.map((gps) {
                            return CupertinoActionSheetAction(
                              onPressed: () {
                                setState(() {
                                  state.gpsController.text = gps.code;
                                });
                                Navigator.pop(context);
                              },
                              child: Text(gps.name),
                            );
                          }).toList(),
                      cancelButton: CupertinoActionSheetAction(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                    );
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWorksSection({required TimesheetState state}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildSectionTitle('Completed Works'),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: kPrimaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${state.completedWorkIds.length}/${state.works?.length ?? 0}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: kPrimaryColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...?state.works?.map((work) => _buildWorkItem(work, state)),
          ],
        ),
      ),
    );
  }

  Widget _buildWorkItem(Works work, TimesheetState state) {
    final isSelected = state.completedWorkIds.any(
      (cw) => cw.workId == work.id && cw.code == work.code,
    );

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isSelected ? kPrimaryColor.withOpacity(0.05) : kBackgroundColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color:
              isSelected ? kPrimaryColor.withOpacity(0.3) : Colors.transparent,
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            timesheetBloc.add(
              ToggleCompletedWorkEvent(
                work: CompletedWorks(workId: work.id, code: work.code),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: isSelected ? kPrimaryColor : Colors.transparent,
                    border: Border.all(
                      color: isSelected ? kPrimaryColor : kSecondaryColor,
                      width: 2,
                    ),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child:
                      isSelected
                          ? Icon(
                            CupertinoIcons.checkmark,
                            size: 16,
                            color: Colors.white,
                          )
                          : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        work.name ?? "",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        work.description ?? "",
                        style: TextStyle(fontSize: 14, color: kSecondaryColor),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSignatureSection({required TimesheetState state}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('Client Signature'),
            const SizedBox(height: 16),
            GestureDetector(
              onTap: () => _showSignaturePad(state: state),
              child: Container(
                width: double.infinity,
                height: 120,
                decoration: BoxDecoration(
                  color: kBackgroundColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child:
                    (state.signatureBase64 != null &&
                            state.signatureBase64!.isNotEmpty)
                        ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.memory(
                            base64Decode(state.signatureBase64!),
                            fit: BoxFit.contain,
                          ),
                        )
                        : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              CupertinoIcons.pencil_circle,
                              size: 32,
                              color: kSecondaryColor,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Tap to add signature',
                              style: TextStyle(
                                fontSize: 16,
                                color: kSecondaryColor,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
              ),
            ),
            if (state.signatureBase64 != null &&
                state.signatureBase64!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Center(
                child: CupertinoButton(
                  onPressed: () {
                    timesheetBloc.add(SetSignatureEvent(signatureBase64: ""));
                  },
                  child: Text(
                    'Clear Signature',
                    style: TextStyle(color: kErrorColor),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: const Color(0xFF1F2937),
      ),
    );
  }

  // Event handlers
  void _showClientSelection({required TimesheetState state}) {
    showCupertinoModalPopup(
      context: context,
      builder: (context) {
        return CupertinoActionSheet(
          title: Text('Select Client'),
          actions:
              state.clients?.map((client) {
                return CupertinoActionSheetAction(
                  onPressed: () {
                    timesheetBloc.add(SelectClientEvent(client: client));
                    Navigator.pop(context);
                  },
                  child: Text(client.name ?? ""),
                );
              }).toList(),
          cancelButton: CupertinoActionSheetAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        );
      },
    );
  }

  void _showDatePicker({required TimesheetState state}) {
    showCupertinoModalPopup(
      context: context,
      builder: (context) {
        return Container(
          height: 300,
          color: CupertinoColors.systemBackground.resolveFrom(context),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    CupertinoButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    CupertinoButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      child: const Text('Done'),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: CupertinoDatePicker(
                  mode: CupertinoDatePickerMode.date,
                  initialDateTime: state.addedDate,
                  onDateTimeChanged: (DateTime date) {
                    timesheetBloc.add(SelectFormDateEvent(date: date));
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showTimePicker(bool isClockIn, TimesheetState state) {
    showCupertinoModalPopup(
      context: context,
      builder: (context) {
        DateTime selectedTime =
            isClockIn
                ? (state.clockInTime ?? DateTime.now())
                : (state.clockInTime ?? DateTime.now());

        return Container(
          height: 300,
          color: CupertinoColors.systemBackground.resolveFrom(context),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    CupertinoButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    CupertinoButton(
                      onPressed: () {
                        setState(() {
                          if (isClockIn) {
                            timesheetBloc.add(
                              SetClockInTimeEvent(clockInTime: selectedTime),
                            );
                          } else {
                            timesheetBloc.add(
                              SetClockOutTimeEvent(clockOutTime: selectedTime),
                            );
                          }
                        });
                        Navigator.pop(context);
                      },
                      child: const Text('Done'),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: CupertinoDatePicker(
                  mode: CupertinoDatePickerMode.time,
                  initialDateTime: state.addedDate,
                  onDateTimeChanged: (DateTime time) {
                    selectedTime = DateTime(
                      time.year,
                      time.month,
                      time.day,
                      time.hour,
                      time.minute,
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showSignaturePad({required TimesheetState state}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.7,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.grey.shade200),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    CupertinoButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    Text(
                      'Client Signature',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    CupertinoButton(
                      onPressed: () async {
                        final signatureImage =
                            await state.signaturePadKey.currentState?.toImage();
                        if (signatureImage != null) {
                          final byteData = await signatureImage.toByteData(
                            format: ImageByteFormat.png,
                          );
                          final bytes = byteData!.buffer.asUint8List();
                          final base64Signature = base64Encode(bytes);
                          timesheetBloc.add(
                            SetSignatureEvent(signatureBase64: base64Signature),
                          );
                          Navigator.pop(context);
                        }
                      },
                      child: const Text('Save'),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  margin: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: SfSignaturePad(
                    key: state.signaturePadKey,
                    backgroundColor: Colors.white,
                    strokeColor: Colors.black,
                    minimumStrokeWidth: 2,
                    maximumStrokeWidth: 4,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    CupertinoButton(
                      onPressed: () {
                        state.signaturePadKey.currentState?.clear();
                      },
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(CupertinoIcons.clear, color: kErrorColor),
                          const SizedBox(width: 8),
                          Text('Clear', style: TextStyle(color: kErrorColor)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    // TODO: implement dispose
    super.dispose();
    timesheetBloc.add(ClearFormEvent());
  }
}
