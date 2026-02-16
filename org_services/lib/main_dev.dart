import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app/utils/dependencies.dart';
import 'init_app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  setupDependencies(isProduction: true);
  runApp(const InitApp());
}
