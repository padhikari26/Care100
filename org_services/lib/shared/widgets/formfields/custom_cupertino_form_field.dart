import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:orgservice/app/theme/theme.dart';
import 'package:orgservice/app/utils/size_config.dart';

class CupertinoFormField extends StatefulWidget {
  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final void Function(String?)? onChanged;
  final Widget? prefix;
  final Widget? suffix;
  final String? hintText;
  final String? labelText;
  final bool obscureText;
  final TextInputType? keyboardType;
  final bool? isFilled;
  final bool? isTinted;
  final Color? backgroundColor;
  final Color? borderColor;
  final double hPad;
  final bool isRequired;
  final double vPad;
  final bool isEnabled;
  final bool isReadOnly;
  final TextInputAction? textInputAction;
  final int maxLines;
  final bool showBorder;
  final Function(String)? onSubmitted;
  final int maxLength;
  final Widget? positionedSuffix;
  final Function? onTap;
  final double labelFontSize;
  final bool showUnderLinedBorder;
  final int minLines;
  final Color inputTextColor;
  final TextStyle? labelStyle;
  final TextStyle? inputStyle;
  final TextStyle? placeholderStyle;

  const CupertinoFormField({
    super.key,
    this.controller,
    this.validator,
    this.onChanged,
    this.prefix,
    this.suffix,
    this.hintText,
    this.labelText,
    this.obscureText = false,
    this.keyboardType,
    this.isFilled = false,
    this.isTinted = false,
    this.backgroundColor,
    this.hPad = 3,
    this.vPad = 1.6,
    this.isRequired = true,
    this.isEnabled = true,
    this.isReadOnly = false,
    this.showBorder = true,
    this.borderColor,
    this.textInputAction,
    this.maxLines = 1,
    this.minLines = 1,
    this.onSubmitted,
    this.maxLength = 100000,
    this.positionedSuffix,
    this.onTap,
    this.labelFontSize = 14,
    this.showUnderLinedBorder = false,
    this.inputTextColor = Colors.black,
    this.labelStyle,
    this.inputStyle,
    this.placeholderStyle,
  });

  @override
  State<CupertinoFormField> createState() => CupertinoFormFieldState();
}

