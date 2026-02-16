import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:orgservice/app/utils/size_config.dart';
import 'dart:async';
import 'screen_cltr.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  static const String routeName = '/splash';

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    await Future.wait([Future.delayed(const Duration(milliseconds: 3000))]);

    if (mounted) {
      // Navigator.of(context).pushReplacement(
      //   PageRouteBuilder(
      //     pageBuilder: (_, __, ___) => ScreenCltr(),
      //     transitionsBuilder:
      //         (_, a, __, c) => FadeTransition(
      //           opacity: CurvedAnimation(parent: a, curve: Curves.easeInOut),
      //           child: c,
      //         ),
      //     transitionDuration: const Duration(milliseconds: 500),
      //   ),
      // );
      Get.offAllNamed(ScreenCltr.routeName);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          // gradient: LinearGradient(
          //   begin: Alignment.topCenter,
          //   end: Alignment.bottomCenter,
          //   colors: [
          //     Color.fromARGB(255, 135, 168, 220),
          //     Color.fromARGB(255, 196, 205, 230),
          //   ],
          // ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.business, size: 100, color: Colors.blue),
              SizedBox(height: 10.hs),
              ShaderMask(
                shaderCallback:
                    (bounds) => LinearGradient(
                      begin: Alignment(
                        -1.1957,
                        0,
                      ), // -19.57% translated to normalized value
                      end: Alignment(
                        1.1667,
                        0,
                      ), // 116.67% translated to normalized value
                      colors: [
                        Color(0xFF3DA8D4), // #3DA8D4
                        Color(0xFFE6377B), // #E6377B
                        Color(0xFFFA9553), // #FA9553
                      ],
                      stops: [0.0, 0.3939, 1.0], // 0%, 39.39%, 100%
                    ).createShader(bounds),
                child: Text(
                  'Welcome to The Cares Now',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 20.fs,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
