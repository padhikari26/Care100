import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get/get.dart';
import 'package:orgservice/app/utils/size_config.dart';
import 'package:orgservice/features/auth/controllers/bloc/auth_bloc.dart';
import 'package:orgservice/features/profile/controller/bloc/profile_bloc.dart';
import 'package:orgservice/features/timesheets/controller/bloc/timesheet_bloc.dart';

import 'bloc/connectivity/connectivity_bloc.dart';
import 'bloc/global/global_bloc.dart';

class MultiBlocPro extends StatelessWidget {
  final Widget child;
  const MultiBlocPro({super.key, required this.child});

  static void reset(BuildContext context) {
    context.read<GlobalBloc>().add(GlobalAuthGetEvent());
    context.read<AuthBloc>().add(LoginInitialEvent());
    context.read<TimesheetBloc>().add(TimesheetInitialEvent());
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => ConnectivityBloc()..add(CheckConnectivity()),
        ),
        BlocProvider(
          create: (context) => GlobalBloc()..add(GlobalAuthGetEvent()),
        ),
        BlocProvider(create: (context) => AuthBloc()..add(LoginInitialEvent())),
        BlocProvider(
          create: (context) => TimesheetBloc()..add(TimesheetInitialEvent()),
        ),
        BlocProvider(
          create: (context) => ProfileBloc()..add(ProfileEventInit()),
        ),
      ],
      child: BlocListener<ConnectivityBloc, ConnectivityState>(
        listener: (context, state) {
          Get.closeAllSnackbars();
          if (state is ConnectivityConnected) {
            Get.closeAllSnackbars();
          } else if (state is ConnectivityDisconnected) {
            Get.closeAllSnackbars();
            Get.showSnackbar(
              GetSnackBar(
                animationDuration: Duration.zero,
                messageText: Text(
                  'Offline - No internet connection',
                  style: TextStyle(color: Colors.white, fontSize: 14.fs),
                ),
                icon: Icon(
                  CupertinoIcons.wifi_slash,
                  color: Colors.white,
                  size: 25.fs,
                ),
                duration: Duration(seconds: 3),
                backgroundColor: Colors.black,
                dismissDirection: DismissDirection.up,
                snackPosition: SnackPosition.TOP,
                margin: EdgeInsets.all(16),
                borderRadius: 10,
                padding: EdgeInsets.all(24),
                onTap: (value) {
                  Get.closeCurrentSnackbar();
                  Get.closeAllSnackbars();
                },
              ),
            );
          }
        },
        child: child,
      ),
    );
  }
}