class CupertinoFormFieldState extends State<CupertinoFormField> {
  String? _errorText;
  bool _touched = false;
  late FocusNode _focusNode;
  CupertinoFormState? _formState;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _formState = CupertinoForm.of(context);
    if (_formState != null && !_formState!._fields.contains(this)) {
      _formState!.register(this);
    }
  }

  @override
  void initState() {
    super.initState();
    _focusNode = FocusNode();
    _focusNode.addListener(_handleFocusChange);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_handleFocusChange);
    _focusNode.dispose();
    _formState?.unregister(this);
    super.dispose();
  }

  void _handleFocusChange() {
    if (!_focusNode.hasFocus && _touched && !widget.isReadOnly) {
      validate();
    } else if (_focusNode.hasFocus) {
      setState(() => _touched = true);
    }
  }

  String? validate() {
    if (!widget.isRequired && (widget.controller?.text.isEmpty ?? true)) {
      setState(() => _errorText = null);
      return null;
    }

    final value = widget.controller?.text;
    final error = widget.validator?.call(value);
    setState(() => _errorText = error);
    return error;
  }

  void _validate(String value) {
    if (!widget.isRequired && value.isEmpty) {
      setState(() => _errorText = null);
      return;
    }

    setState(() {
      _errorText = widget.validator?.call(value);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        if (widget.labelText != null)
          Padding(
            padding: EdgeInsets.only(
              bottom: widget.showUnderLinedBorder ? 0.0 : 4,
            ),
            child: Row(
              children: [
                Text(
                  widget.labelText!,
                  style:
                      widget.labelStyle ??
                      context.bodyLarge?.copyWith(
                        fontSize: widget.labelFontSize.fs,
                      ),
                ),
              ],
            ),
          ),
        Container(
          decoration:
              widget.showUnderLinedBorder
                  ? BoxDecoration(
                    border: Border(
                      bottom: BorderSide(
                        color:
                            _errorText != null
                                ? Colors.red.withAlpha(60)
                                : widget.borderColor ??
                                    (widget.isTinted!
                                        ? widget.backgroundColor ?? Colors.blue
                                        : Colors.grey[200]!),
                        width: _errorText != null ? 1.5 : 1.0,
                      ),
                    ),
                  )
                  : BoxDecoration(
                    color:
                        widget.isFilled!
                            ? widget.backgroundColor
                            : Colors.grey[200],
                    border:
                        widget.showBorder
                            ? Border.all(
                              color:
                                  _errorText != null
                                      ? Colors.red
                                      : widget.borderColor ??
                                          (widget.isTinted!
                                              ? widget.backgroundColor ??
                                                  Colors.blue
                                              : Colors.grey[200]!),
                              width: _errorText != null ? 1.5 : 1.0,
                            )
                            : null,
                    borderRadius: BorderRadius.circular(12),
                  ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CupertinoTextField(
                style:
                    widget.inputStyle ??
                    context.bodySmall?.copyWith(
                      color:
                          widget.isReadOnly
                              ? Colors.grey[600]
                              : widget.inputTextColor,
                    ),
                textAlignVertical: TextAlignVertical.top,
                textAlign: TextAlign.start,
                maxLength: widget.maxLength,
                maxLines: widget.maxLines,
                readOnly: widget.isReadOnly,
                minLines: widget.minLines,
                enabled: widget.isEnabled,
                textInputAction: widget.textInputAction,
                focusNode: _focusNode,
                controller: widget.controller,
                obscureText: widget.obscureText,
                keyboardType: widget.keyboardType,
                prefix: widget.prefix,
                suffix:
                    widget.suffix != null
                        ? Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: widget.suffix,
                        )
                        : null,
                placeholder: widget.hintText,
                placeholderStyle:
                    widget.placeholderStyle ??
                    context.bodySmall?.copyWith(
                      color: Colors.grey[600],
                      fontSize: 14.fs,
                    ),

                padding: EdgeInsets.symmetric(
                  horizontal: widget.hPad.ws,
                  vertical: widget.vPad.hs,
                ),
                decoration:
                    const BoxDecoration(), // No additional decoration here
                onTap: () {
                  if (!widget.isReadOnly) {
                    setState(() => _touched = true);
                  }
                  widget.onTap?.call();
                },
                onChanged: (value) {
                  if (_touched && widget.validator != null) {
                    _validate(value);
                  }
                  widget.onChanged?.call(value);
                },
                onSubmitted: (_) {
                  setState(() => _touched = true);
                  validate();
                  widget.onSubmitted != null
                      ? widget.onSubmitted!(widget.controller?.text ?? "")
                      : null;
                },
              ),
              if (widget.positionedSuffix != null &&
                  widget.maxLines >= 1 &&
                  widget.minLines >= 1)
                Padding(
                  padding: const EdgeInsets.only(right: 8.0, bottom: 8.0),
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: widget.positionedSuffix!,
                  ),
                ),
            ],
          ),
        ),
        if (_errorText != null)
          Padding(
            padding: EdgeInsets.only(
              left: widget.showUnderLinedBorder ? 0 : 12.0,
              top: 4.0,
            ),
            child: Text(
              _errorText!,
              style: context.labelLarge?.copyWith(
                color: Colors.red[700],
                fontSize: 12.fs,
              ),
            ),
          ),
      ],
    );
  }
}

class CupertinoForm extends StatefulWidget {
  final Widget child;
  final GlobalKey<CupertinoFormState>? formKey;

  const CupertinoForm({super.key, required this.child, this.formKey});

  static CupertinoFormState? of(BuildContext context) {
    return context.findAncestorStateOfType<CupertinoFormState>();
  }

  @override
  State<CupertinoForm> createState() => CupertinoFormState();
}

class CupertinoFormState extends State<CupertinoForm> {
  final List<CupertinoFormFieldState> _fields = [];

  void register(CupertinoFormFieldState field) {
    _fields.add(field);
  }

  void unregister(CupertinoFormFieldState field) {
    _fields.remove(field);
  }

  @override
  void dispose() {
    _fields.clear();
    super.dispose();
  }

  bool validate() {
    bool isValid = true;
    for (final field in _fields) {
      if (field.widget.isRequired ||
          (field.widget.controller?.text.isNotEmpty ?? false)) {
        if (field.validate() != null) {
          isValid = false;
        }
      }
    }
    return isValid;
  }

  @override
  Widget build(BuildContext context) {
    return InheritedCupertinoForm(formState: this, child: widget.child);
  }
}

class InheritedCupertinoForm extends InheritedWidget {
  final CupertinoFormState formState;

  const InheritedCupertinoForm({
    super.key,
    required this.formState,
    required super.child,
  });

  static InheritedCupertinoForm? of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<InheritedCupertinoForm>();
  }

  @override
  bool updateShouldNotify(InheritedCupertinoForm oldWidget) {
    return formState != oldWidget.formState;
  }
}
