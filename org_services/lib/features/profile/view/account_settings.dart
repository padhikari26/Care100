import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:orgservice/features/profile/view/change_password.dart';

import '../../../shared/widgets/custom_page_scaffold.dart';
import '../../../shared/widgets/loading.dart';

class AccountSettingsPage extends StatefulWidget {
  const AccountSettingsPage({super.key});

  @override
  State<AccountSettingsPage> createState() => _AccountSettingsPageState();
}

class _AccountSettingsPageState extends State<AccountSettingsPage> {
  @override
  Widget build(BuildContext context) {
    return CustomPageScaffold(
      navigationBar: CupertinoNavigationBar(
        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(CupertinoIcons.back),
        ),
        middle: Text('Account Settings'),
      ),
      child: Processing(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
          child: Column(
            children: [
              CupertinoFormSection(
                backgroundColor: Colors.white,
                header: null,
                children: [
                  CupertinoFormRow(
                    prefix: Text('Change Password'),
                    child: CupertinoButton(
                      onPressed: () {
                        Get.to(() => ChangePassword());
                      },
                      child: Text('Change Password'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
