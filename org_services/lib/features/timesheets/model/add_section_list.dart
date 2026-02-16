class TimesheetAddSectionList {
  int? status;
  String? message;
  List<Works>? works;
  List<Clients>? clients;

  TimesheetAddSectionList({
    this.status,
    this.message,
    this.works,
    this.clients,
  });

  TimesheetAddSectionList.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    message = json['message'];
    if (json['works'] != null) {
      works = <Works>[];
      json['works'].forEach((v) {
        works!.add(Works.fromJson(v));
      });
    }
    if (json['clients'] != null) {
      clients = <Clients>[];
      json['clients'].forEach((v) {
        clients!.add(Clients.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['status'] = status;
    data['message'] = message;
    if (works != null) {
      data['works'] = works!.map((v) => v.toJson()).toList();
    }
    if (clients != null) {
      data['clients'] = clients!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Works {
  String? id;
  String? name;
  int? code;
  String? description;

  Works({this.id, this.name, this.code, this.description});

  Works.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    name = json['name'];
    code = json['code'];
    description = json['description'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    data['name'] = name;
    data['code'] = code;
    data['description'] = description;
    return data;
  }
}

class Clients {
  String? id;
  String? name;

  Clients({this.id, this.name});

  Clients.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    name = json['name'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    data['name'] = name;
    return data;
  }
}
