import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:orgservice/features/auth/view/register.dart';
import '../../features/screen_cltr.dart';
import '../../features/splash_screen.dart';

class AppRoute {
  static Route onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case SplashScreen.routeName:
        return _route(SplashScreen());
      case ScreenCltr.routeName:
        return _route(ScreenCltr());
      case RegisterPage.routeName:
        return _route(RegisterPage());
      default:
        return _route(_errorRoute());
    }
  }

  static Route _route(Widget page) {
    return GetPageRoute(
      customTransition: FadePageTransition(),
      transitionDuration: Duration(milliseconds: 300),
      page: () {
        return page;
      },
    );
  }

  static Widget _errorRoute() {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Error Screen",
          style: TextStyle(color: Colors.black),
        ),
        elevation: 0.1,
      ),
      body: const Center(
        child: Text(
          "Page Not Found",
          style: TextStyle(color: Colors.black, fontSize: 18),
        ),
      ),
    );
  }
}

class FadePageTransition extends CustomTransition {
  @override
  Widget buildTransition(
    BuildContext context,
    Curve? curve,
    Alignment? alignment,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(opacity: animation, child: child);
  }
}
