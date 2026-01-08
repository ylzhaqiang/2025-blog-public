### Docker 常用命令
1. **查看 Docker 版本**
```bash
docker --version
```
2. **拉取镜像**
```bash
docker pull <镜像名>:<标签>
```
例如：
```bash
docker pull nginx:latest
```
3. **查看本地镜像**
```bash
docker images
```
4. **运行容器**
```bash
docker run <选项> <镜像名>
```
例如：
```bash
docker run -d -p 80:80 nginx
```
5. **列出运行中的容器**
```bash
docker ps
```
6. **列出所有容器（包括停止的）**
```bash
docker ps -a
```
7. **停止容器**
```bash
docker stop <容器ID或名称>
```
8. **启动容器**
```bash
docker start <容器ID或名称>
```
9. **删除容器**
```bash
docker rm <容器ID或名称>
```
10. **删除镜像**
```bash
docker rmi <镜像ID或名称>
```
11. **查看容器日志**
```bash
docker logs <容器ID或名称>
```
12. **进入运行中的容器**
```bash
docker exec -it <容器ID或名称> /bin/bash
```
### Docker Compose 常用命令
1. **查看 Docker Compose 版本**
```bash
docker-compose --version
```
2. **启动服务**
```bash
docker-compose up
```
添加 `-d` 可以在后台运行：
```bash
docker-compose up -d
```
3. **停止服务**
```bash
docker-compose down
```
4. **查看服务状态**
```bash
docker-compose ps
```
5. **构建服务**
```bash
docker-compose build
```
6. **重新启动服务**
```bash
docker-compose restart
```
7. **查看服务日志**
```bash
docker-compose logs
```
查看特定服务的日志：
```bash
docker-compose logs <服务名>
```
8. **运行一次性命令**
```bash
docker-compose run <服务名> <命令>
```
例如：
```bash
docker-compose run web bash
```
9. **拉取镜像（根据 `docker-compose.yml` 文件）**
```bash
U-LINK:
docker-compose pull
```
10. **删除服务**
```bash
docker-compose rm
```
