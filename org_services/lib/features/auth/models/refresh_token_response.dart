class RefreshTokenResponse {
  int? status;
  String? message;
  Data? data;
  String? timestamp;

  RefreshTokenResponse({this.status, this.message, this.data, this.timestamp});

  RefreshTokenResponse.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? Data.fromJson(json['data']) : null;
    timestamp = json['timestamp'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['status'] = status;
    data['message'] = message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    data['timestamp'] = timestamp;
    return data;
  }
}

class Data {
  String? accessToken;
  String? refreshToken;
  String? accessTokenExpiresAt;
  String? refreshTokenExpiresAt;

  Data({
    this.accessToken,
    this.refreshToken,
    this.accessTokenExpiresAt,
    this.refreshTokenExpiresAt,
  });

  Data.fromJson(Map<String, dynamic> json) {
    accessToken = json['accessToken'];
    refreshToken = json['refreshToken'];
    accessTokenExpiresAt = json['accessTokenExpiresAt'];
    refreshTokenExpiresAt = json['refreshTokenExpiresAt'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['accessToken'] = accessToken;
    data['refreshToken'] = refreshToken;
    data['accessTokenExpiresAt'] = accessTokenExpiresAt;
    data['refreshTokenExpiresAt'] = refreshTokenExpiresAt;
    return data;
  }
}
