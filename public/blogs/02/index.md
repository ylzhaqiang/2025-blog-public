unraid rclone使用 linux通用
用AList挂载webdav，再配置rclone config文件
打开unraid命令行，输入rclone config
![](/blogs/02/1a3bc7c4dcb13d71.jpg)
选择n，新建一个remote，输入name
![](/blogs/02/737c65946338e48a.jpg)
Storage选择45!即webdav 输入本地地址或者自己的域名，地址要写全，例如http://192.168.8.6:5244/dav/aliyun，
vendor选择5.other.然后填写用户名，如admin，密码password同理，bearer_token不用输入直接回车
![](/blogs/02/4d48b2fc8e00f4f1.jpg)
vanced config编辑高级配置也直接回车默认，全部配置完毕之后再确认一遍，没有问题选择y保存，之后选择q退出config配置”
![](/blogs/02/d5f7366b4f107e04.jpg)
检查是否配置是否正确
在终端输入rclone lsd backup[刚才config配置的name]
出现了对应目录文件则代表配置正确
 
样例
```
1,复制本地 /mnt/user/webdav 到远程目录/home 下，已经存在的文件会被跳过
rclone copy /mnt/user/webdav remote:/home
2,复制完成后删除
rclone move /mnt/user/webdav remote:/home
3,同步使远程 /home 和本地 /mnt/user/webdav 保持一致，不会修改本地文件
rclone sync /mnt/user/webdav remote:/home
 ```
需要注意的是，同步命令有两个：
sync 是单向同步，只会修改目标，不会修改源目录。
假如你在本地删除了其中的文件，那么远程对应的文件也会被删除（如果不想这样，可以用 copy 命令）
假如是远程文件被删除，只要本地文件还在，rclone sync 会再次把此文件推到远程。
 
bisync 才是直觉上的双向同步。 暂时没用到。详细可以查看官方文档。
 ```
自动同步,通过 User Scripts 这个插件可实现的定时任务。
添加定时任务：
cd /boot/config/plugins/user.scripts/scripts
创建一个目录（直接 copy 其他任务更方便），新建一个文件 script，注意没有后缀名，写入以下内容：
实例目录改自己的
!/bin/bash rclone sync /mnt/user/webdav/Z aliyun:/home
 打包boot文件
tar -czvf /mnt/user/webdav/boot/boot.tar.gz /boot
复制到云盘
rclone copy /mnt/user/webdav/boot/boot.tar.gz aliyun:tools
合并
tar -czvf /mnt/user/data/backup/boot/boot.tar.gz /boot && rclone copy /mnt/user/webdav/boot/boot.tar.gz aliyun:tools
 ```
完毕
