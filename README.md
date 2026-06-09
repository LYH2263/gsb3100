# 货物管理系统 (Goods Management System)

一个功能完善的货物管理系统网站，支持货物录入、库存监控、出入库记录、数据分析及 Excel 导出。

## 🛠 技术栈
- **Frontend**: React + Vite + Tailwind CSS + Ant Design
- **Backend**: Spring Boot 3 + MyBatis Plus + MySQL
- **Tooling**: Docker, EasyExcel, ECharts (Recharts)

## How to Run (必须是 docker compose up)
1. 确保 Docker Desktop 已启动。
2. 在项目根目录执行：
   ```bash
   docker compose up --build
   ```
3. 等待容器启动完成（首次构建可能需要几分钟，取决于网络速度）。

## Services (列出访问地址，如 http://localhost:3000)
- **Frontend**: [http://localhost:3100](http://localhost:3100)
- **Backend Swagger**: [http://localhost:8100/docs](http://localhost:8100/docs)
- **Database**: `localhost:3306` (user: `root` / pass: `root`)

## 🧪 测试账号
- **Admin**: `admin` / `123456`
- **User**: `user` / `123456`

## Verification (简述如何通过 3-5 个步骤验证核心功能)
1. **登录系统**: 使用 `admin / 123456` 进入控制台，查看实时库存统计。
2. **货物管理**: 在“货物管理”页面尝试新增货物，并进行搜索和筛选。
3. **出入库操作**: 点击货物操作栏的“入库”或“出库”，输入数量后观察库存变化。
4. **批量操作**: 勾选多个货物，测试批量删除功能（请注意：删除前会有 UI 确认弹窗）。
5. **数据导出**: 点击“导出数据”按钮，下载包含所有货物信息的 Excel 文件。
6. **记录审计**: 在“出入库记录”页面查看刚才的操作历史。
7. **操作日志**: 进入“操作日志”页面，验证系统是否记录了登录、出入库、导出等关键行为。

## 🐳 Docker 镜像源配置
项目已配置淘宝镜像源 (npm) 和阿里云镜像源 (Maven) 以加速镜像构建过程。
