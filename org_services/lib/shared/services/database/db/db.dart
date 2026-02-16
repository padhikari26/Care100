import 'package:sembast/sembast_io.dart';
// ignore: depend_on_referenced_packages
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart' as path_provider;

class DB {
  static DB? _db;

  DB._();

  static DB get instance {
    _db ??= DB._();
    return _db!;
  }

  static Database? _database;
  static StoreRef<int, Map<String, dynamic>>? _store;
  static const kDbFileName = 'services_73234.db';

  static Future<void> _initDB() async {
    final dbFolder = await path_provider.getApplicationDocumentsDirectory();
    final dbPath = join(dbFolder.path, kDbFileName);
    _database = await databaseFactoryIo.openDatabase(dbPath);
  }

  static Future<void> _setStore({required String? kDbTName}) async {
    // if (_database == null)
    await _initDB();
    _store = intMapStoreFactory.store(kDbTName);
  }

  Future<List<RecordSnapshot<int, Map<String, dynamic>>>> getDB({
    required String? kDbTName,
  }) async {
    await _setStore(kDbTName: kDbTName);
    final finder = Finder();
    final recordSnapShot = await _store!.find(_database!, finder: finder);
    // print(recordSnapShot);
    return recordSnapShot;
  }

  Future<int> addOnDB({
    required Map<String, dynamic> data,
    required String? kDbTName,
  }) async {
    await _setStore(kDbTName: kDbTName);
    final int id = await _store!.add(_database!, data);
    // print("insert with id : $id $kDbTName");
    return id;
  }

  // Future<void> distinctAddDB(
  //     {required  Map<String, dynamic> data, required String? kDbTName}) async {
  //   await _setStore(kDbTName: kDbTName);
  //   final finder =
  //       Finder(filter: Filter.equals("created_at", data['created_at']));
  //   final recordSnapshot = await _store!.find(_database!, finder: finder);
  //   if (recordSnapshot.isEmpty) {
  //     final int id = await _store!.add(_database!, data);
  //   // print("insert with id : $id");
  //   }
  // }

  // Future<int> updateDB(
  //     {required Map<String, dynamic> data, required String? kDbTName}) async {
  //   await _setStore(kDbTName: kDbTName);
  //   final int count = await _store!
  //       .update(_database!, data, finder: Finder(filter: Filter.byKey(data['id'])));
  //   // print("update with id : $count");
  //   return count;
  // }

  Future<int> deleteDB({
    required Map<String, dynamic> data,
    required String? kDbTName,
  }) async {
    await _setStore(kDbTName: kDbTName);
    final int count = await _store!.delete(
      _database!,
      finder: Finder(
        filter: Filter.byKey(data['id']),
        //  Filter.equals("id", data['id'])
      ),
    );
    // print("delete with id : $count");
    return count;
  }

  Future deleteAll({required String kDbTName}) async {
    await _setStore(kDbTName: kDbTName);
    // final int count =
    await _store!.delete(_database!);
    // print("delete with id : $count");
  }

  Future<bool> closeDB() async {
    final dbFolder = await path_provider.getApplicationDocumentsDirectory();
    final dbPath = join(dbFolder.path, kDbFileName);
    await databaseFactoryIo.deleteDatabase(dbPath);
    return true;
  }
}
