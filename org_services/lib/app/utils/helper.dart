import 'dart:developer';
import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:intl/intl.dart';
import 'package:oktoast/oktoast.dart';
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';

import '../theme/theme.dart';

class Helper {
  static Future<String> getTimeZone() async {
    final String currentTimeZone = await FlutterTimezone.getLocalTimezone();
    return currentTimeZone;
  }

  //launch url
  static Future<void> openUrl(String url) async {
    final uri = Uri.parse(url);

    if (!await launchUrl(uri)) {
      throw Exception('Could not launch $uri');
    }
  }

  static String showLessCharacters({required String text, int length = 300}) {
    if (text.length > length) {
      return '${text.substring(0, 100)}...';
    }
    return text;
  }

  static void copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(text: text));
    showToast('Copied to Clipboard', backgroundColor: kAccentColor);
  }

  static bool areDatesEqual(dynamic date1, dynamic date2) {
    String getDateString(dynamic date) {
      if (date is DateTime) {
        return date.toIso8601String().split('T')[0];
      } else if (date is String) {
        try {
          return date.contains('T')
              ? date.split('T')[0]
              : DateTime.parse(date).toIso8601String().split('T')[0];
        } catch (e) {
          return '';
        }
      }
      return '';
    }

    // Get normalized date strings
    String date1Str = getDateString(date1);
    String date2Str = getDateString(date2);

    // Compare the date strings
    return date1Str.isNotEmpty && date2Str.isNotEmpty && date1Str == date2Str;
  }

  static String getMiddleDate(dynamic startDate, dynamic endDate) {
    DateTime parseDate(dynamic date) {
      if (date is DateTime) {
        return date;
      } else if (date is String) {
        return DateTime.parse(date);
      } else {
        throw ArgumentError('Invalid date format');
      }
    }

    DateTime start = parseDate(startDate);
    DateTime end = parseDate(endDate);
    DateTime middle = start.add(
      Duration(days: (end.difference(start).inDays / 2).round()),
    );
    return '${middle.year}-${middle.month}';
  }

  // date to local time
  static DateTime dateToLocalDateTime(dynamic dateInput) {
    if (dateInput is DateTime) {
      if (dateInput.isUtc) {
        return dateInput.toLocal();
      } else {
        return dateInput;
      }
    } else if (dateInput is String) {
      try {
        final local = DateTime.parse(dateInput).toUtc();
        log('Parsed date: $local');
        return local;
      } catch (e) {
        return DateTime.now().toLocal();
      }
    } else {
      return DateTime.now().toLocal();
    }
  }

  static String dateToLocalTime(
    dynamic dateInput, {
    bool showTime = true,
    String? format,
    bool showDaySuffix = false,
  }) {
    try {
      DateTime dateTime;
      if (dateInput is DateTime) {
        dateTime = dateInput;
      } else if (dateInput is String) {
        dateTime = DateTime.parse(dateInput);
      } else {
        return 'Invalid date format';
      }

      final localDateTime = dateTime.toLocal();

      if (format != null) {
        return DateFormat(format).format(localDateTime);
      }

      // Default formatting with ordinal suffix
      final day = localDateTime.day;
      final suffix = _getDaySuffix(day);

      final dateFormat =
          showDaySuffix
              ? DateFormat("d'$suffix' MMM y")
              : DateFormat("d MMM y");
      final dateString = dateFormat.format(localDateTime);

      if (!showTime) return dateString;

      final timeFormat = DateFormat('h:mm a');
      final timeString = timeFormat.format(localDateTime);

      return '$dateString $timeString';
    } catch (e) {
      return 'Invalid date: ${dateInput.toString()}';
    }
  }

  static String _getDaySuffix(int day) {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  // is same month if iso parse date
  static bool isSameMonth(dynamic date1, dynamic date2) {
    DateTime parsedDate1;
    DateTime parsedDate2;

    if (date1 is DateTime) {
      parsedDate1 = date1;
    } else if (date1 is String) {
      parsedDate1 = DateTime.parse(date1);
    } else {
      return false;
    }

    if (date2 is DateTime) {
      parsedDate2 = date2;
    } else if (date2 is String) {
      parsedDate2 = DateTime.parse(date2);
    } else {
      return false;
    }
    return DateUtils.isSameMonth(parsedDate1, parsedDate2);
  }

  static Future<bool> requestStoragePermissions() async {
    // Check Android version
    if (Platform.isAndroid) {
      final androidInfo = await DeviceInfoPlugin().androidInfo;
      final sdkInt = androidInfo.version.sdkInt;

      if (sdkInt >= 33) {
        final statuses =
            await [
              Permission.photos,
              Permission.videos,
              Permission.audio,
            ].request();
        if (statuses[Permission.photos]!.isGranted &&
            statuses[Permission.videos]!.isGranted &&
            statuses[Permission.audio]!.isGranted) {
          return true;
        } else {
          if (statuses[Permission.photos]!.isPermanentlyDenied ||
              statuses[Permission.videos]!.isPermanentlyDenied ||
              statuses[Permission.audio]!.isPermanentlyDenied) {
            await openAppSettings();
          }
          return false;
        }
      } else {
        final status = await Permission.storage.request();
        if (status.isGranted) {
          return true;
        } else if (status.isPermanentlyDenied) {
          await openAppSettings();
          return false;
        } else {
          return false;
        }
      }
    }
    return true;
  }

  static Future<void> downloadFile(Uint8List bodyBytes, String fileName) async {
    try {
      if (Platform.isIOS) {
        final directory = await getTemporaryDirectory();
        final filePath = '${directory.path}/$fileName';
        final file = File(filePath);
        await file.writeAsBytes(bodyBytes);
        OpenFile.open(filePath);
      } else {
        final directory = await getExternalStorageDirectory();
        final filePath = '${directory?.path}/$fileName';
        final file = File(filePath);
        await file.writeAsBytes(bodyBytes);
        final result = await OpenFile.open(filePath);
        if (result.type != ResultType.done) {
          showToast(
            'Failed to open file: ${result.message}',
            backgroundColor: kErrorColor,
          );
        } else {
          showToast(
            'File downloaded and opened successfully',
            backgroundColor: kSuccessColor,
          );
        }
      }
    } catch (e) {
      showToast('Failed to download file: $e', backgroundColor: kErrorColor);
    }
  }
}
