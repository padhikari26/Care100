import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get/get.dart';
import 'package:orgservice/app/theme/theme.dart';
import 'package:orgservice/app/utils/size_config.dart';
import 'package:orgservice/features/profile/controller/bloc/profile_bloc.dart';
import 'package:orgservice/features/timesheets/controller/bloc/timesheet_bloc.dart';
import 'package:orgservice/features/timesheets/view/add_timesheet.dart';
import 'package:orgservice/features/timesheets/view/download_button.dart';
import 'package:orgservice/shared/widgets/custom_scaffold.dart';
import 'package:orgservice/shared/widgets/loading.dart';
import 'package:orgservice/shared/widgets/weekly_date_changer.dart';

import '../../../app/utils/helper.dart';
import '../model/all_timesheet_model.dart';

class TimesheetScreen extends StatefulWidget {
  const TimesheetScreen({super.key});

  @override
  State<TimesheetScreen> createState() => _TimesheetScreenState();
}

class _TimesheetScreenState extends State<TimesheetScreen>
    with TickerProviderStateMixin {
  late TimesheetBloc timesheetBloc;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  // Color scheme
  final Color primaryColor = const Color(0xFF2563EB);
  final Color secondaryColor = const Color(0xFF64748B);
  final Color successColor = const Color(0xFF10B981);
  final Color warningColor = const Color(0xFFF59E0B);
  final Color errorColor = const Color(0xFFEF4444);
  final Color backgroundColor = const Color(0xFFF8FAFC);
  final Color cardColor = Colors.white;

  @override
  void initState() {
    super.initState();
    timesheetBloc = context.read<TimesheetBloc>();
    timesheetBloc.add(GetTimesheetEvent());

    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 67.0),
        child: FloatingActionButton(
          child: Icon(Icons.add),
          onPressed: () {
            Get.to(() => AddTimesheet());
          },
        ),
      ),
      backgroundColor: backgroundColor,
      body: BlocBuilder<TimesheetBloc, TimesheetState>(
        builder: (context, state) {
          return Processing(
            loading: state.isLoading,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Column(
                children: [
                  _buildHeader(state),
                  Row(
                    children: [
                      Expanded(child: _buildWeeklyNavigator(state)),
                      DownloadButton(
                        isDownloading: state.isDownloading,
                        onDownload: (DateTimeRange range) {
                          timesheetBloc.add(
                            DownloadTimesheetEvent(
                              employeeId:
                                  context
                                      .read<ProfileBloc>()
                                      .state
                                      .userData
                                      ?.id ??
                                  "",
                              startDate: range.start,
                              endDate: range.end,
                            ),
                          );
                        },
                        primaryColor: primaryColor,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  _buildSummaryCards(state),
                  Expanded(child: _buildTimesheetList(state)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(TimesheetState state) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      decoration: BoxDecoration(
        color: cardColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Track your time efficiently',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF1F2937),
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: primaryColor.withAlpha(30),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  CupertinoIcons.clock,
                  color: primaryColor,
                  size: 28,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWeeklyNavigator(TimesheetState state) {
    //    callBack(DateTime d) {
    //   context.read<EmpTimesheetCubit>().setWeeklyDate(date: d);
    //   getData(isRefresh: true);
    // }
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: WeeklyDateChanger(
        selectedDate: state.selectedDate,
        callBack: (DateTime date) {
          context.read<TimesheetBloc>().add(
            OnWeeklyDateChangeEvent(date: date),
          );
          context.read<TimesheetBloc>().add(TimesheetDateChangedEvent(date));
        },
        onLeftPress: () {
          context.read<TimesheetBloc>().add(
            OnWeeklyDateChangeEvent(
              date: state.selectedDate.subtract(const Duration(days: 7)),
            ),
          );
        },
        onRightPress: () {
          context.read<TimesheetBloc>().add(
            OnWeeklyDateChangeEvent(
              date: state.selectedDate.add(const Duration(days: 7)),
            ),
          );
        },
        dateFrom: state.fromDate,
        dateTo: state.toDate,
      ),
    );
  }

  Widget _buildSummaryCards(TimesheetState state) {
    final totalHours = _calculateTotalHours(state.timesheets ?? []);
    final completedTasks = _calculateCompletedTasks(state.timesheets ?? []);
    final workingDays = _calculateWorkingDays(state.timesheets ?? []);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: _buildSummaryCard(
              'Total Hours',
              '${totalHours.toStringAsFixed(1)}h',
              CupertinoIcons.time,
              primaryColor,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildSummaryCard(
              'Tasks Done',
              completedTasks.toString(),
              CupertinoIcons.checkmark_circle,
              successColor,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildSummaryCard(
              'Working Days',
              workingDays.toString(),
              CupertinoIcons.calendar,
              warningColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withAlpha(20),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: context.bodyMedium?.copyWith(
              fontSize: 18.fs,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 4),
          FittedBox(
            child: Text(
              title,
              style: context.bodySmall?.copyWith(
                fontSize: 10.fs,
                color: secondaryColor,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimesheetList(TimesheetState state) {
    if (state.timesheets == null || state.timesheets!.isEmpty) {
      return _buildEmptyState();
    }

    return Container(
      margin: const EdgeInsets.all(16),
      child: ListView.builder(
        physics: const BouncingScrollPhysics(),
        itemCount: state.timesheets!.length,
        itemBuilder: (context, index) {
          final timesheet = state.timesheets![index];
          return _buildTimesheetCard(timesheet, index);
        },
      ),
    );
  }

  Widget _buildTimesheetCard(Timesheet timesheet, int index) {
    final isClockInAvailable = timesheet.clockIn != null;
    final isClockOutAvailable = timesheet.clockOut != null;
    final workingHours = _calculateWorkingHours(timesheet);

    return GestureDetector(
      onTap: () {
        timesheetBloc.add(SetTimesheetIdEvent(timesheetId: timesheet.id ?? ""));
        timesheetBloc.add(FillFormEvent(timesheet: timesheet));
        Get.to(() => AddTimesheet());
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _formatDate(timesheet.date),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF1F2937),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _getDayOfWeek(timesheet.date),
                          style: TextStyle(
                            fontSize: 14,
                            color: secondaryColor,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusColor(
                          isClockInAvailable,
                          isClockOutAvailable,
                        ).withAlpha(20),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _getStatusText(isClockInAvailable, isClockOutAvailable),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: _getStatusColor(
                            isClockInAvailable,
                            isClockOutAvailable,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _buildTimeInfo(
                        'Clock In',
                        isClockInAvailable
                            ? TimeOfDay.fromDateTime(
                              Helper.dateToLocalDateTime(
                                timesheet.clockIn.toString(),
                              ),
                            ).format(context)
                            : '--:--',
                        CupertinoIcons.play_circle,
                        isClockInAvailable ? successColor : secondaryColor,
                      ),
                    ),
                    Container(
                      width: 1,
                      height: 40,
                      color: Colors.grey.shade200,
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                    Expanded(
                      child: _buildTimeInfo(
                        'Clock Out',
                        isClockOutAvailable
                            ? TimeOfDay.fromDateTime(
                              Helper.dateToLocalDateTime(
                                timesheet.clockOut.toString(),
                              ),
                            ).format(context)
                            : '--:--',
                        CupertinoIcons.stop_circle,
                        isClockOutAvailable ? errorColor : secondaryColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: backgroundColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            CupertinoIcons.checkmark_circle_fill,
                            color: successColor,
                            size: 16,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Tasks Completed: ${timesheet.completedWorks?.length ?? 0}',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF1F2937),
                            ),
                          ),
                        ],
                      ),
                      if (workingHours > 0)
                        Text(
                          '${workingHours.toStringAsFixed(1)}h',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: primaryColor,
                          ),
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

  Widget _buildTimeInfo(String label, String time, IconData icon, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: secondaryColor,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          time,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF1F2937),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: primaryColor.withAlpha(30),
              shape: BoxShape.circle,
            ),
            child: Icon(CupertinoIcons.clock, size: 48, color: primaryColor),
          ),
          const SizedBox(height: 24),
          Text(
            'No timesheets found',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Start tracking your time by adding\nyour first timesheet entry',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: secondaryColor),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              Get.to(() => AddTimesheet());
            },
            icon: const Icon(CupertinoIcons.add),
            label: const Text('Add Timesheet'),
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Helper methods
  double _calculateTotalHours(List<Timesheet> timesheets) {
    double total = 0;
    for (var timesheet in timesheets) {
      total += _calculateWorkingHours(timesheet);
    }
    return total;
  }

  int _calculateCompletedTasks(List<Timesheet> timesheets) {
    int total = 0;
    for (var timesheet in timesheets) {
      if (timesheet.completedWorks != null) {
        total += timesheet.completedWorks?.length ?? 0;
      }
    }
    return total;
  }

  int _calculateWorkingDays(List<dynamic> timesheets) {
    return timesheets.where((t) => t.clockIn != null).length;
  }

  double _calculateWorkingHours(dynamic timesheet) {
    if (timesheet.clockIn == null || timesheet.clockOut == null) return 0;

    final clockIn = Helper.dateToLocalDateTime(timesheet.clockIn.toString());

    final clockOut = Helper.dateToLocalDateTime(timesheet.clockOut.toString());
    final difference = clockOut.difference(clockIn);

    return difference.inMinutes / 60.0;
  }

  String _formatDate(dynamic date) {
    final DateTime dateTime = DateTime.parse(date.toString());
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${months[dateTime.month - 1]} ${dateTime.day}';
  }

  String _getDayOfWeek(dynamic date) {
    final DateTime dateTime = DateTime.parse(date.toString());
    final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[dateTime.weekday - 1];
  }

  Color _getStatusColor(bool clockIn, bool clockOut) {
    if (clockIn && clockOut) return successColor;
    if (clockIn && !clockOut) return warningColor;
    return secondaryColor;
  }

  String _getStatusText(bool clockIn, bool clockOut) {
    if (clockIn && clockOut) return 'Completed';
    if (clockIn && !clockOut) return 'In Progress';
    return 'Not Started';
  }
}
