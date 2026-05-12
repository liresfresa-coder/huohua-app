\# 火花脑机 App MVP 核心数据表结构



\[cite\_start]第一版遵循最小可用原则，只建立最核心的业务表 \[cite: 613, 614]：



1\. \[cite\_start]\*\*User (用户表)\*\* \[cite: 615]

&#x20;  \* id (主键)

&#x20;  \* \[cite\_start]nickname (昵称) \[cite: 617]

&#x20;  \* \[cite\_start]phone (手机号) \[cite: 618]

&#x20;  \* \[cite\_start]avatar\_url (头像) \[cite: 619]

&#x20;  \* \[cite\_start]created\_at (注册时间) \[cite: 620]



2\. \[cite\_start]\*\*Course (课程表)\*\* \[cite: 625]

&#x20;  \* id (主键)

&#x20;  \* \[cite\_start]title (课程标题) \[cite: 627]

&#x20;  \* \[cite\_start]cover\_url (封面图) \[cite: 629]

&#x20;  \* \[cite\_start]is\_published (是否上架) \[cite: 631]



3\. \[cite\_start]\*\*Lesson (章节表)\*\* \[cite: 634]

&#x20;  \* id (主键)

&#x20;  \* \[cite\_start]course\_id (关联课程表) \[cite: 636]

&#x20;  \* \[cite\_start]title (节次名称) \[cite: 637]

&#x20;  \* \[cite\_start]media\_url (音视频地址) \[cite: 639]

&#x20;  \* \[cite\_start]duration (时长) \[cite: 640]



4\. \[cite\_start]\*\*Progress (学习进度表)\*\* \[cite: 643]

&#x20;  \* id (主键)

&#x20;  \* \[cite\_start]user\_id (关联用户表) \[cite: 644]

&#x20;  \* \[cite\_start]lesson\_id (关联章节表) \[cite: 646]

&#x20;  \* \[cite\_start]is\_completed (是否学完) \[cite: 648]



5\. \[cite\_start]\*\*TrainingRecord (训练记录表)\*\* \[cite: 650]

&#x20;  \* id (主键)

&#x20;  \* \[cite\_start]user\_id (关联用户表) \[cite: 652]

&#x20;  \* \[cite\_start]duration\_minutes (训练时长) \[cite: 654]

&#x20;  \* \[cite\_start]created\_at (完成时间) \[cite: 657]



6\. \[cite\_start]\*\*PrivateEntry (私域配置表)\*\* \[cite: 664]

&#x20;  \* id (主键)

&#x20;  \* \[cite\_start]name (入口名称，如"联系老师") \[cite: 666]

&#x20;  \* \[cite\_start]link\_url (跳转链接/二维码地址) \[cite: 669]

&#x20;  \* \[cite\_start]is\_active (是否启用开关) \[cite: 670]

