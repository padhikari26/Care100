import 'package:flutter/material.dart';
import 'package:orgservice/app/utils/size_config.dart';
import '../../app/utils/helper.dart';
import 'button/custom_button.dart';
import 'calendar.dart';

class WeeklyDateChanger extends StatelessWidget {
  final Function() onLeftPress;
  final Function() onRightPress;
  final DateTime dateFrom;
  final DateTime dateTo;
  final bool ignorePointer;
  final Function(DateTime) callBack;
  final DateTime selectedDate;

  const WeeklyDateChanger({
    super.key,
    required this.onLeftPress,
    required this.onRightPress,
    required this.dateFrom,
    required this.dateTo,
    this.ignorePointer = false,
    required this.callBack,
    required this.selectedDate,
  });

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Container(
        padding: const EdgeInsets.only(left: 20, right: 20),
        decoration: BoxDecoration(color: Colors.white),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: onLeftPress,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                ),
                child: Center(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Icon(Icons.arrow_back_ios_new_rounded),
                  ),
                ),
              ),
            ),
            CustomButton(
              borderRadius: 30,
              height: 30,
              fontSize: 12,
              text:
                  "${Helper.dateToLocalTime(dateFrom, format: "dd MMM")} - ${Helper.dateToLocalTime(dateTo, format: "dd MMM, yyyy")}",
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(25),
                      topRight: Radius.circular(25),
                    ),
                  ),
                  constraints: BoxConstraints(maxHeight: 70.hs),
                  builder: (context) {
                    return TimesheetCalendar(
                      ctx: context,
                      callBack: callBack,
                      selectedDate: selectedDate,
                    );
                  },
                );
              },
            ),
            GestureDetector(
              onTap: dateTo.isAfter(DateTime.now()) ? null : onRightPress,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(shape: BoxShape.circle),
                child: Center(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Icon(Icons.arrow_forward_ios_rounded),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
