docker compose安装mariadb 
```
version: '3.8'      # 使用 Docker Compose 文件的最新版本
   services:           # 定义服务列表
     mariadb:            # 定义名为 mariadb 的服务
     container_name: mariadb         # 为容器指定一个名称
     image: mariadb:latest         # 使用 MariaDB 的最新版镜像
     ports:
        - "3306:3306"             # 将容器的 3306 端口映射到宿主机的 3306 端口，用于数据库连接
     restart: always         # 总是重启容器，确保数据库服务的高可用性
     environment:           # 设置环境变量，用于配置数据库
        MYSQL_ROOT_PASSWORD: 1111          # 设置 root 用户的密码
        MYSQL_DATABASE: USER_DB_NAME        # 创建一个初始数据库
        MYSQL_USER: abc           # 创建一个名为 ABC 的普通用户
        MYSQL_PASSWORD: 1111                 # 设置普通用户的密码
    volumes:                 # 定义卷映射，用于数据持久化
         - /vol1/@appshare/mariadb:/var/lib/mysql        # 将宿主机的目录挂载到容器的数据目录
    network_mode: bridge
```
打控制台“Console“
输入“mysql -u root -p”进入数据库
输入“MYSQL_ROOT_PASSWORD”数据库密码
输入密码是不显示的，输完回车即可
![](/blogs/01/6cad5f196cb373eb.png)
查看数据库“show databases;”注意冒号，不要忘记加“;”，可以按“Ctrl + c”结束输入
![](/blogs/01/1131b7846331e87a.png)
创建数据库“create database 数据库名;”
删除数据库“drop database 数据库名;”

完毕
