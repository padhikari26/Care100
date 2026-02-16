import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';

class DateFormatter {
  static String formatTime(DateTime dateTime) {
    return DateFormat('h:mm a').format(dateTime);
  }

  static String formatDate(DateTime dateTime) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = DateTime(now.year, now.month, now.day - 1);
    final dateToCheck = DateTime(dateTime.year, dateTime.month, dateTime.day);

    if (dateToCheck == today) {
      return 'Today';
    } else if (dateToCheck == yesterday) {
      return 'Yesterday';
    } else {
      return DateFormat('MMM d, yyyy').format(dateTime);
    }
  }

  static String formatChatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 0) {
      return formatDate(dateTime);
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  static String formatStringDate(String date) {
    if (date.isEmpty) {
      return "";
    }
    try {
      DateTime? parsedDate = DateTime.tryParse(date);
      if (parsedDate == null) {
        try {
          parsedDate = DateFormat('yyyy-MM-dd HH:mm:ss.SSS').parse(date);
        } catch (e) {
          parsedDate = DateFormat('yyyy-MM-dd').parse(date);
        }
      }
      return DateFormat('MMM d, yyyy').format(parsedDate);
    } catch (e) {
      debugPrint('Failed to parse date: $date, error: $e');
      return date;
    }
  }

  //show isodatestring to 29 dec 2024 - 09:41 AM

  // static String formatIsoDate(String date) {
  //   if (date.isEmpty) {
  //     return "";
  //   }
  //   try {
  //     DateTime? parsedDate = DateTime.tryParse(date);
  //     if (parsedDate == null) {
  //       try {
  //         parsedDate = DateFormat('yyyy-MM-dd HH:mm:ss.SSS').parse(date);
  //       } catch (e) {
  //         parsedDate = DateFormat('yyyy-MM-dd').parse(date);
  //       }
  //     }
  //     return DateFormat('dd MMM yyyy - hh:mm a').format(parsedDate);
  //   } catch (e) {
  //     debugPrint('Failed to parse date: $date, error: $e');
  //     return date;
  //   }
  // }
}
