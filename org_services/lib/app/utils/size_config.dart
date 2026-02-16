import 'package:flutter/widgets.dart';

class SizeConfig {
  static late MediaQueryData _mediaQueryData;
  static late double screenWidth;
  static late double screenHeight;
  static late double blockSizeHorizontal;
  static late double blockSizeVertical;

  static late double _safeAreaHorizontal;
  static late double _safeAreaVertical;
  static late double safeBlockHorizontal;
  static late double safeBlockVertical;

  static late double textScaleFactor;
  static late bool isPortrait;
  static late bool isTablet;
  static late bool isSmallPhone;

  static void init(BuildContext context) {
    _mediaQueryData = MediaQuery.of(context);
    screenWidth = _mediaQueryData.size.width;
    screenHeight = _mediaQueryData.size.height;
    textScaleFactor = _mediaQueryData.textScaleFactor;
    isPortrait = screenWidth < screenHeight;
    isTablet = screenWidth >= 600; // Typical tablet breakpoint
    isSmallPhone = screenWidth < 375; // iPhone SE and similar small devices

    // Use shortest side for better square-ish reference

    blockSizeHorizontal = screenWidth / 100;
    blockSizeVertical = screenHeight / 100;

    _safeAreaHorizontal =
        _mediaQueryData.padding.left + _mediaQueryData.padding.right;
    _safeAreaVertical =
        _mediaQueryData.padding.top + _mediaQueryData.padding.bottom;
    safeBlockHorizontal = (screenWidth - _safeAreaHorizontal) / 100;
    safeBlockVertical = (screenHeight - _safeAreaVertical) / 100;
  }

  // Scale width based on design width (375 is standard iPhone 11 width)
  static double scaleWidth(double width) {
    final scaleFactor = screenWidth / 375.0;
    // Limit scaling for very large screens
    return width * scaleFactor.clamp(1.0, isTablet ? 1.5 : 1.3);
  }

  // Scale height based on design height (812 is standard iPhone 11 height)
  static double scaleHeight(double height) {
    final scaleFactor = screenHeight / 812.0;
    // Less aggressive scaling for height to maintain proportions
    return height * scaleFactor.clamp(1.0, isTablet ? 1.4 : 1.2);
  }

  // Smart text sizing that considers both width and height
  static double textSize(double size) {
    final widthFactor = screenWidth / 375.0;
    final heightFactor = screenHeight / 812.0;
    // Average the factors but give more weight to width for text
    final scaleFactor = (widthFactor * 0.7 + heightFactor * 0.3);

    // Apply additional constraints
    return size *
        scaleFactor.clamp(isSmallPhone ? 0.9 : 1.0, isTablet ? 1.4 : 1.2) *
        textScaleFactor.clamp(1.0, 1.3); // Respect user preference but limit
  }
}

double get vSmallFs => 11.fs;
double get smallFs => 13.fs;
double get mediumFs => 16.fs;
double get largeFs => 19.fs;
double get xLargeFs => 21.fs;
double get xxLargeFs => 26.fs;

double vSmallFsF(double hs) => 11.fs + hs;
double smallFsF(double hs) => 13.fs + hs;
double mediumFsF(double hs) => 16.fs + hs;
double largeFsF(double hs) => 19.fs + hs;
double xLargeFsF(double hs) => 21.fs + hs;
double xxLargeFsF(double hs) => 26.fs + hs;

// Extension for numbers
extension SizeExtension on num {
  // Font size (scaled)
  double get fs => SizeConfig.textSize(toDouble());

  // Width scaling (percentage of screen width)
  double get ws => (toDouble() * SizeConfig.screenWidth) / 100;

  // Height scaling (percentage of screen height)
  double get hs => (toDouble() * SizeConfig.screenHeight) / 100;

  // Scaled width (based on design width)
  double get sws => SizeConfig.scaleWidth(toDouble());

  // Scaled height (based on design height)
  double get shs => SizeConfig.scaleHeight(toDouble());

  // Safe area width scaling
  double get swps => (toDouble() * SizeConfig.safeBlockHorizontal);

  // Safe area height scaling
  double get shps => (toDouble() * SizeConfig.safeBlockVertical);

  // For tablet-specific sizing (optional)
  double get ts =>
      SizeConfig.isTablet
          ? toDouble() *
              1.2 // 20% larger on tablets
          : toDouble();
}
