import 'package:flutter/widgets.dart';

import '../../../../app/theme/theme.dart';

class AuthScreenTitle extends StatelessWidget {
  final String title;
  final String? subTitle;
  const AuthScreenTitle({super.key, required this.title, this.subTitle});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        Text(title, style: context.headlineSmall?.copyWith(color: kTextColor)),
        SizedBox(width: 5),
        Text(subTitle ?? '', style: context.headlineSmall),
      ],
    );
  }
}
