import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user/user.entity';
import { Role } from './role/role.entity';
import { Department } from './dept/dept.entity';
import { Menu } from './menu/menu.entity';
import { Dictionary } from './dic/dictionary.entity';
import { Log } from './log/log.entity';

@Controller('api/system')
export class SystemController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Department)
    private deptRepository: Repository<Department>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(Dictionary)
    private dictionaryRepository: Repository<Dictionary>,
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  @Get('user/list')
  async getUserList(@Query() query: any) {
    const [rows, total] = await this.userRepository.findAndCount({
      relations: ['roles'],
      skip: (query.page - 1 || 0) * (query.pageSize || 20),
      take: query.pageSize || 20,
    });

    const formattedRows = rows.map(user => ({
      id: user.id,
      userName: user.userName,
      name: user.name,
      avatar: user.avatar,
      mail: user.mail,
      dept: user.deptId,
      group: user.roles.map(role => role.id),
      groupName: user.roles.map(role => role.label).join(','),
      date: user.createdAt,
    }));

    return {
      code: 200,
      data: {
        total,
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        rows: formattedRows,
      },
      message: '',
    };
  }

  @Get('role/list2')
  async getRoleList(@Query() query: any) {
    const [rows, total] = await this.roleRepository.findAndCount({
      skip: (query.page - 1 || 0) * (query.pageSize || 20),
      take: query.pageSize || 20,
    });

    const formattedRows = rows.map(role => ({
      id: role.id,
      label: role.label,
      alias: role.alias,
      sort: role.sort,
      status: role.status,
      remark: role.remark,
      date: role.createdAt,
    }));

    return {
      code: 200,
      data: {
        total,
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        rows: formattedRows,
      },
      message: '',
    };
  }

  @Get('dept/list')
  async getDeptList() {
    const depts = await this.deptRepository.find();

    const buildTree = (parentId: string | null) => {
      return depts
        .filter(dept => dept.parentId === parentId)
        .map(dept => ({
          id: dept.id,
          parentId: dept.parentId,
          label: dept.label,
          remark: dept.remark,
          status: dept.status,
          sort: dept.sort,
          date: dept.createdAt,
          children: buildTree(dept.id),
        }))
        .filter(dept => dept.children.length > 0 || depts.some(d => d.parentId === dept.id) === false);
    };

    return {
      code: 200,
      data: buildTree(null),
      message: '',
    };
  }

  @Get('menu/my/1.6.1')
  async getMyMenus() {
    const menus = await this.menuRepository.find({
      where: { status: 1 },
      order: { orderNum: 'ASC' },
    });

    const buildTree = (parentId: string | null) => {
      return menus
        .filter(menu => menu.parentId === parentId)
        .map(menu => ({
          name: menu.name,
          path: menu.path,
          component: menu.component,
          meta: {
            title: menu.title,
            icon: menu.icon,
            type: menu.type,
            affix: menu.affix,
            tag: menu.tag,
            hidden: menu.hidden,
            active: menu.active,
            fullpage: menu.fullpage,
          },
          children: buildTree(menu.id),
        }));
    };

    return {
      code: 200,
      data: {
        menu: buildTree(null),
        permissions: ['list.add', 'list.edit', 'list.delete', 'user.add', 'user.edit', 'user.delete'],
        dashboardGrid: ['welcome', 'ver', 'time', 'progress', 'echarts', 'about'],
      },
      message: '',
    };
  }

  @Get('menu/list')
  async getMenuList() {
    const menus = await this.menuRepository.find({
      order: { orderNum: 'ASC' },
    });

    const buildTree = (parentId: string | null) => {
      return menus
        .filter(menu => menu.parentId === parentId)
        .map(menu => ({
          id: menu.id,
          name: menu.name,
          path: menu.path,
          component: menu.component,
          title: menu.title,
          icon: menu.icon,
          type: menu.type,
          parentId: menu.parentId,
          orderNum: menu.orderNum,
          status: menu.status,
          children: buildTree(menu.id),
        }));
    };

    return {
      code: 200,
      data: buildTree(null),
      message: '',
    };
  }

  @Get('dic/tree')
  async getDicTree() {
    const dictionaries = await this.dictionaryRepository.find({
      relations: ['items'],
    });

    const data = dictionaries.map(dict => ({
      id: dict.id,
      code: dict.code,
      name: dict.name,
      children: dict.items?.map(item => ({
        id: item.id,
        code: item.value,
        name: item.name,
      })),
    }));

    return {
      code: 200,
      data,
      message: '',
    };
  }

  @Get('dic/list')
  async getDicList(@Query() query: any) {
    const dict = await this.dictionaryRepository.findOne({
      where: { code: query.code },
      relations: ['items'],
    });

    if (!dict) {
      return {
        code: 200,
        data: [],
        message: '',
      };
    }

    return {
      code: 200,
      data: dict.items?.map(item => ({
        id: item.id,
        name: item.name,
        value: item.value,
      })) || [],
      message: '',
    };
  }

  @Get('log/list')
  async getLogList(@Query() query: any) {
    const [rows, total] = await this.logRepository.findAndCount({
      skip: (query.page - 1 || 0) * (query.pageSize || 20),
      take: query.pageSize || 20,
      order: { createdAt: 'DESC' },
    });

    const formattedRows = rows.map(log => ({
      id: log.id,
      level: log.level,
      name: log.name,
      url: log.url,
      type: log.type,
      code: log.code,
      cip: log.cip,
      user: log.user,
      time: log.time,
    }));

    return {
      code: 200,
      data: {
        total,
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        rows: formattedRows,
      },
      message: '',
    };
  }

  @Get('app/list')
  async getAppList() {
    return {
      code: 200,
      data: [],
      message: '',
    };
  }

  @Get('table/list')
  async getTableList() {
    return {
      code: 200,
      data: [],
      message: '',
    };
  }

  @Get('tasks/list')
  async getTasksList() {
    return {
      code: 200,
      data: [],
      message: '',
    };
  }
}
