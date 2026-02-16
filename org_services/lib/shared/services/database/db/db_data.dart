import '../../../../features/auth/models/login_response_model.dart';
import '../shared_pref.dart';
import 'db.dart';
part 'db_name.dart';

class DbLocalData {
  static final _db = DB.instance;

  ///[Login_Response] get Login Response from Local Database
  static Future<UserData> getUserInfo() async {
    final data = await _db.getDB(kDbTName: kDBUserInfo);
    var res = UserData();
    if (data.isNotEmpty) {
      try {
        res = UserData.fromJson(data.first.value);
      } catch (e) {
        // print('Error parsing user info: $e');
      }
    }
    return res;
  }

  //update user info
  static Future<void> updateUserInfo({
    LoginResponseModel? loginResponse,
    required UserData userInfo,
  }) async {
    await _db.deleteAll(kDbTName: kDBUserInfo);
    await _db.addOnDB(data: userInfo.toJson(), kDbTName: kDBUserInfo);
    if (loginResponse != null) {
      SharedPref.setAccessToken(loginResponse.token ?? '');
      // SharedPref.setRefreshToken(loginResponse.data?.refreshToken ?? '');
      // SharedPref.setAccessTokenExpiry(
      //   loginResponse.data?.accessTokenExpiresAt ?? '',
      // );
      // SharedPref.setRefreshTokenExpiry(
      //   loginResponse.data?.refreshTokenExpiresAt ?? '',
      // );
      SharedPref.setAuth = true;
    }
  }

  //remove user info
  static Future<void> removeUserInfo() async {
    await _db.deleteAll(kDbTName: kDBUserInfo);
    SharedPref.clear;
  }
}
