先给玩客云刷一个armbian linux系统。
用USB公对公线,一头连接在玩客云靠近HDMI 的USB口，一头连接在电脑上,玩客云暂时不要通电.电脑上安装好USB_Burning_Tool，运行软件，导入烧录包{包在恩山论坛}，勾选上”擦除flash””擦除bootloader”,点击”开始。
 烧录完毕后记得先点击停止，再关闭软件。
然后我们就可以给玩客云接入网线，再接通电源。接下来的操作都会用远程ssh登陆完成。
首先我们登陆一下路由器的后台，找到玩客云被分配的IP地址
接着我们打开putty，winscp等软件选择ssh连接的方式。填入玩客云的ip地址，端口号默认保持22
首次登录后系统会让我们修改登陆密码，这里我们只需自定义一个密码就可以了。
接着系统还会让我们新建一个账户，这里我们就不需要新账户了直接ctrl+c跳过。
好这样我们就成功登陆到armbian系统。登陆到armbian系统后，第一步我们要做添加国内的镜像源，方便之后的一系列升级和更新。
先输入编辑源文件命令：
```
nano /etc/apt/sources.list
```
然后复制源进去
阿里云镜像站
```
deb http://mirrors.aliyun.com/debian/ bullseye main non-free contrib
deb-src http://mirrors.aliyun.com/debian/ bullseye main non-free contrib
deb http://mirrors.aliyun.com/debian-security/ bullseye-security main
deb-src http://mirrors.aliyun.com/debian-security/ bullseye-security main
deb http://mirrors.aliyun.com/debian/ bullseye-updates main non-free contrib
deb-src http://mirrors.aliyun.com/debian/ bullseye-updates main non-free contrib
deb http://mirrors.aliyun.com/debian/ bullseye-backports main non-free contrib
deb-src http://mirrors.aliyun.com/debian/ bullseye-backports main non-free contrib
```
需要别的源自行网上搜索，编辑好了镜像源以后，我们先分别输入以下两个命令更新armbian系统，粘贴命令后回车运行即可。
```
sudo apt update
sudo apt upgrade
```
接下来两条命令是安装一个armbian-config 的半图形化界面。它可以方便我们做一些选项的设置。
```
apt install ntp
apt install armbian-config
```
接着输入
```
armbian-config
```
打开图形控制台
在这个界面里我们要做两件事情。
更换时区：personal＞timezone 选择亚洲，中国的时区
修改ip获取方式改为static防止ip地址改变对ssh造成影响。（network->ip->static），这样可以把ip地址固定下来。否则打印服务器地址每次重启都会变化的话，下面的客户端都需要重新设置IP。
好了准备工作做完，我们输入命令安装cups打印服务。输入：
```
apt-get install ghostscript
apt-get install dc
apt-get install foomatic-db-engine
apt-get install cups
```
安装完毕后，还需要修改一些cups的参数。输入以下命令进入cups的参数配置：
```
nano /etc/cups/cupsd.conf
修改“localhost”改成“0.0.0.0”，Browsing off改成Browsing on，并在三个地方分别添加Allow all，具体如下
Listen 0.0.0.0:631
Listen /var/run/cups/cups.sock
# Show shared printers on the local network.
Browsing On
BrowseLocalProtocols dnssd
# Default authentication type, when authentication is required…
DefaultAuthType Basic
# Web interface setting…
WebInterface Yes
# Restrict access to the server…
<Location />
Order allow,deny
Allow all
</Location>
# Restrict access to the admin pages…
<Location /admin>
Order allow,deny
Allow all
</Location>
# Restrict access to configuration files…
<Location /admin/conf>
AuthType Default
Require user @SYSTEM
Order allow,deny
Allow all
然后运行命令 重启一下cups的服务。
service cups restart
```
稍等两分钟以后，我们可以试着在网页里用玩客云ip地址+631的端口号登陆cups的服务页面。
我们看到已经成功登陆进去了。说明打印服务器已经搭建好了。
接下来我们先退出web页面，在ssh中添加一下打印机驱动。这里需要打印机有支持的linux驱动。我找到了爱普生、惠普和兄弟驱动包。直接一条命令安装就可以了。
```
高品质打印机驱动合集(支持很多打印机)【apt install printer-driver-gutenprint】
爱普生打印机【apt-get install printer-driver-escpr】
惠普打印机【apt-get install hplip】有些打印机需要安装#sudo hp-plugin -i
兄弟打印机【apt-get install printer-driver-brlaser】
安装好打印机驱动后我们可以在web页面里添加打印机。
打印机添加完毕我们就可以用
http://192.168.0.2:631（服务器IP+端口号）/printers/打印机共享名称
来在windows里添加网络打印机。添加之前最好预先安装好打印机驱动。
其实只要再添加一条命令就可以让局域网里的其他设备自动发现打印机。我们再回到ssh命令行去运行一下。
apt install avahi-daemon
有的机器安装这一个插件就可以了。不过我的机器需要安装完整的三个插件才可以。
运行：
apt -y install avahi-daemon avahi-discover libnss-mdns
最后设置下开机默认启动
systemctl enable cups
systemctl enable avahi-daemon
 ```
完毕
