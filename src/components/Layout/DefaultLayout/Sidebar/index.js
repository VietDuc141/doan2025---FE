import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import { NavLink } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';
import { publicRoutes } from '~/routes';

const cx = classNames.bind(styles);

function Sidebar() {
    const { user } = useAuth();
    const userMenus = user?.menu || [];

    // Lọc các routes được phép hiển thị trong menu và user có quyền truy cập
    const authorizedMenuItems = publicRoutes.filter(
        route => route.showInMenu && userMenus.includes(route.permission)
    );

    return (
        <aside className={cx('wrapper')}>
            <ul className={cx('sidebar')}>
                {authorizedMenuItems.map((item, index) => (
                    <li key={index}>
                        {item.path === '/' ? (
                            <ul className={cx('section-title')}>
                                <NavLink to="/">
                                    <h3>{item.title}</h3>
                                </NavLink>
                            </ul>
                        ) : (
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => cx('nav-link', { active: isActive })}
                            >
                                {item.title}
                            </NavLink>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default Sidebar;
