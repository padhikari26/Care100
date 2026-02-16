import 'dart:ui';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../features/auth/models/refresh_token_response.dart';
import 'db/db_data.dart';

class SharedPref {
  static const String _isAuthenticated = 'services_auth_user_434534';
  static const String _email = 'services_email_432424';
  static const String _accessTokenKey = 'services_access_token_543533';
  static const String _refreshTokenKey = 'services_refresh_token_534535';
  static const String _accessTokenExpiryKey =
      'services_access_token_expiry_125356';
  static const String _localeKey = 'services_locale_1243556';
  static const String _refreshTokenExpiryKey =
      'services_refresh_token_expiry_5345345';
  static const String _showOnboarding = 'services_show_onboarding_234234';

  // Onboarding status
  static Future<bool> get showOnboarding async {
    try {
      final pref = await SharedPreferences.getInstance();
      return pref.getBool(_showOnboarding) ?? true;
    } catch (e) {
      return true;
    }
  }

  static set setShowOnboarding(bool value) {
    SharedPreferences.getInstance().then(
      (pref) => pref.setBool(_showOnboarding, value),
    );
  }

  static Future<void> setAccessToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessTokenKey, token);
  }

  static Future<String?> get accessToken async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_accessTokenKey);
  }

  static Future<void> setRefreshToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_refreshTokenKey, token);
  }

  static Future<String?> get refreshToken async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_refreshTokenKey);
  }

  static Future<void> setAccessTokenExpiry(String expiry) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessTokenExpiryKey, expiry);
  }

  static Future<DateTime?> get accessTokenExpiry async {
    final prefs = await SharedPreferences.getInstance();
    final expiry = prefs.getString(_accessTokenExpiryKey);
    return expiry != null ? DateTime.parse(expiry) : null;
  }

  static Future<void> setRefreshTokenExpiry(String expiry) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_refreshTokenExpiryKey, expiry);
  }

  static Future<DateTime?> get refreshTokenExpiry async {
    final prefs = await SharedPreferences.getInstance();
    final expiry = prefs.getString(_refreshTokenExpiryKey);
    return expiry != null ? DateTime.parse(expiry) : null;
  }

  // Authentication status
  static Future<bool> get isAuth async {
    try {
      final pref = await SharedPreferences.getInstance();
      return pref.getBool(_isAuthenticated) ?? false;
    } catch (e) {
      return false;
    }
  }

  static set setAuth(bool value) {
    SharedPreferences.getInstance().then(
      (pref) => pref.setBool(_isAuthenticated, value),
    );
  }

  // Locale
  static Future<Locale?> get locale async {
    try {
      final pref = await SharedPreferences.getInstance();
      final localeString = pref.getString(_localeKey);
      if (localeString == null || localeString.isEmpty) return null;

      final parts = localeString.split('_');
      if (parts.length != 2) return null;

      return Locale(parts[0], parts[1]);
    } catch (e) {
      return null;
    }
  }

  static set setLocale(Locale locale) {
    try {
      final pref = SharedPreferences.getInstance();
      final localeString = '${locale.languageCode}_${locale.countryCode}';
      pref.then((prefs) => prefs.setString(_localeKey, localeString));
    } catch (e) {
      // error
    }
  }

  static void get clear => SharedPreferences.getInstance().then((pref) {
    for (final e in [
      _isAuthenticated,
      _email,
      _accessTokenKey,
      _refreshTokenKey,
      _accessTokenExpiryKey,
      _localeKey,
      _refreshTokenExpiryKey,
    ]) {
      pref.remove(e);
    }
  });

  static void get clearAll =>
      SharedPreferences.getInstance().then((pref) async {
        await DbLocalData.removeUserInfo();
        for (final e in [
          _isAuthenticated,
          _email,
          _accessTokenKey,
          _refreshTokenKey,
          _accessTokenExpiryKey,
          _localeKey,
          _refreshTokenExpiryKey,
        ]) {
          pref.remove(e);
        }
      });

  static Future<void> addRefreshTokenData(
    RefreshTokenResponse refreshResponse,
  ) async {
    setAccessToken(refreshResponse.data?.accessToken ?? "");
    setRefreshToken(refreshResponse.data?.refreshToken ?? "");
    setAccessTokenExpiry(refreshResponse.data?.accessTokenExpiresAt ?? "");
    setRefreshTokenExpiry(refreshResponse.data?.refreshTokenExpiresAt ?? "");
  }
}
