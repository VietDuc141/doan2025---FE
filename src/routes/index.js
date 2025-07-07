import Home from '~/pages/Home';
import Plan from '~/pages/Plan';
import Timeline from '~/pages/Timeline';
import Campaign from '~/pages/Campaign';
import PlayContent from '~/pages/PlayContent';
import User from '~/pages/User';
import Login from '~/pages/Login';
import Play from '~/pages/Play';
import { LoginLayout } from '~/components/Layout';
import { Fragment, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, permission }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    const [redirectTo, setRedirectTo] = useState(null);

    useEffect(() => {
        setRedirectTo(null);
    }, [location.pathname]);

    useEffect(() => {
        if (!isLoading) {
            // Case 1: Not logged in and not on login page
            if (!user && location.pathname !== '/login') {
                toast.error('Vui lòng đăng nhập để tiếp tục!');
                const timer = setTimeout(() => {
                    setRedirectTo('/login');
                }, 2000);
                return () => clearTimeout(timer);
            }

            // Case 2: Logged in but no permission
            if (user && permission && user.menu && !user.menu?.includes(permission)) {
                toast.error('Bạn không có quyền truy cập trang này!');
                const timer = setTimeout(() => {
                    setRedirectTo('/');
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [user, permission, location.pathname, isLoading]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (redirectTo) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // If user is authenticated and has permission, or is accessing login page
    if ((user || location.pathname === '/login') &&
        (!permission || user?.menu?.includes(permission))) {
        return children;
    }

    return <div>Đang chuyển hướng...</div>;
};

const publicRoutes = [
    {
        path: '/',
        component: Home,
        permission: 'dashboard',
        title: 'Bảng Điều Khiển',
        showInMenu: true
    },
    {
        path: '/play',
        component: Play,
        layout: Fragment,
        permission: 'play',
        title: 'Phát Lập Tức',
        showInMenu: true
    },
    {
        path: '/plan',
        component: Plan,
        permission: 'plan',
        title: 'Lên lịch',
        showInMenu: true
    },
    {
        path: '/play-content',
        component: PlayContent,
        permission: 'play-content',
        title: 'Nội dung',
        showInMenu: true
    },
    {
        path: '/timeline',
        component: Timeline,
        permission: 'timeline',
        title: 'Khung giờ phát',
        showInMenu: true
    },
    {
        path: '/campaign',
        component: Campaign,
        permission: 'campaign',
        title: 'Đợt Phát',
        showInMenu: true
    },
    {
        path: '/user',
        component: User,
        permission: 'user',
        title: 'Người sử dụng',
        showInMenu: true
    },
    {
        path: '/login',
        component: Login,
        layout: LoginLayout,
        showInMenu: false
    }
];

// Wrap component với ProtectedRoute nếu cần permission
publicRoutes.forEach(route => {
    const Component = route.component;
    route.component = () => (
        <ProtectedRoute permission={route.permission}>
            <Component />
        </ProtectedRoute>
    );
});

const privateRoutes = [];

export { publicRoutes, privateRoutes };

