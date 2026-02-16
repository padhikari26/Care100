import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:orgservice/features/profile/view/profile_screen.dart';
import 'package:orgservice/shared/widgets/custom_page_scaffold.dart';

import '../../profile/controller/bloc/profile_bloc.dart';
import '../../timesheets/view/timesheet_screen.dart';

class BasePage extends StatefulWidget {
  const BasePage({super.key});

  @override
  State<BasePage> createState() => _BasePageState();
}

class _BasePageState extends State<BasePage> {
  int currentIndex = 0;
  @override
  void initState() {
    super.initState();
    BlocProvider.of<ProfileBloc>(context).add(ProfileEventInit());
    BlocProvider.of<ProfileBloc>(context).add(FetchProfileEvent());
  }

  @override
  Widget build(BuildContext context) {
    final pages = [TimesheetScreen(), ProfileScreen()];
    return CustomPageScaffold(
      removeBottomSafeArea: true,
      showBottomNavBar: true,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (index) {
          setState(() {
            currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.clock),
            label: 'Timesheets',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.person),
            label: 'Profile',
          ),
        ],
      ),
      child: IndexedStack(index: currentIndex, children: pages),
    );
  }
}
