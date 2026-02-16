import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:orgservice/app/utils/size_config.dart';

import '../../../app/theme/theme.dart';

class CustomButtonDefaults {
  static const double height = 42;
  static const double? width = null;
  static const double fontSize = 15;
  static const double borderRadius = 8;
  static const double hPad = 5;
  static const double iconSize = 20;
  static const double gapBetweenIconAndText = 2;
  static const FontWeight fontWeight = FontWeight.w600;
  static const bool isLoading = false;
}

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;
  final Color? backgroundColor;
  final Color? textColor;
  final double? width;
  final double height;
  final double fontSize;
  final double hPad;
  final double borderRadius;
  final IconData? icon;
  final double iconSize;
  final double gapBetweenIconAndText;
  final Color? borderColor;
  final FontWeight fontWeight;
  final Color? iconColor;
  final bool _isTinted;
  final bool _isFilled;

  // Default constructor
  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.borderColor,
    this.textColor,
    this.width = CustomButtonDefaults.width,
    this.height = CustomButtonDefaults.height,
    this.fontSize = CustomButtonDefaults.fontSize,
    this.borderRadius = CustomButtonDefaults.borderRadius,
    this.hPad = CustomButtonDefaults.hPad,
    this.icon,
    this.iconSize = CustomButtonDefaults.iconSize,
    this.gapBetweenIconAndText = CustomButtonDefaults.gapBetweenIconAndText,
    this.fontWeight = CustomButtonDefaults.fontWeight,
    this.iconColor,
  }) : _isTinted = false,
       _isFilled = false,
       backgroundColor = null;

  // Tinted constructor
  const CustomButton.tinted({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.textColor,
    this.width = CustomButtonDefaults.width,
    this.height = CustomButtonDefaults.height,
    this.fontSize = CustomButtonDefaults.fontSize,
    this.borderRadius = CustomButtonDefaults.borderRadius,
    this.hPad = CustomButtonDefaults.hPad,
    this.icon,
    this.iconSize = CustomButtonDefaults.iconSize,
    this.gapBetweenIconAndText = CustomButtonDefaults.gapBetweenIconAndText,
    this.fontWeight = CustomButtonDefaults.fontWeight,
    this.iconColor,
    this.borderColor,
  }) : _isTinted = true,
       _isFilled = false,
       backgroundColor = null;

  const CustomButton.filled({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.backgroundColor,
    this.textColor,
    this.width = CustomButtonDefaults.width,
    this.height = CustomButtonDefaults.height,
    this.fontSize = CustomButtonDefaults.fontSize,
    this.borderRadius = CustomButtonDefaults.borderRadius,
    this.hPad = CustomButtonDefaults.hPad,
    this.icon,
    this.iconSize = CustomButtonDefaults.iconSize,
    this.gapBetweenIconAndText = CustomButtonDefaults.gapBetweenIconAndText,
    this.fontWeight = CustomButtonDefaults.fontWeight,
    this.iconColor,
  }) : _isTinted = false,
       _isFilled = true,
       borderColor = null;

  @override
  Widget build(BuildContext context) {
    final content = _buildButtonContent(context);

    return SizedBox(
      width: width?.sws,
      height: height.shs,
      child:
          _isTinted
              ? _buildTintedButton(context, content)
              : _isFilled
              ? _buildFilledButton(context, content)
              : _buildDefaultButton(context, content),
    );
  }

  Widget _buildDefaultButton(BuildContext context, Widget content) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(color: borderColor ?? kPrimaryColor),
      ),
      child: CupertinoButton(
        onPressed: isLoading ? null : onPressed,
        borderRadius: BorderRadius.circular(borderRadius),
        padding: EdgeInsets.symmetric(horizontal: hPad.ws),
        child:
            isLoading
                ? CupertinoActivityIndicator(color: kPrimaryColor)
                : content,
      ),
    );
  }

  Widget _buildTintedButton(BuildContext context, Widget content) {
    return CupertinoButton.tinted(
      sizeStyle: CupertinoButtonSize.small,
      onPressed: isLoading ? null : onPressed,
      borderRadius: BorderRadius.circular(borderRadius),
      padding: EdgeInsets.symmetric(horizontal: hPad.ws),
      child:
          isLoading
              ? CupertinoActivityIndicator(
                color: Theme.of(context).primaryColor,
              )
              : content,
    );
  }

  Widget _buildFilledButton(BuildContext context, Widget content) {
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? kPrimaryColor,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      child: CupertinoButton(
        onPressed: isLoading ? null : onPressed,
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(borderRadius),
        padding: EdgeInsets.symmetric(horizontal: hPad.ws),
        child:
            isLoading
                ? CupertinoActivityIndicator(color: Colors.white)
                : content,
      ),
    );
  }

  Widget _buildButtonContent(BuildContext context) {
    if (icon == null) {
      return Text(
        text,
        style: TextStyle(
          color: textColor ?? (_isFilled ? Colors.white : kPrimaryColor),
          fontSize: fontSize.fs,
          fontWeight: fontWeight,
        ),
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: iconSize,
          color:
              iconColor ??
              (_isTinted ? Theme.of(context).primaryColor : Colors.white),
        ),
        SizedBox(width: gapBetweenIconAndText.ws),
        Text(
          text,
          style: TextStyle(
            color:
                textColor ??
                (_isTinted ? Theme.of(context).primaryColor : Colors.white),
            fontSize: fontSize.fs,
            fontWeight: fontWeight,
          ),
        ),
      ],
    );
  }
}
