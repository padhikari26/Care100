import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get/get.dart';
import 'package:oktoast/oktoast.dart';
import 'package:orgservice/env.dart';
import 'app/router/route.dart';
import 'app/theme/theme.dart';
import 'app/utils/constants.dart';
import 'app/utils/size_config.dart';
import 'core/controller/bloc/global/global_bloc.dart';
import 'core/controller/multi_bloc.dart';
import 'features/splash_screen.dart';

class InitApp extends StatelessWidget {
  const InitApp({super.key});

  @override
  Widget build(BuildContext context) {
    SizeConfig.init(context);
    return OKToast(
      backgroundColor: Colors.black,
      radius: 5,
      textPadding: const EdgeInsets.all(10),
      textStyle: const TextStyle(color: Colors.white, fontSize: 14),
      position: ToastPosition.bottom,
      duration: const Duration(seconds: 3),
      child: MultiBlocPro(
        child: BlocBuilder<GlobalBloc, GlobalState>(
          builder: (context, state) {
            return GetMaterialApp(
              navigatorKey: navKey,
              localizationsDelegates: [
                DefaultMaterialLocalizations.delegate,
                DefaultWidgetsLocalizations.delegate,
                DefaultCupertinoLocalizations.delegate,
              ],
              onGenerateRoute: AppRoute.onGenerateRoute,
              title: 'Org Sevices',
              debugShowCheckedModeBanner:
                  AppEnviro.enviroment == Enviroment.dev,
              theme: AppTheme.materialLightTheme(),
              home: const SplashScreen(),
            );
          },
        ),
      ),
    );
  }
}
