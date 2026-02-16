import 'package:flutter/material.dart';

final GlobalKey<NavigatorState> navKey = GlobalKey<NavigatorState>();

// BuildContext? _buildContext;

BuildContext? get cusCtx => navKey.currentContext;
