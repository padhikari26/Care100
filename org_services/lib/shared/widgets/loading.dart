import 'package:flutter/material.dart';

class Processing extends StatefulWidget {
  final Widget child;
  final bool loading;
  final AlignmentGeometry align;
  final Color backColor;
  final Duration snackbarDuration;
  final bool givePadding;

  const Processing({
    super.key,
    required this.child,
    this.loading = false,
    this.align = Alignment.topCenter,
    this.givePadding = true,
    this.backColor = Colors.black12,
    this.snackbarDuration = const Duration(seconds: 4),
  });

  @override
  State<Processing> createState() => _ProcessingState();
}

class _ProcessingState extends State<Processing> {
  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        Align(alignment: widget.align, child: widget.child),
        if (widget.loading)
          SizedBox(
            width: 100,
            height: 100,
            child: Material(
              color: widget.backColor,
              elevation: 4,
              shadowColor: widget.backColor.withAlpha(40),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(child: Loading()),
            ),
          ),
      ],
    );
  }
}

class Loading extends StatelessWidget {
  const Loading({
    super.key,
    this.size = 30,
    this.color = Colors.white,
    this.strokeWidth = 2.5,
  });

  final double size;
  final Color color;
  final double strokeWidth;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        strokeWidth: strokeWidth,
        valueColor: AlwaysStoppedAnimation<Color>(color),
      ),
    );
  }
}
