import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';

const cx = classNames.bind(styles);

function Sidebar() {
    return (
        <aside className={cx('wrapper')}>
            <ul className={cx('sidebar')}>
                <ul className={cx('section-title')}>
                    <h3>Bảng Điều Khiển</h3>
                </ul>
                <li>
                    <a href="/plan">Lên lịch</a>
                </li>
                <li>
                    <a href="/timeline">Khung giờ phát</a>
                </li>
                <li>
                    <a href="/campaign">Đợt Phát</a>
                </li>
                <li>
                    <a href="/play-content">Nội dung</a>
                </li>
                <li>
                    <a href="/screen">Màn Hình</a>
                </li>
                <li>
                    <a href="/user">Người sử dụng</a>
                </li>
                <li>
                    <a href="/group-account">Nhóm tài khoản</a>
                </li>
                <li>
                    <a href="/reports">Tất cả báo cáo</a>
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;
