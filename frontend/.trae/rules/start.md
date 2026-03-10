
# 开发服务控制规则（按端口精准关闭）

## 1.非测试需要， 禁止自动启动项目

- 执行前端启动命令（如 `npm run dev`，对应 2800 端口）、后端启动命令（如 `npm run start:dev`，对应 3000 端口）前，**必须用户手动确认**，禁止自动执行。
- 涉及的启动命令范围：`npm run dev`、`yarn dev`、`pnpm dev`、`nest start --watch`、`node src/main.js`（可根据你实际的启动命令补充）。

## 2. 如果是测试需要，测试完成后按端口关闭服务

### 前端服务（2800 端口）

- 关闭命令（macOS/Linux）：`lsof -ti:2800 | xargs kill -9`
- 关闭命令（Windows）：`for /f "tokens=5" %a in ('netstat -ano ^| findstr :2800') do taskkill /f /pid %a`

### 后端服务（3000 端口）

- 关闭命令（macOS/Linux）：`lsof -ti:3000 | xargs kill -9`
- 关闭命令（Windows）：`for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %a`

## 3. 执行反馈

- 关闭服务后，自动输出提示：✅ 前端（2800 端口）/后端（3000 端口）服务已精准关闭。
- 若端口无运行服务，输出：ℹ️ 对应端口暂无运行的服务，无需关闭。
