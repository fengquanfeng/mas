import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { DicModule } from './dic/dic.module';
import { SystemController } from './system.controller';
import { User } from './user/user.entity';
import { Role } from './role/role.entity';
import { Department } from './dept/dept.entity';
import { Menu } from './menu/menu.entity';
import { Dictionary } from './dic/dictionary.entity';
import { DictionaryItem } from './dic/dictionary-item.entity';
import { Log } from './log/log.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Role, Department, Menu, Dictionary, DictionaryItem, Log]),
    AuthModule,
    DicModule,
  ],
  controllers: [SystemController],
  providers: [],
})
export class AppModule {

  // async onModuleInit() {
  //   await this.initializeData();
  // }

  // async initializeData() {
  //   // 初始化部门
  //   const deptCount = await this.deptRepository.count();
  //   if (deptCount === 0) {
  //     const depts = [
  //       { id: '1', label: '华南分部', parentId: null, remark: '', status: 1, sort: 1 },
  //       { id: '11', label: '售前客服部', parentId: '1', remark: '', status: 1, sort: 2 },
  //       { id: '12', label: '技术研发部', parentId: '1', remark: '软件开发&测试', status: 0, sort: 3 },
  //       { id: '2', label: '华东分部', parentId: null, remark: '', status: 1, sort: 4 },
  //       { id: '21', label: '售前客服部', parentId: '2', remark: '', status: 1, sort: 5 },
  //       { id: '22', label: '技术研发部', parentId: '2', remark: '', status: 1, sort: 6 },
  //     ];
  //     for (const dept of depts) {
  //       await this.deptRepository.save(this.deptRepository.create(dept));
  //     }
  //   }

  //   // 初始化角色
  //   const roleCount = await this.roleRepository.count();
  //   if (roleCount === 0) {
  //     const roles = [
  //       { id: '1', label: '超级管理员', alias: 'SA', sort: 1, status: '1', remark: '内置超级管理员角色' },
  //       { id: '2', label: '业务管理员', alias: 'Business Administrator', sort: 2, status: '1', remark: '' },
  //       { id: '3', label: '文章管理员', alias: 'Article administrator', sort: 3, status: '0', remark: '' },
  //       { id: '4', label: '发布人员', alias: 'publish', sort: 4, status: '1', remark: '' },
  //     ];
  //     for (const role of roles) {
  //       await this.roleRepository.save(this.roleRepository.create(role));
  //     }
  //   }

  //   // 初始化菜单
  //   const menuCount = await this.menuRepository.count();
  //   if (menuCount === 0) {
  //     const menus = [
  //       { id: '1', name: 'home', path: '/home', component: undefined, title: '首页', icon: 'el-icon-eleme-filled', type: 'menu', parentId: undefined, orderNum: 1, status: 1 },
  //       { id: '1-1', name: 'dashboard', path: '/dashboard', component: 'home', title: '控制台', icon: 'el-icon-menu', type: 'menu', parentId: '1', orderNum: 1, status: 1, affix: true },
  //       { id: '1-2', name: 'userCenter', path: '/usercenter', component: 'userCenter', title: '帐号信息', icon: 'el-icon-user', type: 'menu', parentId: '1', orderNum: 2, status: 1, tag: 'NEW' },
  //       { id: '2', name: 'vab', path: '/vab', component: undefined, title: '组件', icon: 'el-icon-takeaway-box', type: 'menu', parentId: undefined, orderNum: 2, status: 1 },
  //       { id: '3', name: 'setting', path: '/setting', component: undefined, title: '配置', icon: 'el-icon-setting', type: 'menu', parentId: undefined, orderNum: 10, status: 1 },
  //       { id: '3-1', name: 'user', path: '/setting/user', component: 'setting/user', title: '用户管理', icon: 'el-icon-user-filled', type: 'menu', parentId: '3', orderNum: 1, status: 1 },
  //       { id: '3-2', name: 'role', path: '/setting/role', component: 'setting/role', title: '角色管理', icon: 'el-icon-notebook', type: 'menu', parentId: '3', orderNum: 2, status: 1 },
  //       { id: '3-3', name: 'dept', path: '/setting/dept', component: 'setting/dept', title: '部门管理', icon: 'sc-icon-organization', type: 'menu', parentId: '3', orderNum: 3, status: 1 },
  //       { id: '3-4', name: 'menu', path: '/setting/menu', component: 'setting/menu', title: '菜单管理', icon: 'el-icon-fold', type: 'menu', parentId: '3', orderNum: 4, status: 1 },
  //       { id: '3-5', name: 'dic', path: '/setting/dic', component: 'setting/dic', title: '字典管理', icon: 'el-icon-document', type: 'menu', parentId: '3', orderNum: 5, status: 1 },
  //       { id: '3-6', name: 'log', path: '/setting/log', component: 'setting/log', title: '系统日志', icon: 'el-icon-warning', type: 'menu', parentId: '3', orderNum: 6, status: 1 },
  //     ];
  //     for (const menu of menus) {
  //       await this.menuRepository.save(this.menuRepository.create(menu));
  //     }
  //   }

