-- MAS 数据库修复脚本
-- 修复字典表和字典项表的外键约束问题
-- 问题：dictionary_items.dictionaryId 从 varchar 改为 int 后，外键约束失败

USE mas;

-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 直接删除旧表（因为数据类型变更较大，需要重新创建）
DROP TABLE IF EXISTS dictionary_items;
DROP TABLE IF EXISTS dictionaries;

-- 2. 重新创建字典表（使用 int 自增 ID）
CREATE TABLE dictionaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 重新创建字典项表（使用 int 类型的外键）
CREATE TABLE dictionary_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dictionaryId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(100) NOT NULL,
    orderNum INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dictionaryId (dictionaryId),
    CONSTRAINT fk_dictionary_items_dictionary FOREIGN KEY (dictionaryId) REFERENCES dictionaries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 插入字典数据
INSERT INTO dictionaries (id, name, code) VALUES
(1, '通知类型', 'notice'),
(2, '性别', 'sex'),
(3, '菜单类型', 'menuCategory'),
(4, '用户类型', 'userType');

-- 5. 插入字典项数据
INSERT INTO dictionary_items (dictionaryId, name, value, orderNum, status) VALUES
(4, 'Desktop', 'userTypePC', 1, 1),
(4, 'Mobile', 'userTypeAPP', 2, 1);

-- 启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 完成
SELECT 'MAS 数据库修复完成' AS message;
