import { MenuTapList, MenuTapType } from '../types';

export const menuTapList: MenuTapList = [
  {
    type: MenuTapType.DEFAULT,
    title: 'MAIN',
    href: '/',
  },
  {
    type: MenuTapType.DEFAULT,
    title: 'FAQ',
    href: '/FAQ',
  },
  {
    type: MenuTapType.DEFAULT,
    title: 'STORE',
    href: '/blog',
  },
  {
    type: MenuTapType.DEFAULT,
    title: '내정보',
    href: '/myinfo',
  },
  {
    type: MenuTapType.SPECIAL,
    title: '신청하기',
    href: '/recruit',
  },
];
