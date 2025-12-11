# 数据库配置与连接管理
import sqlite3
from sqlite3 import Error

# 数据库文件名（自动创建）
DATABASE_NAME = "contacts.db"

def create_connection():
    """创建并返回数据库连接"""
    conn = None
    try:
        # 连接SQLite数据库（文件不存在则自动创建）
        conn = sqlite3.connect(DATABASE_NAME)
        return conn
    except Error as e:
        print(f"数据库连接错误: {e}")
    return conn

def init_database():
    """初始化数据库（创建必要的表）"""
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            # 创建联系人表，添加收藏字段
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT,
                address TEXT,
                is_favorite INTEGER DEFAULT 0
            )
            ''')
            
            # 创建联系方式表，支持多种联系方式
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS contact_methods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contact_id INTEGER NOT NULL,
                method_type TEXT NOT NULL,
                method_value TEXT NOT NULL,
                is_primary INTEGER DEFAULT 0,
                FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE
            )
            ''')
            
            conn.commit()
            print("数据库初始化成功")
        except Error as e:
            print(f"创建表错误: {e}")
        finally:
            conn.close()
    else:
        print("错误！无法创建数据库连接")