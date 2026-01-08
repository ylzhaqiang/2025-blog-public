Fnos Rclone挂载Alis到本地
进入终端，用ROOT用户操作：
因为Fnos rclone 不完整需要重新安装
```
rm -f /usr/bin/rclone #删除系统自带的rclone
cp /vol1/1000/z/rclone /usr/bin #复制新的rclone 到系统目录
chmod +x /usr/bin/rclone #增加可执行权限
rclone config #rclone配置
详细见unraid rclone使用
http://192.168.8.5:5244/dav #挂载链接
rclone lsd z: # 查看配置是否正确
rclone mount z: /vol1/1000/z/alist --header "Referer:" --multi-thread-streams 6 --buffer-size 512M --vfs-fast-fingerprint --vfs-cache-mode full --no-modtime --file-perms 0777 --copy-links --allow-other --allow-non-empty --umask 000 --daemon --cache-dir /vol1/1000/z/cache/rclone #挂载为本地命令，--cache-dir /vol1/1000/z/cache/rclone为缓存路径
fusermount -qzu /vol1/1000/z/alist #卸载挂载命令
nano /etc/systemd/system/zrclone.service #开机启动 添加开机启动脚本内容
添加：
[Unit]
Description=zrclone Service
After=network.target
[Service]
Type=simple
ExecStartPre=-/bin/sleep 30
ExecStart=rclone mount z: /vol1/1000/z/alist --header "Referer:" --multi-thread-streams 6 --buffer-size 512M --vfs-fast-fingerprint --vfs-cache-mode full --no-modtime --file-perms 0777 --copy-links --allow-other --allow-non-empty --umask 000 --cache-dir /vol1/1000/z/cache/rclone
[Install]
WantedBy=default.target
systemctl daemon-reload #更新系统目录
systemctl enable zrclone.service #创建开机快捷方式
systemctl start zrclone.service #启动服务
systemctl status zrclone.service #查看服务
```
完毕
