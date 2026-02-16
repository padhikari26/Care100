import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:orgservice/features/auth/view/login.dart';

import '../core/controller/bloc/global/global_bloc.dart';
import 'auth/view/base_page.dart';

class ScreenCltr extends StatefulWidget {
  static const String routeName = '/screen-cltr';
  const ScreenCltr({super.key});

  @override
  State<ScreenCltr> createState() => _ScreenCltrState();
}

class _ScreenCltrState extends State<ScreenCltr> {
  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: BlocBuilder<GlobalBloc, GlobalState>(
        buildWhen:
            (previous, current) => previous.authState != current.authState,
        builder: (context, state) {
          log(
            globalBloc.state.authState.toString(),
            name: 'ScreenCltr - Auth State',
          );
          return _buildMainContent(state.authState);
        },
      ),
    );
  }

  Widget _buildMainContent(LoginState? authState) {
    switch (authState) {
      case LoginState.authenticate:
        return const BasePage();
      case LoginState.unauthenticate:
        return const LoginScreen();
      default:
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
  }
}
