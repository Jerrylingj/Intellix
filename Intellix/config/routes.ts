export default [
  { path: '/user', layout: false, routes: [{ path: '/user/login', component: './User/Login' }] },
  { path: '/', redirect: '/chart/add' },
  { path: '/chart/add', name: '智能分析', icon: 'PieChartTwoTone', component: './AddChart' },
  { path: '/charts', name: '我的图表', icon: 'FundTwoTone', component: './Charts' },
  {
    path: '/admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', name: '管理页面', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', name: '管理页面2', component: './Admin' },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
