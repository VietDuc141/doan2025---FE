import Home from '~/pages/Home';
import Plan from '~/pages/Plan';
import Timeline from '~/pages/Timeline';
import Campaign from '~/pages/Campaign';
import PlayContent from '~/pages/PlayContent';
import Screen from '~/pages/Screen';
import User from '~/pages/User';
import GroupAccount from '~/pages/GroupAccount';
import Login from '~/pages/Login';
import Play from '~/pages/Play';
import { LoginLayout } from '~/components/Layout';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/plan', component: Plan },
    { path: '/timeline', component: Timeline },
    { path: '/campaign', component: Campaign },
    { path: '/play-content', component: PlayContent },
    { path: '/screen', component: Screen },
    { path: '/user', component: User },
    { path: '/group-account', component: GroupAccount },
    { path: '/login', component: Login, layout: LoginLayout },
    { path: '/play', component: Play },
];
const privateRoutes = [];

export { publicRoutes, privateRoutes };
