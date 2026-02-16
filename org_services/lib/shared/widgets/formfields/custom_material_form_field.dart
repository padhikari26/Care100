import 'package:flutter/material.dart';
import 'package:orgservice/app/utils/size_config.dart';

class CustomMaterialTextFormField extends StatelessWidget {
  final bool obscureText;
  final Icon? suffixIcon;
  final String? Function(String?)? validator;
  final String? initialValue;
  final String? labelText;
  final String? helperText;
  final String? counterText;
  final String? hintText;
  final Widget? prefix;
  final Widget? suffix;
  final Widget? prefixIcon;
  final bool readOnly;
  final bool enabled;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final TextStyle? style;
  final TextAlign? textAlign;
  final TextEditingController controller;
  final double hPad;
  final double vPad;
  final int? maxLines;
  final bool? isFilled;
  final bool? isTinted;
  final Color? backgroundColor;
  final void Function(String)? onChanged;
  final void Function(String)? onSubmitted;

  const CustomMaterialTextFormField({
    super.key,
    this.obscureText = false,
    this.suffixIcon,
    required this.hintText,
    this.prefix,
    this.suffix,
    this.prefixIcon,
    this.validator,
    this.initialValue,
    this.labelText,
    this.helperText,
    this.counterText,
    this.readOnly = false,
    this.enabled = true,
    this.keyboardType,
    this.textInputAction,
    this.style,
    this.textAlign,
    required this.controller,
    this.hPad = 3,
    this.vPad = 1.6,
    this.maxLines = 1,
    this.isFilled = true,
    this.isTinted = false,
    this.backgroundColor,
    this.onChanged,
    this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    final borderRadius = BorderRadius.circular(12);
    final fillColor =
        isFilled!
            ? (isTinted!
                ? backgroundColor ?? Colors.grey[100]
                : Colors.grey[200])
            : Colors.transparent;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (labelText != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 4.0),
            child: Text(
              labelText!,
              style: TextStyle(color: Colors.grey[700], fontSize: 14.fs),
            ),
          ),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          readOnly: readOnly,
          enabled: enabled,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          style: style,
          textAlign: textAlign ?? TextAlign.start,
          maxLines: maxLines,
          validator: validator,
          onChanged: onChanged,
          onFieldSubmitted: onSubmitted,
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: TextStyle(color: Colors.grey[600], fontSize: 14.fs),
            helperText: helperText,
            counterText: counterText,
            prefix: prefix,
            suffix: suffix,
            prefixIcon: prefixIcon,
            suffixIcon: suffixIcon,
            filled: isFilled,
            fillColor: fillColor,
            contentPadding: EdgeInsets.symmetric(
              horizontal: hPad.ws,
              vertical: vPad.hs,
            ),
            border: OutlineInputBorder(
              borderRadius: borderRadius,
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: borderRadius,
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: borderRadius,
              borderSide: BorderSide(color: Colors.blueAccent, width: 1.2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: borderRadius,
              borderSide: BorderSide(color: Colors.red, width: 1.4),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: borderRadius,
              borderSide: BorderSide(color: Colors.red, width: 1.4),
            ),
          ),
        ),
      ],
    );
  }
}
