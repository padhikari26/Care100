import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:orgservice/app/utils/size_config.dart';

import '../../app/theme/theme.dart';
import 'full_calendar.dart';

class TimesheetCalendar extends StatelessWidget {
  final Function? callBack;
  final BuildContext ctx;
  final DateTime selectedDate;
  const TimesheetCalendar({
    super.key,
    this.callBack,
    required this.selectedDate,
    required this.ctx,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60.hs,
      padding: EdgeInsets.symmetric(vertical: 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Expanded(
            child: FullCalendar(
              startDate: DateTime.now().subtract(Duration(days: 365)),
              endDate: DateTime.now().add(Duration(days: 1000)),
              currentDate: DateTime.now(),
              dateColor: Colors.black,
              dateSelectedBg: kSecondaryColor,
              selectedDate: selectedDate,
              locale: Localizations.localeOf(context).languageCode,
              onDateChange: (d) {
                Get.back();
                callBack != null ? callBack!(d) : null;
                //
              },
              showNextPreIcon: true,
              calendarScroll: FullCalendarScroll.horizontal,
            ),
          ),
        ],
      ),
    );
  }
}
