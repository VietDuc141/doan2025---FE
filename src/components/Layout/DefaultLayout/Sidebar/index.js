import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import { NavLink } from 'react-router-dom';

const cx = classNames.bind(styles);

function Sidebar() {
    return (
        <aside className={cx('wrapper')}>
            <ul className={cx('sidebar')}>
                <ul className={cx('section-title')}>
                    <a href="/">
                        <h3>Bảng Điều Khiển</h3>
                    </a>
                </ul>
                <li>
                    <NavLink to="/play" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                        Phát Lập Tức
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/plan" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                        Lên lịch
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/play-content" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                        Nội dung
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/timeline" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                        Khung giờ phát
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/campaign" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                        Đợt Phát
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/user" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                        Người sử dụng
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/group-account" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                        Nhóm tài khoản
                    </NavLink>
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;
