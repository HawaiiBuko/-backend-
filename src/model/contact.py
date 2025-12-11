# 联系人数据模型
class Contact:
    """联系人模型，用于封装联系人数据"""
    
    def __init__(self, name, phone, email=None, address=None, id=None, is_favorite=0):
        """
        初始化联系人对象
        
        :param id: 联系人ID（自动生成）
        :param name: 联系人姓名（必填）
        :param phone: 联系电话（必填）
        :param email: 电子邮箱（可选）
        :param address: 地址（可选）
        :param is_favorite: 是否收藏（0：未收藏，1：已收藏）
        """
        self.id = id
        self.name = name
        self.phone = phone
        self.email = email
        self.address = address
        self.is_favorite = is_favorite
    
    def to_dict(self):
        """将联系人对象转换为字典（用于JSON序列化）"""
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'is_favorite': self.is_favorite
        }


class ContactMethod:
    """联系方式模型，用于封装多种联系方式"""
    
    def __init__(self, contact_id, method_type, method_value, is_primary=0, id=None):
        """
        初始化联系方式对象
        
        :param id: 联系方式ID（自动生成）
        :param contact_id: 关联的联系人ID
        :param method_type: 联系方式类型（如：phone, email, wechat, qq等）
        :param method_value: 联系方式值
        :param is_primary: 是否为主联系方式（0：否，1：是）
        """
        self.id = id
        self.contact_id = contact_id
        self.method_type = method_type
        self.method_value = method_value
        self.is_primary = is_primary
    
    def to_dict(self):
        """将联系方式对象转换为字典（用于JSON序列化）"""
        return {
            'id': self.id,
            'contact_id': self.contact_id,
            'method_type': self.method_type,
            'method_value': self.method_value,
            'is_primary': self.is_primary
        }