  //   // 初始化字典
  //   const dictCount = await this.dictionaryRepository.count();
  //   if (dictCount === 0) {
  //     const dicts = [
  //       { id: '1', name: '通知类型', code: 'notice' },
  //       { id: '2', name: '性别', code: 'sex' },
  //       { id: '3', name: '菜单类型', code: 'menuCategory' },
  //       { id: '4', name: '用户类型', code: 'userType' },
  //     ];
  //     for (const dict of dicts) {
  //       await this.dictionaryRepository.save(this.dictionaryRepository.create(dict));
  //     }

  //     // 字典项
  //     const items = [
  //       { id: '41', dictionaryId: '4', name: 'Desktop', value: 'userTypePC', orderNum: 1, status: 1 },
  //       { id: '42', dictionaryId: '4', name: 'Mobile', value: 'userTypeAPP', orderNum: 2, status: 1 },
  //     ];
  //     for (const item of items) {
  //       await this.dictionaryItemRepository.save(this.dictionaryItemRepository.create(item));
  //     }
  //   }

  //   // 初始化管理员用户
  //   const userCount = await this.userRepository.count();
  //   if (userCount === 0) {
  //     const role = await this.roleRepository.findOne({ where: { id: '1' } });
  //     const password = await bcrypt.hash('e10adc3949ba59abbe56e057f20f883e', 10);
  //     const user = this.userRepository.create({
  //       id: '1',
  //       userName: 'admin',
  //       name: '管理员',
  //       password,
  //       avatar: 'img/avatar.jpg',
  //       mail: 'admin@example.com',
  //       deptId: '1',
  //       status: 1,
  //       roles: role ? [role] : [],
  //     });
  //     await this.userRepository.save(user);
  //   }

  //   // 初始化日志
  //   const logCount = await this.logRepository.count();
  //   if (logCount === 0) {
  //     const logs = [
  //       { id: '210000200807261646', level: 'error', name: '用户登录', url: '/oauth/token', type: 'GET', code: '401', cip: '194.66.51.19', user: '赵平', time: new Date('1995-12-27 08:55:12') },
  //       { id: '130000202011067441', level: 'warn', name: '用户登录', url: '/oauth/token', type: 'POST', code: '401', cip: '38.66.223.227', user: '赵霞', time: new Date('2018-12-13 16:13:23') },
  //       { id: '610000201912102208', level: 'warn', name: '用户登录', url: '/oauth/token', type: 'POST', code: '200', cip: '98.115.74.22', user: '姜娜', time: new Date('2004-01-01 20:21:28') },
  //     ];
  //     for (const log of logs) {
  //       await this.logRepository.save(this.logRepository.create(log));
  //     }
  //   }
  // }
}
