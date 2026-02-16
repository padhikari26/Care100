import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class CustomPageScaffold extends StatelessWidget {
  final bool canPop;
  final Widget child;
  final ObstructingPreferredSizeWidget? navigationBar;
  final Color backgroundColor;
  final bool resizeToAvoidBottomInset;
  final bool removeBottomSafeArea;
  final Widget? floatingActionButton;
  final bool showBottomNavBar;
  final Widget? bottomNavigationBar;

  final bool removeSafeArea;

  const CustomPageScaffold({
    super.key,
    required this.child,
    this.navigationBar,
    this.backgroundColor = CupertinoColors.systemBackground,
    this.resizeToAvoidBottomInset = true,
    this.canPop = true,
    this.removeBottomSafeArea = false,
    this.removeSafeArea = false,
    this.showBottomNavBar = false,
    this.floatingActionButton,
    this.bottomNavigationBar,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: showBottomNavBar ? bottomNavigationBar : null,
      body: PopScope(
        canPop: canPop,
        child: GestureDetector(
          onTap: () {
            FocusScope.of(context).unfocus();
          },
          child: CupertinoPageScaffold(
            resizeToAvoidBottomInset: resizeToAvoidBottomInset,
            backgroundColor: backgroundColor,
            navigationBar: navigationBar,
            child:
                removeSafeArea
                    ? Material(color: backgroundColor, child: child)
                    : SafeArea(
                      bottom: !removeBottomSafeArea,
                      child: Material(color: backgroundColor, child: child),
                    ),
          ),
        ),
      ),
    );
  }
}
