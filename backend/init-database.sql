-- MAS 数据库初始化脚本
-- 基于 SCUI 前端 mock 数据生成

-- 创建数据库
CREATE DATABASE IF NOT EXISTS mas DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mas;

-- 1. 部门表 (departments)
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    parentId VARCHAR(50) NULL,
    remark VARCHAR(255) NULL,
    status TINYINT DEFAULT 1,
    sort INT DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parentId (parentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入部门数据
INSERT INTO departments (id, label, parentId, remark, status, sort, createdAt) VALUES
('1', '华南分部', NULL, '', 1, 1, '2022-10-10 08:00:00'),
('11', '售前客服部', '1', '', 1, 2, '2022-10-10 08:00:00'),
('12', '技术研发部', '1', '软件开发&测试', 0, 3, '2022-10-10 08:00:00'),
('2', '华东分部', NULL, '', 1, 4, '2022-10-10 08:00:00'),
('21', '售前客服部', '2', '', 1, 5, '2022-10-10 08:00:00'),
('22', '技术研发部', '2', '', 1, 6, '2022-10-10 08:00:00');

-- 2. 角色表 (roles)
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    alias VARCHAR(100) NULL,
    sort INT DEFAULT 0,
    status VARCHAR(1) DEFAULT '1',
    remark VARCHAR(255) NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入角色数据
INSERT INTO roles (id, label, alias, sort, status, remark, createdAt) VALUES
('1', '超级管理员', 'SA', 1, '1', '内置超级管理员角色', '2020-05-07 09:30:00'),
('2', '业务管理员', 'Business Administrator', 2, '1', '', '2020-05-07 09:30:00'),
('3', '文章管理员', 'Article administrator', 3, '0', '', '2020-05-07 09:30:00'),
('4', '发布人员', 'publish', 4, '1', '', '2020-05-07 09:30:00');

-- 3. 用户表 (users)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    userName VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    avatar VARCHAR(255) NULL,
    mail VARCHAR(100) NULL,
    deptId VARCHAR(50) NULL,
    status TINYINT DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_deptId (deptId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入用户数据 (密码: 123456 的 MD5: e10adc3949ba59abbe56e057f20f883e 的 bcrypt 哈希)
-- bcrypt hash of 'e10adc3949ba59abbe56e057f20f883e'
INSERT INTO users (id, userName, name, password, avatar, mail, deptId, status, createdAt) VALUES
('1', 'admin', '管理员', '$2b$10$aJGh8Vpff1CB0XFIWDYGauS33YIHk8HFSIfBYQPvlQA4XXIxdBRYS', 'img/avatar.jpg', 'admin@example.com', '1', 1, '2021-10-10 12:00:00'),
('100', 'sakuya', 'sakuya', '$2b$10$aJGh8Vpff1CB0XFIWDYGauS33YIHk8HFSIfBYQPvlQA4XXIxdBRYS', 'img/avatar.jpg', '81883387@qq.com', '11', 1, '2021-10-10 12:00:00'),
('101', 'luhkpev', 'John Martinez', '$2b$10$aJGh8Vpff1CB0XFIWDYGauS33YIHk8HFSIfBYQPvlQA4XXIxdBRYS', 'img/avatar3.gif', 'k.luhkpev@zdgtfd.ma', '22', 1, '2021-02-21 14:21:48');

-- 4. 用户角色关联表 (user_roles)
DROP TABLE IF EXISTS user_roles;
CREATE TABLE user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(50) NOT NULL,
    roleId VARCHAR(50) NOT NULL,
    UNIQUE KEY uk_user_role (userId, roleId),
    INDEX idx_userId (userId),
    INDEX idx_roleId (roleId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入用户角色关联数据
INSERT INTO user_roles (userId, roleId) VALUES
('1', '1'),
('100', '1'),
('101', '2'),
('101', '4');

-- 5. 菜单表 (menus)
DROP TABLE IF EXISTS menus;
CREATE TABLE menus (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    path VARCHAR(255) NOT NULL,
    component VARCHAR(255) NULL,
    title VARCHAR(100) NULL,
    icon VARCHAR(50) NULL,
    type VARCHAR(20) DEFAULT 'menu',
    affix BOOLEAN DEFAULT FALSE,
    tag VARCHAR(50) NULL,
    hidden BOOLEAN DEFAULT FALSE,
    active VARCHAR(255) NULL,
    fullpage BOOLEAN DEFAULT FALSE,
    parentId VARCHAR(50) NULL,
    orderNum INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parentId (parentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入菜单数据
INSERT INTO menus (id, name, path, component, title, icon, type, parentId, orderNum, status, affix, tag) VALUES
('1', 'home', '/home', NULL, '首页', 'el-icon-eleme-filled', 'menu', NULL, 1, 1, FALSE, NULL),
('1-1', 'dashboard', '/dashboard', 'home', '控制台', 'el-icon-menu', 'menu', '1', 1, 1, TRUE, NULL),
('1-2', 'userCenter', '/usercenter', 'userCenter', '帐号信息', 'el-icon-user', 'menu', '1', 2, 1, FALSE, 'NEW'),
('2', 'vab', '/vab', NULL, '组件', 'el-icon-takeaway-box', 'menu', NULL, 2, 1, FALSE, NULL),
('3', 'setting', '/setting', NULL, '配置', 'el-icon-setting', 'menu', NULL, 10, 1, FALSE, NULL),
('3-1', 'user', '/setting/user', 'setting/user', '用户管理', 'el-icon-user-filled', 'menu', '3', 1, 1, FALSE, NULL),
('3-2', 'role', '/setting/role', 'setting/role', '角色管理', 'el-icon-notebook', 'menu', '3', 2, 1, FALSE, NULL),
('3-3', 'dept', '/setting/dept', 'setting/dept', '部门管理', 'sc-icon-organization', 'menu', '3', 3, 1, FALSE, NULL),
('3-4', 'menu', '/setting/menu', 'setting/menu', '菜单管理', 'el-icon-fold', 'menu', '3', 4, 1, FALSE, NULL),
('3-5', 'dic', '/setting/dic', 'setting/dic', '字典管理', 'el-icon-document', 'menu', '3', 5, 1, FALSE, NULL),
('3-6', 'log', '/setting/log', 'setting/log', '系统日志', 'el-icon-warning', 'menu', '3', 6, 1, FALSE, NULL);

-- 6. 角色菜单关联表 (role_menus)
DROP TABLE IF EXISTS role_menus;
CREATE TABLE role_menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roleId VARCHAR(50) NOT NULL,
    menuId VARCHAR(50) NOT NULL,
    UNIQUE KEY uk_role_menu (roleId, menuId),
    INDEX idx_roleId (roleId),
    INDEX idx_menuId (menuId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入角色菜单关联数据 (超级管理员拥有所有菜单)
INSERT INTO role_menus (roleId, menuId) VALUES
('1', '1'), ('1', '1-1'), ('1', '1-2'), ('1', '2'), ('1', '3'),
('1', '3-1'), ('1', '3-2'), ('1', '3-3'), ('1', '3-4'), ('1', '3-5'), ('1', '3-6');

-- 7. 字典表 (dictionaries)
DROP TABLE IF EXISTS dictionaries;
CREATE TABLE dictionaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入字典数据
INSERT INTO dictionaries (id, name, code) VALUES
(1, '通知类型', 'notice'),
(2, '性别', 'sex'),
(3, '菜单类型', 'menuCategory'),
(4, '用户类型', 'userType');

-- 8. 字典项表 (dictionary_items)
DROP TABLE IF EXISTS dictionary_items;
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

-- 插入字典项数据
INSERT INTO dictionary_items (id, dictionaryId, name, value, orderNum, status) VALUES
(1, 4, 'Desktop', 'userTypePC', 1, 1),
(2, 4, 'Mobile', 'userTypeAPP', 2, 1);

-- 9. 日志表 (logs)
DROP TABLE IF EXISTS logs;
CREATE TABLE logs (
    id VARCHAR(50) PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NULL,
    type VARCHAR(10) NULL,
    code VARCHAR(10) NULL,
    cip VARCHAR(50) NULL,
    user VARCHAR(100) NULL,
    time DATETIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入日志数据 (示例)
INSERT INTO logs (id, level, name, url, type, code, cip, user, time) VALUES
('210000200807261646', 'error', '用户登录', '/oauth/token', 'GET', '401', '194.66.51.19', '赵平', '1995-12-27 08:55:12'),
('130000202011067441', 'warn', '用户登录', '/oauth/token', 'POST', '401', '38.66.223.227', '赵霞', '2018-12-13 16:13:23'),
('610000201912102208', 'warn', '用户登录', '/oauth/token', 'POST', '200', '98.115.74.22', '姜娜', '2004-01-01 20:21:28');

-- 完成
SELECT 'MAS 数据库初始化完成' AS message;
