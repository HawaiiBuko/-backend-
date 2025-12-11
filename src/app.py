
from flask import Flask, request, jsonify
from flask_cors import CORS  # 解决跨域问题
from config.database import init_database  # 正确导入数据库初始化函数
from controller.contact_controller import (  # 正确导入控制器函数
    get_all_contacts,
    get_contact_by_id,
    create_contact,
    update_contact,
    delete_contact,
    get_favorite_contacts,
    toggle_favorite,
    get_contact_methods,
    create_contact_method,
    update_contact_method,
    delete_contact_method,
    export_contacts_to_excel,
    import_contacts_from_excel
)

# 初始化Flask应用
app = Flask(__name__)

# 配置CORS（解决跨域预检问题）
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # 允许所有来源（开发环境专用）
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # 包含预检请求方法
        "allow_headers": ["Content-Type", "Authorization"]  # 允许必要的请求头
    }
})

# 初始化数据库（启动时自动创建表）
init_database()

# API路由定义
@app.route('/api/contacts', methods=['GET'])
def api_get_all_contacts():
    """获取所有联系人"""
    contacts = get_all_contacts()
    return jsonify(contacts)

@app.route('/api/contacts/<int:contact_id>', methods=['GET'])
def api_get_single_contact(contact_id):
    """通过ID获取单个联系人"""
    contact = get_contact_by_id(contact_id)
    if contact:
        return jsonify(contact)
    return jsonify({'error': '联系人不存在'}), 404

@app.route('/api/contacts', methods=['POST'])
def api_create_new_contact():
    """创建新联系人"""
    contact_data = request.get_json()
    # 验证必填字段
    if not contact_data or not contact_data.get('name') or not contact_data.get('phone'):
        return jsonify({'error': '姓名和电话为必填项'}), 400
    new_contact = create_contact(contact_data)
    if new_contact:
        return jsonify(new_contact), 201  # 201表示创建成功
    return jsonify({'error': '创建联系人失败'}), 500

@app.route('/api/contacts/<int:contact_id>', methods=['PUT'])
def api_update_existing_contact(contact_id):
    """更新联系人"""
    contact_data = request.get_json()
    if not contact_data or not contact_data.get('name') or not contact_data.get('phone'):
        return jsonify({'error': '姓名和电话为必填项'}), 400
    updated_contact = update_contact(contact_id, contact_data)
    if updated_contact:
        return jsonify(updated_contact)
    return jsonify({'error': '联系人不存在或更新失败'}), 404

@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
def api_delete_existing_contact(contact_id):
    """删除联系人"""
    success = delete_contact(contact_id)
    if success:
        return jsonify({'message': '联系人删除成功'}), 200
    return jsonify({'error': '联系人不存在或删除失败'}), 404

# 收藏功能API
@app.route('/api/contacts/favorites', methods=['GET'])
def api_get_favorite_contacts():
    """获取所有收藏的联系人"""
    contacts = get_favorite_contacts()
    return jsonify(contacts)

@app.route('/api/contacts/<int:contact_id>/favorite', methods=['PUT'])
def api_toggle_favorite(contact_id):
    """切换联系人的收藏状态"""
    contact = toggle_favorite(contact_id)
    if contact:
        return jsonify(contact)
    return jsonify({'error': '联系人不存在'}), 404

# 联系方式API
@app.route('/api/contacts/<int:contact_id>/methods', methods=['GET'])
def api_get_contact_methods(contact_id):
    """获取联系人的所有联系方式"""
    methods = get_contact_methods(contact_id)
    return jsonify(methods)

@app.route('/api/contacts/<int:contact_id>/methods', methods=['POST'])
def api_create_contact_method(contact_id):
    """为联系人创建新的联系方式"""
    method_data = request.get_json()
    if not method_data or not method_data.get('method_type') or not method_data.get('method_value'):
        return jsonify({'error': '联系方式类型和值为必填项'}), 400
    
    new_method = create_contact_method(contact_id, method_data)
    if new_method:
        return jsonify(new_method), 201
    return jsonify({'error': '创建联系方式失败'}), 500

@app.route('/api/contacts/methods/<int:method_id>', methods=['PUT'])
def api_update_contact_method(method_id):
    """更新联系方式"""
    method_data = request.get_json()
    if not method_data or not method_data.get('method_type') or not method_data.get('method_value'):
        return jsonify({'error': '联系方式类型和值为必填项'}), 400
    
    updated_method = update_contact_method(method_id, method_data)
    if updated_method:
        return jsonify(updated_method)
    return jsonify({'error': '联系方式不存在或更新失败'}), 404

@app.route('/api/contacts/methods/<int:method_id>', methods=['DELETE'])
def api_delete_contact_method(method_id):
    """删除联系方式"""
    success = delete_contact_method(method_id)
    if success:
        return jsonify({'message': '联系方式删除成功'}), 200
    return jsonify({'error': '联系方式不存在或删除失败'}), 404

# 导出功能API
@app.route('/api/contacts/export', methods=['GET'])
def api_export_contacts():
    """导出联系人到Excel文件"""
    try:
        excel_file = export_contacts_to_excel()
        return app.response_class(
            excel_file.read(),
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={
                'Content-Disposition': 'attachment; filename=contacts_export.xlsx'
            }
        )
    except Exception as e:
        return jsonify({'error': f'导出失败: {str(e)}'}), 500

@app.route('/api/contacts/import', methods=['POST'])
def api_import_contacts():
    """从Excel文件导入联系人"""
    if 'file' not in request.files:
        return jsonify({'error': '未找到文件'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400
    
    if file and file.filename.endswith('.xlsx'):
        try:
            success = import_contacts_from_excel(file)
            if success:
                return jsonify({'message': '联系人导入成功'}), 200
            return jsonify({'error': '导入失败'}), 500
        except Exception as e:
            return jsonify({'error': f'导入失败: {str(e)}'}), 500
    
    return jsonify({'error': '只支持.xlsx格式的Excel文件'}), 400

# 处理预检请求（确保跨域配置生效）
@app.route('/api/contacts', methods=['OPTIONS'])
@app.route('/api/contacts/<int:contact_id>', methods=['OPTIONS'])
@app.route('/api/contacts/favorites', methods=['OPTIONS'])
@app.route('/api/contacts/<int:contact_id>/favorite', methods=['OPTIONS'])
@app.route('/api/contacts/<int:contact_id>/methods', methods=['OPTIONS'])
@app.route('/api/contacts/methods/<int:method_id>', methods=['OPTIONS'])
def handle_options():
    return '', 200

# 启动应用
if __name__ == '__main__':
    app.run(debug=True)  # 运行在http://127.0.0.1:5000