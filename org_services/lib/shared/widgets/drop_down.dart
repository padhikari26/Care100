import 'package:flutter/material.dart';
import 'package:orgservice/app/utils/size_config.dart';

class DropDownList extends StatelessWidget {
  const DropDownList({
    super.key,
    this.indexValue,
    this.hint = "",
    required this.list,
    this.onChange,
    this.borderColor = Colors.black,
    this.borderRadius = 5,
    this.dropDownColor,
    this.fillColor = Colors.white,
    this.textColor = Colors.black,
    this.iconEnableColor,
    this.fontWeight,
    this.hintTextColor = Colors.black54,
    this.isReq = false,
    this.validator,
    this.errH,
    this.vPad = 8,
    this.hPad = 0,
    this.isDense = true,
    this.fontSize = 16,
    this.sufIcon,
    this.itemHeight,
  });

  final int? indexValue;
  final String hint;
  final List<dynamic> list;
  final Function(int?)? onChange;
  final Color borderColor;
  final double borderRadius;
  //new added
  final Color? dropDownColor;
  final Color fillColor;
  final Color textColor;
  final Color hintTextColor;
  final Color? iconEnableColor;
  final FontWeight? fontWeight;
  final bool isReq;
  final String? Function(int?)? validator;
  final double? errH;
  final double vPad;
  final double hPad;
  final bool isDense;
  final double fontSize;
  final Widget? sufIcon;
  final double? itemHeight;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        DropdownButtonHideUnderline(
          child: ButtonTheme(
            alignedDropdown: true,
            child: DropdownButtonFormField<int>(
              iconSize: 24.fs,
              decoration: InputDecoration(
                fillColor: fillColor,
                filled: true,
                isDense: isDense,
                contentPadding: EdgeInsets.symmetric(
                  horizontal: hPad,
                  vertical: vPad,
                ),

                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: borderColor),
                  borderRadius: BorderRadius.circular(borderRadius),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: borderColor, width: 1.6),
                  borderRadius: BorderRadius.circular(borderRadius),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red.withOpacity(0.6),
                    width: 1.6,
                  ),
                  borderRadius: BorderRadius.circular(borderRadius),
                ),
                errorBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.red.withOpacity(0.6)),
                  borderRadius: BorderRadius.circular(borderRadius),
                ),
                errorStyle: TextStyle(fontSize: 13.fs, height: errH),
                errorMaxLines: 2,
                suffixIcon: sufIcon,
                suffixIconConstraints: BoxConstraints(minWidth: 40.fs),
              ),
              validator:
                  isReq
                      ? (validator ??
                          (val) {
                            if (val == null) {
                              if (errH != null && errH == 0)
                                return "";
                              else
                                return "Field is required";
                            } else
                              return null;
                          })
                      : (val) {
                        return null;
                      },
              isExpanded: true,
              iconEnabledColor: iconEnableColor,
              dropdownColor: dropDownColor,
              value:
                  (indexValue != null && indexValue! < 0) ? null : indexValue,
              style: TextStyle(
                fontSize: fontSize.fs,
                color: textColor,
                fontWeight: fontWeight,
              ),
              itemHeight: itemHeight,
              items:
                  list.map((item) {
                    final _value = list.indexWhere((e) => e == item);
                    return DropdownMenuItem<int>(
                      value: _value,
                      child:
                          item is String
                              ? Text(
                                item,
                                style: TextStyle(
                                  fontSize: fontSize.fs,
                                  color: textColor,
                                  fontWeight: fontWeight,
                                  height: 1.1,
                                ),
                                overflow: TextOverflow.visible,
                                maxLines: 2,
                              )
                              : item is Widget
                              ? item
                              : SizedBox.shrink(),
                    );
                  }).toList(),
              hint: Text(
                hint,
                style: TextStyle(fontSize: fontSize.fs, color: hintTextColor),
              ),
              onChanged: onChange,
            ),
          ),
        ),
      ],
    );
  }
}
