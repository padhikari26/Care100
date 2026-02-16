//custom scaffold

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:orgservice/app/utils/size_config.dart';
import 'package:orgservice/shared/widgets/loading.dart';

class CustomScaffold extends StatelessWidget {
  final Widget body;
  final String title;
  final bool showBackButton;
  final bool showAppBar;
  final Color? backgroundColor;
  final Widget? floatingActionButton;
  final bool isLoading;
  final PreferredSizeWidget? appBar;
  final Function()? onAppBarBack;
  final double titleSize;
  final double? appBarHeight;
  final Color? appBarColor;
  final Widget? bottomNavigationBar;
  final Widget? actions;
  final Widget? drawer;
  final GlobalKey<ScaffoldState>? scaffoldKey;

  const CustomScaffold({
    super.key,
    required this.body,
    this.title = '',
    this.showBackButton = false,
    this.showAppBar = false,
    this.backgroundColor,
    this.floatingActionButton,
    this.isLoading = false,
    this.appBar,
    this.onAppBarBack,
    this.titleSize = 20,
    this.appBarHeight,
    this.appBarColor,
    this.bottomNavigationBar,
    this.actions,
    this.drawer,
    this.scaffoldKey,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: backgroundColor ?? Colors.white,
        drawer: drawer,
        appBar:
            showAppBar
                ? appBar ??
                    CupertinoNavigationBar(
                      automaticallyImplyLeading: false,
                      backgroundColor: backgroundColor ?? Colors.white,
                      middle: Text(
                        title,
                        style: TextStyle(
                          color: appBarColor ?? Colors.black,
                          fontSize: titleSize.fs,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      trailing: actions,
                      leading:
                          showBackButton
                              ? IconButton(
                                icon: const Icon(Icons.arrow_back),
                                onPressed: () {
                                  if (onAppBarBack != null) {
                                    onAppBarBack!();
                                  } else {
                                    Navigator.of(context).pop();
                                  }
                                },
                              )
                              : null,
                    )
                : null,
        body: Processing(givePadding: false, loading: isLoading, child: body),
        floatingActionButton: floatingActionButton,
        bottomNavigationBar: bottomNavigationBar,
      ),
    );
  }
}
