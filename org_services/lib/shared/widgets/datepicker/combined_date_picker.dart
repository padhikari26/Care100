import 'dart:io';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

void showCustomDatePicker(
  BuildContext context, {
  DateTime? initialDate,
  DateTime? firstDate,
  DateTime? lastDate,
  required Function(DateTime) onDateSelected,
}) {
  if (Platform.isIOS) {
    showCupertinoDatePicker(
      context,
      initialDate: initialDate,
      firstDate: firstDate,
      lastDate: lastDate,
      onDateSelected: onDateSelected,
    );
  } else {
    showMaterialDatePicker(
      context,
      initialDate: initialDate,
      firstDate: firstDate,
      lastDate: lastDate,
      onDateSelected: onDateSelected,
    );
  }
}

void showCupertinoDatePicker(
  BuildContext context, {
  DateTime? initialDate,
  DateTime? firstDate,
  DateTime? lastDate,
  required Function(DateTime) onDateSelected,
}) {
  final now = DateTime.now();
  final effectiveInitialDate = initialDate ?? now;
  final effectiveLastDate = lastDate ?? now.add(const Duration(days: 365 * 10));
  final clampedInitialDate =
      effectiveInitialDate.isAfter(effectiveLastDate)
          ? effectiveLastDate
          : effectiveInitialDate;

  showCupertinoModalPopup(
    context: context,
    builder:
        (context) => Container(
          height: 300,
          color: CupertinoColors.systemBackground.resolveFrom(context),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CupertinoButton(
                    child: const Text('Cancel'),
                    onPressed: () => Navigator.pop(context),
                  ),
                  CupertinoButton(
                    child: const Text('Done'),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              Expanded(
                child: CupertinoDatePicker(
                  mode: CupertinoDatePickerMode.date,
                  initialDateTime: clampedInitialDate,
                  minimumDate: firstDate,
                  maximumDate: effectiveLastDate,
                  onDateTimeChanged: onDateSelected,
                ),
              ),
            ],
          ),
        ),
  );
}

void showMaterialDatePicker(
  BuildContext context, {
  DateTime? initialDate,
  DateTime? firstDate,
  DateTime? lastDate,
  required Function(DateTime) onDateSelected,
}) {
  showDatePicker(
    context: context,
    initialDate: initialDate ?? DateTime.now(),
    firstDate: firstDate ?? DateTime(1960),
    lastDate: lastDate ?? DateTime(2100),
  ).then((date) {
    if (date != null) onDateSelected(date);
  });
}
