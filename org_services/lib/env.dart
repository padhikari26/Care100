// import 'package:pos_account/services/database/shared_pref.dart';

import 'core/network/api/api_constant.dart';

enum Enviroment { dev, prod }

abstract class AppEnviro {
  static late String baseUrl;
  static late String title;
  static late Enviroment _enviroment;
  static Enviroment get enviroment => _enviroment;

  static Future<void> setupEnv(Enviroment env) async {
    _enviroment = env;
    switch (env) {
      case Enviroment.dev:
        {
          baseUrl = APIPathHelper.baseUrlDev;
          title = 'Org DEV';
          break;
        }
      case Enviroment.prod:
        {
          baseUrl = APIPathHelper.baseUrlProd;
          title = 'Org PROD';
          break;
        }
    }
  }
}
