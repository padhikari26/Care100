import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:orgservice/app/utils/size_config.dart';

const Color kPrimaryColor = Color.fromARGB(255, 48, 84, 163);
const Color kSecondaryColor = Color(0xFF64748B);
const Color kAccentColor = Color(0xFF344955);
const Color kBackgroundColor = Color(0xFFF9FAFB);
const Color kTextColor = Color(0xFF000000);
const Color kErrorColor = Color(0xFFF44336);
const Color kSuccessColor = Color(0xFF15803D);
const Color kWarningColor = Colors.yellow;
const Color kInfoColor = Colors.blue;
const Color kDividerColor = CupertinoColors.systemGrey5;
const Color kDiaColor = Color(0xFFFFEFE5);
const Color kGreyColor = CupertinoColors.systemGrey5;
const Color kMondayColor = Color(0xFF3EB8F1);
Color kChatBoxColor = CupertinoColors.systemGrey.withAlpha(30);
const Color kJournalBackColor = Color(0xFFFFEEF3);
const Color kTileColor = Color(0xFFFAFAFA);
const Color kLightGreenColor = Color(0xFF29AC29);

class AppTheme {
  static ThemeData materialLightTheme() {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: Colors.white,
      colorScheme: ColorScheme.fromSeed(
        seedColor: kPrimaryColor,
        brightness: Brightness.light,
        primary: kPrimaryColor,
        surface: Colors.white,
      ),
      textTheme: GoogleFonts.robotoTextTheme().copyWith(
        displayLarge: GoogleFonts.roboto(
          fontSize: 57.fs,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.25,
        ),
        displayMedium: GoogleFonts.roboto(
          fontSize: 45.fs,
          fontWeight: FontWeight.w600,
        ),
        displaySmall: GoogleFonts.roboto(
          fontSize: 36.fs,
          fontWeight: FontWeight.w500,
        ),
        headlineLarge: GoogleFonts.roboto(
          fontSize: 32.fs,
          fontWeight: FontWeight.w700,
        ),
        headlineMedium: GoogleFonts.roboto(
          fontSize: 28.fs,
          fontWeight: FontWeight.w600,
        ),
        headlineSmall: GoogleFonts.roboto(
          fontSize: 24.fs,
          fontWeight: FontWeight.w600,
        ),
        titleLarge: GoogleFonts.roboto(
          fontSize: 22.fs,
          fontWeight: FontWeight.w800,
          height: 1.5,
        ),
        titleMedium: GoogleFonts.roboto(
          fontSize: 18.fs,
          fontWeight: FontWeight.w700,
          letterSpacing: 1,
          height: 1.5,
        ),
        titleSmall: GoogleFonts.roboto(
          fontSize: 16.fs,
          fontWeight: FontWeight.w700,
          height: 1.5,
        ),
        bodyLarge: GoogleFonts.roboto(
          fontSize: 16.fs,
          fontWeight: FontWeight.w600,
        ),
        bodyMedium: GoogleFonts.roboto(
          fontSize: 15.fs,
          fontWeight: FontWeight.w500,
        ),
        bodySmall: GoogleFonts.roboto(
          fontSize: 14.fs,
          fontWeight: FontWeight.w400,
          letterSpacing: 1,
        ),
        labelLarge: GoogleFonts.roboto(
          fontSize: 14.fs,
          fontWeight: FontWeight.w500,
        ),
        labelMedium: GoogleFonts.roboto(
          fontSize: 12.fs,
          fontWeight: FontWeight.w500,
        ),
        labelSmall: GoogleFonts.roboto(
          fontSize: 11.fs,
          fontWeight: FontWeight.w500,
        ),
      ),
      cupertinoOverrideTheme: CupertinoThemeData(
        scaffoldBackgroundColor: Colors.white,
        primaryColor: kPrimaryColor,
        brightness: Brightness.light,
        textTheme: CupertinoTextThemeData(
          primaryColor: kPrimaryColor,
          textStyle: GoogleFonts.roboto(
            fontSize: 15.fs,
            color: kTextColor,
            fontWeight: FontWeight.w400,
          ),
          navTitleTextStyle: GoogleFonts.roboto(
            fontSize: 17.fs,
            color: kTextColor,
            fontWeight: FontWeight.w700,
          ),
          tabLabelTextStyle: GoogleFonts.roboto(
            fontSize: 11.fs,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

extension TextThemeExtension on BuildContext {
  TextTheme get textTheme => Theme.of(this).textTheme;
  TextStyle? get displayLarge => textTheme.displayLarge;
  TextStyle? get displayMedium => textTheme.displayMedium;
  TextStyle? get displaySmall => textTheme.displaySmall;
  TextStyle? get headlineLarge => textTheme.headlineLarge;
  TextStyle? get headlineMedium => textTheme.headlineMedium;
  TextStyle? get headlineSmall => textTheme.headlineSmall;
  TextStyle? get titleLarge => textTheme.titleLarge;
  TextStyle? get titleMedium => textTheme.titleMedium;
  TextStyle? get titleSmall => textTheme.titleSmall;
  TextStyle? get bodyLarge => textTheme.bodyLarge;
  TextStyle? get bodyMedium => textTheme.bodyMedium;
  TextStyle? get bodySmall => textTheme.bodySmall;
  TextStyle? get labelLarge => textTheme.labelLarge;
  TextStyle? get labelMedium => textTheme.labelMedium;
  TextStyle? get labelSmall => textTheme.labelSmall;
}
