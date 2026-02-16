class AllTimesheetModel {
  int? status;
  String? message;
  List<Timesheet>? timesheets;

  AllTimesheetModel({this.status, this.message, this.timesheets});

  AllTimesheetModel.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    message = json['message'];
    if (json['timesheets'] != null) {
      timesheets = <Timesheet>[];
      json['timesheets'].forEach((v) {
        timesheets!.add(Timesheet.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> timesheets = <String, dynamic>{};
    timesheets['status'] = status;
    timesheets['message'] = message;
    if (this.timesheets != null) {
      timesheets['timesheets'] =
          this.timesheets!.map((v) => v.toJson()).toList();
    }

    return timesheets;
  }
}

class Timesheet {
  String? clockIn;
  String? clockOut;
  String? createdAt;
  String? updatedAt;
  String? id;
  String? employeeId;
  String? clientId;
  String? date;
  String? clientSignature;
  List<CompletedWorks>? completedWorks;
  String? reason;
  String? gps;
  Employee? employee;
  Client? client;

  Timesheet({
    this.clockIn,
    this.clockOut,
    this.createdAt,
    this.updatedAt,
    this.id,
    this.employeeId,
    this.clientId,
    this.date,
    this.clientSignature,
    this.completedWorks,
    this.reason,
    this.gps,
    this.employee,
    this.client,
  });

  Timesheet.fromJson(Map<String, dynamic> json) {
    clockIn = json['clockIn'];
    clockOut = json['clockOut'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    id = json['id'];
    employeeId = json['employeeId'];
    clientId = json['clientId'];
    date = json['date'];
    clientSignature = json['clientSignature'];
    if (json['completedWorks'] != null) {
      completedWorks = <CompletedWorks>[];
      json['completedWorks'].forEach((v) {
        completedWorks!.add(CompletedWorks.fromJson(v));
      });
    }
    reason = json['reason'];
    gps = json['gps'];
    employee =
        json['Employee'] != null ? Employee.fromJson(json['Employee']) : null;
    client = json['Client'] != null ? Client.fromJson(json['Client']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> timesheets = <String, dynamic>{};
    timesheets['clockIn'] = clockIn;
    timesheets['clockOut'] = clockOut;
    timesheets['createdAt'] = createdAt;
    timesheets['updatedAt'] = updatedAt;
    timesheets['id'] = id;
    timesheets['employeeId'] = employeeId;
    timesheets['clientId'] = clientId;
    timesheets['date'] = date;
    timesheets['clientSignature'] = clientSignature;
    if (completedWorks != null) {
      timesheets['completedWorks'] =
          completedWorks!.map((v) => v.toJson()).toList();
    }
    timesheets['reason'] = reason;
    timesheets['gps'] = gps;
    if (employee != null) {
      timesheets['Employee'] = employee!.toJson();
    }
    if (client != null) {
      timesheets['Client'] = client!.toJson();
    }
    return timesheets;
  }
}

class CompletedWorks {
  int? code;
  String? workId;
  bool? completed;

  CompletedWorks({this.code, this.workId, this.completed});

  CompletedWorks.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    workId = json['workId'];
    completed = json['completed'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> timesheets = <String, dynamic>{};
    timesheets['code'] = code;
    timesheets['workId'] = workId;
    timesheets['completed'] = completed;
    return timesheets;
  }
}

class Employee {
  String? name;
  String? orgId;

  Employee({this.name, this.orgId});

  Employee.fromJson(Map<String, dynamic> json) {
    name = json['name'];
    orgId = json['orgId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> timesheets = <String, dynamic>{};
    timesheets['name'] = name;
    timesheets['orgId'] = orgId;
    return timesheets;
  }
}

class Client {
  String? name;

  Client({this.name});

  Client.fromJson(Map<String, dynamic> json) {
    name = json['name'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> timesheets = <String, dynamic>{};
    timesheets['name'] = name;
    return timesheets;
  }
}
