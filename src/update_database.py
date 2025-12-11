import sqlite3

# 连接到数据库
conn = sqlite3.connect('contacts.db')
cursor = conn.cursor()

# 检查contacts表是否存在is_favorite字段
try:
    cursor.execute("SELECT is_favorite FROM contacts LIMIT 1")
    print("contacts表已包含is_favorite字段")
except sqlite3.OperationalError:
    print("contacts表缺少is_favorite字段，正在添加...")
    cursor.execute("ALTER TABLE contacts ADD COLUMN is_favorite INTEGER DEFAULT 0")
    conn.commit()
    print("is_favorite字段添加成功")

# 检查contact_methods表是否存在
try:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='contact_methods'")
    if cursor.fetchone():
        print("contact_methods表已存在")
    else:
        print("contact_methods表不存在，正在创建...")
        cursor.execute('''
            CREATE TABLE contact_methods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contact_id INTEGER NOT NULL,
                method_type TEXT NOT NULL,
                method_value TEXT NOT NULL,
                is_primary INTEGER DEFAULT 0,
                FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE
            )
        ''')
        conn.commit()
        print("contact_methods表创建成功")
except Exception as e:
    print(f"检查或创建contact_methods表时出错: {e}")

# 关闭连接
conn.close()
print("数据库检查和更新完成")