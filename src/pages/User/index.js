import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './User.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faTrash } from '@fortawesome/free-solid-svg-icons';
import AddUserModal from './AddUserModal';

const cx = classNames.bind(styles);

const columns = [
    { key: 'username', label: 'Tên người dùng', sortable: true },
    { key: 'email', label: 'Thư điện tử', sortable: true },
    { key: 'lastLogin', label: 'Lần đăng nhập cuối', sortable: true },
    { key: 'loggedIn', label: 'Đã đăng nhập?', sortable: true },
    { key: 'retired', label: 'Ngưng sử dụng', sortable: true },
];

// Giả lập dữ liệu user
const mockUsers = [
    {
        username: 'admin',
        homeFolder: '/home/admin',
        email: 'admin@example.com',
        lastLogin: '2024-06-01',
        loggedIn: 'Yes',
        retired: 'No',
    },
    {
        username: 'user1',
        homeFolder: '/home/user1',
        email: 'user1@example.com',
        lastLogin: '2024-05-30',
        loggedIn: 'No',
        retired: 'No',
    },
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
    const [users, setUsers] = useState(mockUsers);

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

    // Hàm xóa user theo id
    const handleDeleteUser = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa user này?')) {
            setUsers((prev) => prev.filter((user) => user.id !== id));
        }
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
                                <th>Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className={cx('no-data')}>
                                        No data available in table
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        {columns.map((column) => (
                                            <td key={column.key}>{user[column.key]}</td>
                                        ))}
                                        <td>
                                            <button
                                                className={cx('delete-button')}
                                                title="Xóa user"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
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
