# midjourney-proxy-admin

[midjourney-proxy](https://github.com/trueai-org/midjourney-proxy) 的管理后台

# 主要功能

- [x] 支持MJ账号的增删改查功能
- [x] 支持MJ账号的详细信息查询和账号同步操作
- [x] 支持MJ账号的并发队列设置
- [x] 支持MJ的账号settings设置
- [x] 支持MJ的任务查询
- [x] 提供功能齐全的绘图测试页面

# 部署方式

## 1.运行环境

支持 Linux、MacOS、Windows 系统（可在Linux服务器上长期运行)，同时需安装 `node18`。

**(1) 克隆项目代码：**

```bash
git clone https://github.com/trueai-org/midjourney-proxy-webui
cd midjourney-proxy-webui/
```

**(2) 安装依赖 ：**

```bash
yarn
```

## 2.配置

配置文件在根目录的`.env`中：

```shell
# MJ-SERVER
MJ_SERVER=http://127.0.0.1:5229
```

## 3.运行

```
yarn dev
```

