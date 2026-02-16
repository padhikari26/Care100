import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get/get.dart';
import 'package:orgservice/app/theme/theme.dart';
import 'package:orgservice/app/utils/size_config.dart';
import '../../../app/utils/custom_validators.dart';
import '../../../core/controller/bloc/global/global_bloc.dart';
import '../../../shared/widgets/button/custom_button.dart';
import '../../../shared/widgets/custom_scaffold.dart';
import '../../../shared/widgets/formfields/custom_cupertino_form_field.dart';
import '../controllers/bloc/auth_bloc.dart';
import 'com/auth_titles.dart';
import 'com/error_container.dart';
import 'register.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  static const String routeName = '/login';

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late AuthBloc authBloc;
  final _formKey = GlobalKey<CupertinoFormState>();

  @override
  void initState() {
    super.initState();
    authBloc = context.read<AuthBloc>();
    authBloc.add(const LoginInitialEvent());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        final showBiometricLogin = globalBloc.state.showBiometricLogin ?? false;
        return CustomScaffold(
          isLoading: state.isLoading,
          backgroundColor: Colors.white,
          body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: SingleChildScrollView(
                child: CupertinoForm(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: 4.hs),
                      SizedBox(height: 20.fs),
                      AuthScreenTitle(
                        title: showBiometricLogin ? 'Sign In' : 'Hello There',
                        subTitle: "",
                      ),
                      SizedBox(height: 1.hs),
                      if (!showBiometricLogin)
                        Text(
                          'Please enter your employee code to log in',
                          textAlign: TextAlign.start,
                          style: context.bodySmall?.copyWith(),
                        ),
                      state.errorMessage?.isNotEmpty ?? false
                          ? ErrorContainer(
                            errorMessage: state.errorMessage ?? '',
                          )
                          : SizedBox(height: 4.hs),
                      buildNewLoginField(
                        authBloc: authBloc,
                        globalBloc: globalBloc,
                        state: state,
                      ),
                      SizedBox(height: 2.hs),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget buildNewLoginField({
    required AuthBloc authBloc,
    required GlobalBloc globalBloc,
    required AuthState state,
  }) {
    return Column(
      children: [
        CupertinoFormField(
          labelFontSize: smallFsF(1),
          hPad: 0,
          showUnderLinedBorder: true,
          isFilled: false,
          showBorder: false,
          labelText: 'Employee Code',
          vPad: 1.5,
          borderColor: Colors.black12,
          validator:
              (value) => Validator.nullValidate(value: value!, title: 'Code'),
          controller: state.passwordController,
        ),
        SizedBox(height: 6.hs),
        CustomButton.filled(
          isLoading: state.isLoading,
          backgroundColor: kPrimaryColor,
          borderRadius: 30,
          width: 80.ws,
          height: 45,
          text: "Log In",
          fontSize: mediumFsF(1),
          onPressed: () {
            FocusScope.of(context).unfocus();
            authBloc.add(ClearErrorEvent());

            if (_formKey.currentState?.validate() ?? false) {
              authBloc.add(LoginSubmitEvent());
            }
          },
        ),
        SizedBox(height: 2.hs),
        Center(
          child: FittedBox(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "Don't have an account?",
                  style: context.bodySmall?.copyWith(color: kTextColor),
                ),
                TextButton(
                  onPressed: () {
                    FocusScope.of(context).unfocus();
                    authBloc.add(LoginInitialEvent());
                    authBloc.add(GetAuthAddSectionListEvent());
                    Get.toNamed(RegisterPage.routeName);
                  },
                  child: Text(
                    "Sign Up",
                    style: context.bodySmall?.copyWith(color: kErrorColor),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
