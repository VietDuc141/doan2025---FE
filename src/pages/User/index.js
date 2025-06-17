import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './User.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync,} from '@fortawesome/free-solid-svg-icons';
import AddUserModal from './AddUserModal';

const cx = classNames.bind(styles);

const columns = [
    { key: 'username', label: 'Tên người dùng', sortable: true },
    { key: 'status', label: 'Trạng chủ', sortable: true },
    { key: 'homeFolder', label: 'Thư mục cá nhân', sortable: true },
    { key: 'email', label: 'Thư điện tử', sortable: true },
    { key: 'libraryQuota', label: 'Hạn ngạch Thư viện', sortable: true },
    { key: 'lastLogin', label: 'Lần đăng nhập cuối', sortable: true },
    { key: 'loggedIn', label: 'Đã đăng nhập?', sortable: true },
    { key: 'retired', label: 'Ngưng sử dụng', sortable: true },
    { key: 'actions', label: 'Row Menu', sortable: false },
];

function User() {
    const [filters, setFilters] = useState({
        username: '',
        userType: 'Group Admin',
        retired: 'No',
        firstName: '',
        lastName: '',
    });
    const [showAddModal, setShowAddModal] = useState(false);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddUser = () => {
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
    };

    return (
        <div className={cx('user')}>
            <div className={cx('header')}>
                <h2>Người sử dụng</h2>
                <div className={cx('actions')}>
                    <button className={cx('add')} onClick={handleAddUser}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm người dùng
                    </button>
                    <button className={cx('refresh')}>
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                </div>
            </div>

            <div className={cx('filter-section')}>
                <div className={cx('filter-form')}>
                    <div className={cx('form-group')}>
                        <label>Tên người dùng</label>
                        <div className={cx('input-group')}>
                            <input type="text" name="username" value={filters.username} onChange={handleFilterChange} />
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Người dùng Định nghĩa</label>
                        <div className={cx('input-group')}>
                            <select name="userType" value={filters.userType} onChange={handleFilterChange}>
                                <option value="Group Admin">Group Admin</option>
                                <option value="User">User</option>
                            </select>
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Ngưng sử dụng</label>
                        <div className={cx('input-group')}>
                            <select name="retired" value={filters.retired} onChange={handleFilterChange}>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Tên</label>
                        <div className={cx('input-group')}>
                            <input
                                type="text"
                                name="firstName"
                                value={filters.firstName}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Họ</label>
                        <div className={cx('input-group')}>
                            <input type="text" name="lastName" value={filters.lastName} onChange={handleFilterChange} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx('table-section')}>
                <div className={cx('table-controls')}>
                    <div className={cx('entries')}>
                        Show
                        <select>
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                            <option>100</option>
                        </select>
                        entries
                    </div>
                    <div className={cx('table-buttons')}>
                        <button>Chọn cột hiển thị</button>
                    </div>
                </div>

                <div className={cx('table-wrapper')}>
                    <table className={cx('user-table')}>
                        <thead>
                            <tr>
                                {columns.map((column) => (
                                    <th key={column.key} className={cx({ sortable: column.sortable })}>
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={columns.length} className={cx('no-data')}>
                                    No data available in table
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className={cx('table-footer')}>
                    <div className={cx('showing-entries')}>Hiển thị 0 đến 0 trong tổng số 0 mục</div>
                    <div className={cx('pagination')}>
                        <button disabled>Previous</button>
                        <button disabled>Tiếp</button>
                    </div>
                </div>
            </div>

            {showAddModal && <AddUserModal onClose={handleCloseModal} />}
        </div>
    );
}

export default User;
