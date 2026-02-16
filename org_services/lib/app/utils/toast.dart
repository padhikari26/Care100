import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:oktoast/oktoast.dart';
import 'package:orgservice/app/theme/theme.dart';
import 'package:orgservice/app/utils/constants.dart';
import 'package:orgservice/app/utils/size_config.dart';

void showSuccessDiaglog({required String title, Function()? onOk}) {
  showCupertinoDialog(
    context: cusCtx ?? Get.context!,
    builder:
        (context) => CupertinoAlertDialog(
          title: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                CupertinoIcons.checkmark_circle_fill,
                color: kSuccessColor,
                size: 24,
              ),
              SizedBox(width: 0.8.hs),
              const Text('Success'),
            ],
          ),
          content: Text(title),
          actions: [
            CupertinoDialogAction(
              onPressed: () {
                Navigator.pop(context);
                onOk != null ? onOk() : null;
              },
              child: Text(
                'OK',
                style: TextStyle(
                  color: kPrimaryColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
  );
}

void showSuccessToast({
  required String message,
  Color? color,
  isTop = false,
  isCenter = false,
}) {
  showToast(
    message,
    duration: const Duration(seconds: 3),
    position:
        isTop
            ? ToastPosition(align: Alignment.topCenter)
            : isCenter
            ? const ToastPosition(align: Alignment.center)
            : const ToastPosition(align: Alignment.bottomCenter),
    dismissOtherToast: true,
    backgroundColor: color ?? Colors.green,
    textPadding: const EdgeInsets.all(10),
    textStyle: TextStyle(color: Colors.white, fontSize: 14.fs),
    textAlign: TextAlign.center,
    radius: 5,
    textDirection: TextDirection.ltr,
  );
}

void showFailureToast({
  String? message,
  Color? color,
  bool isTop = false,
  bool isCenter = false,
}) {
  final unAuthorized = message?.contains('Unauthorized') ?? false;
  if (unAuthorized) {
    message = 'Session expired, please login again';
    color = Colors.black;
  }
  showToast(
    message ?? 'Something went wrong',
    duration: const Duration(seconds: 3),

    position:
        isTop
            ? ToastPosition(align: Alignment.topCenter)
            : isCenter
            ? const ToastPosition(align: Alignment.center)
            : const ToastPosition(align: Alignment.bottomCenter),
    dismissOtherToast: true,
    backgroundColor: color ?? Colors.red,
    textPadding: const EdgeInsets.all(10),
    textAlign: TextAlign.center,
    textStyle: TextStyle(color: Colors.white, fontSize: 14.fs),
    radius: 5,
    textDirection: TextDirection.ltr,
  );
}
