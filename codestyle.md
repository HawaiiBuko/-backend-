

### `codestyle.md`（后端项目根目录）
```markdown
# 后端代码风格规范

## Python 基础规范（遵循 PEP8）
1. **缩进**：使用 4 个空格缩进，禁止使用制表符（Tab）。
2. **行长度**：每行代码不超过 79 个字符，注释和文档字符串不超过 72 个字符。
3. **空行**：函数/类之间用 2 个空行分隔，函数内逻辑块用 1 个空行分隔。
4. **命名规范**：
   - 模块/文件：小写，下划线分隔（如 `contact_controller.py`）。
   - 类：首字母大写，驼峰命名（如 `Contact`）。
   - 函数/变量：小写，下划线分隔（如 `get_contact_by_id`）。
   - 常量：全大写，下划线分隔（如 `DATABASE_NAME`）。

## 代码结构规范
1. **分层设计**：严格遵循 `controller`（控制器）、`model`（模型）、`config`（配置）的目录结构，禁止跨层调用。
2. **数据库操作**：所有数据库操作需通过 `database.py` 封装的连接方法，避免直接在业务逻辑中硬编码 SQL。
3. **错误处理**：数据库操作需包含 `try-except` 块，明确捕获 `sqlite3.Error` 并输出日志，必要时回滚事务。

## 文档规范
1. **函数/类注释**：使用 Google 风格文档字符串，说明功能、参数、返回值和异常。示例：
   ```python
   def get_contact_by_id(contact_id):
       """通过 ID 获取单个联系人
       
       Args:
           contact_id (int): 联系人 ID
       
       Returns:
           dict: 联系人信息字典，若不存在则返回 None
       
       Raises:
           sqlite3.Error: 数据库操作异常
       """