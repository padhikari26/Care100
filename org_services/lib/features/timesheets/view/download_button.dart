import 'package:flutter/material.dart';

import 'download_date_picker.dart';

class DownloadButton extends StatelessWidget {
  final bool isDownloading;
  final Function(DateTimeRange) onDownload;
  final Color primaryColor;

  const DownloadButton({
    super.key,
    required this.isDownloading,
    required this.onDownload,
    required this.primaryColor,
  });

  @override
  Widget build(BuildContext context) {
    return isDownloading
        ? SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator.adaptive(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
          ),
        )
        : InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _showDateRangePicker(context),
          child: Container(
            padding: const EdgeInsets.all(12),
            child: Icon(Icons.download_rounded, color: primaryColor, size: 24),
          ),
        );
  }

  Future<void> _showDateRangePicker(BuildContext context) async {
    final DateTimeRange? pickedRange =
        await showModalBottomSheet<DateTimeRange>(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder:
              (context) => DateRangePickerModal(primaryColor: primaryColor),
        );

    if (pickedRange != null) {
      DateTime now = DateTime.now();
      DateTime start = pickedRange.start;
      DateTime end = pickedRange.end;

      if (end.isAfter(now)) {
        end = now;
      }
      if (end.difference(start).inDays > 6) {
        start = end.subtract(const Duration(days: 6));
      }

      onDownload(DateTimeRange(start: start, end: end));
    }
  }
}
